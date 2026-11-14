const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {runInNewContext} = require('node:vm');
const ts = require('typescript');

const exportsUnderTest = {};
const source = readFileSync(join(__dirname, '../src/components/offerMapDocument.ts'), 'utf8');
runInNewContext(ts.transpile(source, {module: ts.ModuleKind.CommonJS}), {
  exports: exportsUnderTest,
  process: {env: {}},
});

const {offerMapDocument} = exportsUnderTest;
const fixedMap = offerMapDocument(null, undefined, true, true);
const offerMap = offerMapDocument(null, undefined, true);
for (const interaction of ['zoomControl', 'dragging', 'touchZoom', 'scrollWheelZoom', 'doubleClickZoom', 'boxZoom', 'keyboard']) {
  assert.ok(fixedMap.includes(interaction + ':false'), interaction);
  assert.ok(!offerMap.includes(interaction + ':false'), interaction);
}
