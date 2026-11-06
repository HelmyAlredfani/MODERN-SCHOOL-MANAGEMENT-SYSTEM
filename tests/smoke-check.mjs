import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /<html lang="ar" dir="rtl">/, 'Arabic RTL document');
assert.match(html, /id="schoolSelect"/, 'school selector exists');
for (const id of ['dashboard','schools','students','teachers','classes','attendance','grades','timetable','reports','settings']) {
  assert.match(html, new RegExp('id="' + id + '"'), 'section ' + id + ' exists');
}
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'exactly one inline application script');
new vm.Script(scripts[0][1], { filename: 'msms-inline.js' });
assert.match(scripts[0][1], /function importData\(/, 'backup import exists');
assert.match(scripts[0][1], /schoolIds\.has\(row\.schoolId\)/, 'backup school ownership validation exists');
assert.match(scripts[0][1], /getTimezoneOffset\(\)/, 'dates use local timezone');
assert.match(html, /لا تدخل بيانات شخصية حقيقية للطلاب/, 'privacy warning exists');
console.log('MSMS smoke checks passed.');
