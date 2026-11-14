const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, mocks = {}, globals = {}) {
  const file = path.join(__dirname, '..', relativePath);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => name in mocks ? mocks[name] : require(name),
    setTimeout, clearTimeout, AbortController, Error, TypeError, process: { env: {} }, ...globals,
  }, { filename: file });
  return module.exports;
}

test('Neshan search encodes Persian text and maps x/y to longitude/latitude', async () => {
  let request;
  const api = load('src/services/neshan.ts', {}, { fetch: async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ items: [
      { title: 'آزادی', address: 'تهران، آزادی', location: { x: 51.35, y: 35.7 } },
      { title: 'invalid', location: {} },
    ] }) };
  } });
  const result = await api.searchPlaces('میدان آزادی', { lat: 35, lng: 51 }, 'test-key');
  assert.equal(result.length, 1);
  assert.equal(result[0].lat, 35.7);
  assert.equal(result[0].lng, 51.35);
  assert.equal(new URL(request.url).searchParams.get('term'), 'میدان آزادی');
  assert.equal(request.options.headers['Api-Key'], 'test-key');
});

test('Reverse geocoding returns the address and reports permission/empty response failures', async () => {
  let response = { ok: true, json: async () => ({ status: 'OK', formatted_address: ' تهران، آزادی ' }) };
  const api = load('src/services/neshan.ts', {}, { fetch: async () => response });
  assert.equal(await api.reverseAddress({ lat: 35, lng: 51 }, 'key'), 'تهران، آزادی');
  response = { ok: false, status: 485 };
  await assert.rejects(api.reverseAddress({ lat: 35, lng: 51 }, 'key'), /دسترسی/);
  response = { ok: true, json: async () => ({ status: 'OK', formatted_address: '' }) };
  await assert.rejects(api.reverseAddress({ lat: 35, lng: 51 }, 'key'), /آدرسی پیدا نشد/);
});

test('Deleting and reordering points preserves identity when an address arrives late', () => {
  const state = [];
  let cursor = 0;
  const fakeReact = { useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = index === 1 ? false : initial;
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  }, useEffect() {} };
  const primitives = Object.fromEntries(['View', 'Text', 'TextInput', 'TouchableOpacity', 'ScrollView', 'Switch'].map(name => [name, name]));
  const Home = load('src/screens/HomeScreen.tsx', {
    react: fakeReact,
    'react-native': { ...primitives, StyleSheet: { create: styles => styles } },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '../components/Icon': { Icon: 'Icon' },
    '../components/SplashScreen': { __esModule: true, default: 'SplashScreen' },
    '../components/SaveAddressDialog': { __esModule: true, default: 'SaveAddressDialog' },
    '../components/AppHeader': { __esModule: true, default: 'AppHeader' },
    '../components/BottomNav': { default: 'BottomNav', __esModule: true },
    '../components/NeshanMapPicker': { default: 'MapPicker', __esModule: true },
    '../components/JalaliDatePicker': { default: 'DatePicker', __esModule: true },
    '../components/TimePicker': { default: 'TimePicker', __esModule: true },
    '../components/PointAddress': { default: 'PointAddress', __esModule: true },
    '../utils/tripDateTime': { persianDigits: value => String(value) },
    '../theme': { colors: {}, fonts: {} }, '../storage': {}, '../services/neshan': {},
  }).default;
  function all(node) {
    if (Array.isArray(node)) return node.flatMap(all);
    if (!node || typeof node !== 'object') return [];
    return [node, ...all(node.props?.children)];
  }
  const render = () => { cursor = 0; return all(Home({ navigation: {}, route: {} })); };
  const picker = () => render().find(node => node.type === 'MapPicker').props;
  const press = label => {
    const button = render().find(node => node.props?.accessibilityLabel === label);
    assert.ok(button, label);
    assert.ok(!button.props.disabled);
    button.props.onPress();
  };
  picker().onPointAdd({ id: 'a', lat: 35, lng: 51, label: 'مبدا 1' });
  picker().onPointAdd({ id: 'b', lat: 36, lng: 52, label: 'مبدا 2' });
  const lateUpdate = picker().onPointUpdate;
  press('انتقال مبدا 2 به بالا');
  lateUpdate('a', { address: 'Address A', addressStatus: 'ready' });
  assert.equal(picker().points[0].id, 'b');
  assert.equal(picker().points[1].address, 'Address A');
  // A response for the old location must not overwrite the address after dragging.
  lateUpdate('b', { lat: 37, lng: 53, address: undefined, addressStatus: 'loading' });
  lateUpdate('b', { address: 'Old location', addressStatus: 'ready' }, { lat: 36, lng: 52 });
  assert.equal(picker().points[0].address, undefined);
  assert.equal(picker().points[0].addressStatus, 'loading');
  lateUpdate('b', { address: 'New location', addressStatus: 'ready' }, { lat: 37, lng: 53 });
  assert.equal(picker().points[0].address, 'New location');
  assert.equal(picker().points[0].lat, 37);
  press('حذف مبدا 2');
  lateUpdate('a', { address: 'Removed address' });
  assert.equal(picker().points.length, 1);
  assert.equal(picker().points[0].id, 'b');
  assert.equal(picker().points[0].label, 'مبدا 1');
  press('حذف مبدا 1');
  assert.equal(picker().points.length, 0);
  assert.ok(!render().some(node => node.props?.onPress && all(node).some(child => child.props?.children === 'پایان انتخاب مبدا')));
});
