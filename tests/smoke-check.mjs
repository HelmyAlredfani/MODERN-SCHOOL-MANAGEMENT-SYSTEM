import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /<html lang="ar" dir="rtl">/, 'Arabic RTL document');
assert.match(html, /id="schoolSelect"/, 'school selector exists');
for (const id of ['dashboard','schools','students','teachers','classes','attendance','grades','exams','fees','guardians','timetable','reports','settings']) {
  assert.match(html, new RegExp('id="' + id + '"'), 'section ' + id + ' exists');
}
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'exactly one inline application script');
new vm.Script(scripts[0][1], { filename: 'msms-inline.js' });
assert.match(scripts[0][1], /function importData\(/, 'backup import exists');
assert.match(scripts[0][1], /schoolIds\.has\(row\.schoolId\)/, 'backup school ownership validation exists');
assert.match(scripts[0][1], /getTimezoneOffset\(\)/, 'dates use local timezone');
assert.match(scripts[0][1], /outOf<=0\|\|score<0\|\|score>outOf/, 'grade boundaries are validated');
assert.match(scripts[0][1], /رقم القيد مستخدم بالفعل/, 'duplicate student numbers are rejected');
assert.match(scripts[0][1], /db\.attendance=db\.attendance\.filter\(x=>x\.studentId!==recordId\)/, 'student deletion removes related attendance');
assert.match(scripts[0][1], /db\.grades=db\.grades\.filter\(x=>x\.studentId!==recordId\)/, 'student deletion removes related grades');
assert.match(scripts[0][1], /l\.teacherId&&!x\.teachers\.some/, 'backup teacher references are validated');
assert.match(html, /لا تدخل بيانات شخصية حقيقية للطلاب/, 'privacy warning exists');
assert.match(scripts[0][1], /function renderFees\(/, 'fee summary renderer exists');
assert.match(scripts[0][1], /function renderExamResults\(/, 'exam result summary renderer exists');
assert.match(scripts[0][1], /pct>=Number\(exam\.passMark\)/, 'exam result status uses the configured pass threshold');
assert.match(html, /id="examResultsRows"/, 'exam results table exists');
assert.match(scripts[0][1], /x\.examId===data\.examId/, 'duplicate exam-subject grades are rejected');
assert.match(scripts[0][1], /data\.paid>data\.amount/, 'payments cannot exceed assessed fees');
assert.match(scripts[0][1], /examIds\.has\(g\.examId\)/, 'backup exam references are validated');
assert.match(scripts[0][1], /x\.exams=Array\.isArray\(x\.exams\)\?x\.exams:\[\]/, 'legacy backups gain empty exam and fee collections');
assert.match(scripts[0][1], /db\.grades=db\.grades\.filter\(x=>x\.examId!==recordId\)/, 'deleting an exam removes linked grades');
assert.match(scripts[0][1], /x\.fees\.some/, 'backup fee amounts are validated');
console.log('MSMS smoke checks passed.');

assert.match(html, /id="guardianRows"/, 'guardian directory exists');
assert.match(scripts[0][1], /function renderGuardians\(/, 'guardian renderer exists');
assert.match(scripts[0][1], /guardianId,'ولي الأمر','guardian'/, 'students can be linked to a guardian');
assert.match(scripts[0][1], /x\.guardians=Array\.isArray\(x\.guardians\)\?x\.guardians:\[\]/, 'legacy backups gain empty guardian collection');
assert.match(scripts[0][1], /st\.guardianId&&!x\.guardians\.some/, 'backup guardian links are validated');
assert.match(scripts[0][1], /x\.guardianId===recordId/, 'deleting a guardian clears student links');
