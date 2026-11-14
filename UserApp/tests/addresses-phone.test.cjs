const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
function load(file, mocks = {}) {
 const module = { exports: {} };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText,
 { module, exports: module.exports, Error, require: name => name in mocks ? mocks[name] : require(name) });
 return module.exports;
}
function all(node) { return Array.isArray(node) ? node.flatMap(all) : !node || typeof node !== 'object' ? [] : [node, ...all(node.props?.children)]; }
function harness() {
 const state = []; let cursor = 0;
 return { react: { useEffect() {}, useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; } }, reset() { cursor = 0; } };
}
const native = { ...Object.fromEntries(['Modal', 'View', 'Text', 'TextInput', 'TouchableOpacity', 'KeyboardAvoidingView'].map(name => [name, name])), StyleSheet: { create: styles => styles }, Platform: { OS: 'web' } };
test('Mobile input accepts ten digits, Persian digits and pasted prefixes; API receives domestic form', () => {
 const { mobileDigits, domesticMobile } = load('src/utils/phone.ts');
 for (const value of ['9123456789', '09123456789', '+98 912 345 6789', '00989123456789', '۹۱۲۳۴۵۶۷۸۹', '٩١٢٣٤٥٦٧٨٩']) assert.equal(domesticMobile(mobileDigits(value)), '09123456789');
 assert.equal(mobileDigits('9891234567'), '9891234567');
 for (const value of ['', '912', '8123456789', '09123456789']) assert.equal(domesticMobile(value), null);
});
test('Saving a named map point uses the existing favorites API; failures keep the dialog open', async () => {
 const h = harness(); const calls = []; let closed = 0, refreshed = 0, fail = false;
 const Dialog = load('src/components/SaveAddressDialog.tsx', { react: h.react, 'react-native': native,
 '../theme': { colors: {}, fonts: {} }, './ScreenPage': { ui: {} }, '../services/passenger': { passengerApi: { saveFavorite: async (...args) => { calls.push(args); if (fail) throw new Error('network unavailable'); } } } }).default;
 const point = { lat: 35.7, lng: 51.4, address: 'Tehran' };
 const render = () => { h.reset(); return all(Dialog({ point, onClose: () => closed++, onSaved: () => refreshed++ })); };
 render().find(n => n.type === 'TextInput').props.onChangeText('  Home  ');
 const save = () => render().find(n => n.type === 'TouchableOpacity' && all(n).some(child => child.props?.children === 'ذخیره آدرس'));
 await save().props.onPress();
 assert.equal(calls[0][0].name, 'Home'); assert.equal(calls[0][0].lat, 35.7); assert.equal(calls[0][0].lng, 51.4); assert.equal(closed, 1); assert.equal(refreshed, 1);
 fail = true; await save().props.onPress(); assert.equal(closed, 1); assert.ok(render().some(n => n.props?.accessibilityRole === 'alert' && n.props.children === 'network unavailable'));
});

test('A saved address can be reused as origin or destination with fresh selection identity', () => {
 const item = { id: 'saved-1', name: 'Home', address: 'Tehran', lat: 35.7, lng: 51.4 };
 let cursor = 0; const calls = [];
 const Screen = load('src/screens/AddressesScreen.tsx', {
 react: { useEffect() {}, useState(initial) { const index = cursor++; return [index === 0 ? [item] : index === 1 ? false : initial, () => {}]; } },
 'react-native': native, '../components/LoadingState': { __esModule: true, default: 'LoadingState' }, '../components/ScreenPage': { ScreenPage: 'ScreenPage', EmptyState: 'EmptyState', ui: {} },
 '../components/SaveAddressDialog': { __esModule: true, default: 'Dialog' }, '../components/Icon': { Icon: 'Icon' }, '../theme': { colors: {}, fonts: {} }, '../services/passenger': { passengerApi: {} },
 }).default;
 const nodes = all(Screen({ navigation: { navigate: (...args) => calls.push(args) }, route: {} }));
 for (const label of ['انتخاب مبدأ', 'انتخاب مقصد']) nodes.find(n => n.type === 'TouchableOpacity' && all(n).some(child => child.props?.children === label)).props.onPress();
 assert.equal(calls[0][0], 'Home'); assert.equal(calls[0][1].savedAddress.kind, 'start'); assert.equal(calls[1][1].savedAddress.kind, 'end');
 assert.equal(calls[1][1].savedAddress.lat, item.lat); assert.equal(calls[1][1].savedAddress.lng, item.lng); assert.notEqual(calls[0][1].savedAddress.selectionId, calls[1][1].savedAddress.selectionId);
});
