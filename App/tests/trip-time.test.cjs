const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {runInNewContext} = require('node:vm');
const ts = require('typescript');

const load = (name, imports = {}) => {
  const exports = {};
  const source = readFileSync(join(__dirname, '..', 'src', name + '.ts'), 'utf8');
  const script = ts.transpile(source, {module: ts.ModuleKind.CommonJS});
  runInNewContext(script, {exports, require: id => imports[id] ?? {}});
  return exports;
};

const {tripTime} = load('driverApi', {'./jalaliDate': load('jalaliDate')});
assert.equal(tripTime('2026-11-13T19:28:00Z'), '۲۲ آبان ۱۴۰۵، ۲۲:۵۸');
assert.equal(tripTime('2026-03-20T21:00:00Z'), '۱ فروردین ۱۴۰۵، ۰۰:۳۰');
assert.equal(tripTime(null), 'زمان مشخص نشده');
