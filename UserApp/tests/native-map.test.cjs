const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => name in mocks ? mocks[name] : require(name), ...globals });
  return module.exports;
}
const bridge = load('src/components/map/nativeMapBridge.ts');
const { createNativeMapDocument } = load('src/components/map/nativeMapDocument.ts', { './nativeMapBridge': bridge });

function mapRuntime() {
  const messages = [], markers = [], removed = [], focus = [];
  const events = {}, layerEvents = {}, timers = [];
  let zoomOptions, mapOptions, locationMarker;
  const map = { on(name, fn) { events[name] = fn; }, eachLayer(fn) { fn({ on(name, handler) { layerEvents[name] = handler; } }); }, invalidateSize() {},
    getCenter: () => ({ lat: 35, lng: 51 }), removeLayer(marker) { removed.push(marker); },
    setView(position, zoom) { focus.push({ position, zoom }); },
  };
  const L = {
    Map: function(_, options) { mapOptions = options; return map; },
    circleMarker(position, options) {
      locationMarker = { position, options, addTo() { return this; }, setLatLng(next) { this.position = next; } };
      return locationMarker;
    },
    control: { zoom(options) { zoomOptions = options; return { addTo() {} }; } },
    divIcon: options => options,
    marker(position, options) {
      const marker = { position, options, events: {}, element: {},
        addTo: () => marker, on(name, fn) { this.events[name] = fn; },
        getLatLng() { return { lat: this.position[0], lng: this.position[1] }; },
        setLatLng(position) { this.position = position; }, setIcon(icon) { this.icon = icon; }, getElement() { return this.element; },
      };
      markers.push(marker);
      return marker;
    },
  };
  const window = { addEventListener() {}, ReactNativeWebView: { postMessage: text => messages.push(JSON.parse(text)) } };
  const html = createNativeMapDocument('web.test-key');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { window, L, Map, Set,
    setTimeout(fn) { timers.push(fn); return timers.length; }, clearTimeout() {},
  });
  window.initTaxiMap();
  return { window, messages, markers, removed, focus, events, layerEvents, timers, zoomOptions, mapOptions,
    get locationMarker() { return locationMarker; } };
}

test('Current location updates the blue dot without creating a trip stop', () => {
  const runtime = mapRuntime();
  assert.equal(runtime.mapOptions.attributionControl, false);
  runtime.window.updateTaxiMap({ points: [], currentLocation: { lat: 36, lng: 52 } });
  const marker = runtime.locationMarker;
  assert.equal(marker.options.interactive, false);
  runtime.window.updateTaxiMap({ points: [], currentLocation: { lat: 37, lng: 53 } });
  assert.equal(runtime.locationMarker, marker);
  assert.deepEqual(Array.from(marker.position), [37, 53]);
  assert.equal(runtime.markers.length, 0);
  assert.equal(runtime.messages.some(message => message.type === 'add'), false);
});

test('Native map taps add points; dragging sends updated coordinates and preserves marker identity', () => {
  const runtime = mapRuntime();
  assert.equal(runtime.messages[0].type, 'ready');
  assert.equal(runtime.zoomOptions.position, 'bottomright');
  runtime.events.click({ latlng: { lat: 35.5, lng: 51.5 } });
  assert.deepEqual(runtime.messages.at(-1), { type: 'add', lat: 35.5, lng: 51.5 });
  const point = { id: 'origin', lat: 35.5, lng: 51.5, label: 'مبدا 1', color: '#ffd899', number: 1 };
  runtime.window.updateTaxiMap({ points: [point] });
  const marker = runtime.markers[0];
  assert.equal(marker.options.draggable, true);
  marker.events.dragstart();
  marker.position = [36, 52];
  runtime.window.updateTaxiMap({ points: [{ ...point, address: 'Late response' }] });
  assert.deepEqual(marker.position, [36, 52]);
  marker.events.dragend();
  assert.deepEqual(runtime.messages.at(-1), { type: 'move', id: 'origin', lat: 36, lng: 52 });
  runtime.window.updateTaxiMap({ points: [{ ...point, lat: 36, lng: 52, address: 'New address' }] });
  assert.equal(runtime.markers.length, 1);
  assert.match(marker.element.title, /New address/);
  runtime.window.updateTaxiMap({ points: [] });
  assert.equal(runtime.removed[0], marker);
});

test('Search focus moves the map without adding a point; address updates do not reset the camera', () => {
  const runtime = mapRuntime();
  const state = { points: [], focusPoint: { lat: 36, lng: 52 }, focusRevision: 1 };
  runtime.window.updateTaxiMap(state);
  runtime.window.updateTaxiMap({ ...state, points: [{ id: 'end', lat: 36, lng: 52, color: '#1e7a65', number: 1 }] });
  assert.equal(runtime.focus.length, 1);
  assert.equal(runtime.focus[0].zoom, 16);
  assert.equal(runtime.messages.filter(message => message.type === 'add').length, 0);
  runtime.window.updateTaxiMap({ ...state, focusRevision: 2 });
  assert.equal(runtime.focus.length, 2);
});

test('Native bridge validates coordinates and escapes script delimiters in injected data', () => {
  assert.equal(bridge.isCoordinates({ lat: 35, lng: 51 }), true);
  for (const value of [null, {}, { lat: NaN, lng: 51 }, { lat: 91, lng: 51 }, { lat: 35, lng: 181 }]) {
    assert.equal(bridge.isCoordinates(value), false);
  }
  const address = '</script><script>untrusted()</script>\u2028';
  const serialized = bridge.serializeMapData({ address });
  assert.equal(serialized.includes('<'), false);
  assert.equal(JSON.parse(serialized).address, address);
});

test('One failed tile does not obscure a map that successfully loads other tiles', () => {
  const runtime = mapRuntime();
  runtime.layerEvents.tileerror();
  assert.equal(runtime.messages.some(message => message.type === 'error'), false);
  runtime.layerEvents.tileload();
  runtime.timers[0]();
  assert.equal(runtime.messages.at(-1).type, 'tilesReady');
  assert.equal(runtime.messages.some(message => message.type === 'error'), false);
  const offline = mapRuntime();
  offline.layerEvents.tileerror();
  offline.timers[0]();
  assert.equal(offline.messages.at(-1).type, 'error');
});
