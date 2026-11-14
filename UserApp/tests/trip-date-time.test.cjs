const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => name in mocks ? mocks[name] : require(name), Date, Intl });
  return module.exports;
}
const dates = load('src/utils/tripDateTime.ts');

test('Jalali calendar handles leap Esfand, Saturday-first weeks, and Tehran midnight', () => {
  assert.equal(dates.parseJalaliDate('1400-12-30'), null);
  assert.equal(dates.parseJalaliDate('1399-12-30').jd, 30);
  assert.equal(dates.serializeJalaliDate(dates.parseJalaliDate('۱۴۰۵/۱/۱')), '1405-01-01');
  assert.equal(dates.calendarDays(1405, 1)[0], 1); // 2026-03-21 is Saturday.
  assert.equal(dates.calendarDays(1404, 1)[6], 1); // 2025-03-21 is Friday.
  assert.equal(dates.calendarDays(1399, 12).filter(Boolean).length, 30);
  assert.equal(dates.calendarDays(1400, 12).filter(Boolean).length, 29);
  assert.equal(dates.serializeJalaliDate(dates.todayInTehran(new Date('2026-03-20T20:29:00Z'))), '1404-12-29');
  assert.equal(dates.serializeJalaliDate(dates.todayInTehran(new Date('2026-03-20T20:30:00Z'))), '1405-01-01');
  assert.equal(dates.displayJalaliDate('1405-08-17'), '۱۷ آبان ۱۴۰۵');
});

function picker(file, value, options = {}) {
  const state = []; let cursor = 0;
  const changes = [];
  const fakeReact = { useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
    return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
  } };
  const rn = Object.fromEntries(['View', 'Text', 'TouchableOpacity', 'Modal', 'Pressable', 'ScrollView'].map(name => [name, name]));
  const Component = load(file, { react: fakeReact, 'react-native': rn,
    '../utils/tripDateTime': dates, './pickerStyles': { pickerStyles: {} }, './DragTimeWheel': { __esModule: true, default: 'DragTimeWheel' },
  }).default;
  function all(node) {
    if (Array.isArray(node)) return node.flatMap(all);
    if (!node || typeof node !== 'object') return [];
    if (node.type === 'Modal' && !node.props.visible) return [];
    return [node, ...all(node.props?.children)];
  }
  const render = () => { cursor = 0; return all(Component({ ...options, value, onChange: v => changes.push(v) })); };
  const label = text => render().find(node => node.props?.accessibilityLabel === text).props.onPress();
  const press = text => render().find(node => node.type === 'TouchableOpacity' && all(node).some(child => child.type === 'Text' && child.props.children === text)).props.onPress();
  const adjust = (label, value) => render().find(node => node.type === 'DragTimeWheel' && node.props.label === label).props.onChange(value);
  return { changes, label, press, adjust, render };
}

test('Calendar keeps draft changes private until confirmed and saves a Jalali date', () => {
  const calendar = picker('src/components/JalaliDatePicker.tsx', '1399-12-29');
  calendar.label('انتخاب تاریخ حرکت');
  calendar.label('۳۰ اسفند ۱۳۹۹');
  assert.equal(calendar.changes.length, 0);
  calendar.press('انصراف');
  assert.equal(calendar.changes.length, 0);
  calendar.label('انتخاب تاریخ حرکت');
  calendar.label('۳۰ اسفند ۱۳۹۹');
  calendar.press('تأیید تاریخ');
  assert.equal(calendar.changes[0], '1399-12-30');
});

test('Time picker supports midnight and every minute; cancel preserves the saved time', () => {
  const time = picker('src/components/TimePicker.tsx', '23:59');
  time.label('انتخاب ساعت حرکت');
  time.adjust('ساعت', 0); time.adjust('دقیقه', 0);
  time.press('انصراف');
  assert.equal(time.changes.length, 0);
  time.label('انتخاب ساعت حرکت');
  time.press('تأیید ساعت');
  assert.equal(time.changes[0], '23:59');
  time.label('انتخاب ساعت حرکت');
  time.adjust('ساعت', 0); time.adjust('دقیقه', 0);
  time.press('تأیید ساعت');
  assert.equal(time.changes[1], '00:00');
});

test('Dragging time values wraps at midnight and all browser page titles are Persian', () => {
  const { draggedTimeValue } = load('src/components/DragTimeWheel.tsx', {
    react: {}, 'react-native': { StyleSheet: { create: value => value } },
    '../theme': { colors: {}, fonts: {} }, '../utils/tripDateTime': dates,
  });
  assert.equal(draggedTimeValue(23, -36, 24), 0);
  assert.equal(draggedTimeValue(0, 36, 24), 23);
  assert.equal(draggedTimeValue(59, -72, 60), 1);
  const { pageTitle } = load('src/navigationTitles.ts');
  assert.equal(pageTitle('Booking'), 'پویش تاکسی | رزرو سفر');
  for (const name of ['Login', 'Otp', 'Landing', 'Home', 'Booking', 'Tracking', 'Profile']) {
    assert.equal(/[a-z]/i.test(pageTitle(name)), false);
  }
});

test('Birthday picker selects year, month and day quickly and blocks future birthdays',()=>{
 const birthday=picker('src/components/JalaliDatePicker.tsx','',{purpose:'birthday'});
 birthday.label('انتخاب تاریخ تولد');birthday.label('سال ۱۳۷۰');birthday.label('ماه فروردین');birthday.label('۱۵ فروردین ۱۳۷۰');birthday.press('تأیید تاریخ');assert.equal(birthday.changes[0],'1370-01-15');
 const future=picker('src/components/JalaliDatePicker.tsx',`${dates.todayInTehran().jy+1}-01-01`,{purpose:'birthday'});future.label('انتخاب تاریخ تولد');
 assert.equal(future.render().find(n=>n.type==='TouchableOpacity'&&n.props.children?.props?.children==='تأیید تاریخ').props.disabled,true);
});
