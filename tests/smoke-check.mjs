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
assert.match(scripts[0][1], /guardianId','ولي الأمر','guardian'/, 'students can be linked to a guardian');
assert.match(scripts[0][1], /x\.guardians=Array\.isArray\(x\.guardians\)\?x\.guardians:\[\]/, 'legacy backups gain empty guardian collection');
assert.match(scripts[0][1], /st\.guardianId&&!x\.guardians\.some/, 'backup guardian links are validated');
assert.match(scripts[0][1], /x\.guardianId===recordId/, 'deleting a guardian clears student links');

assert.match(html, /id="reportAttendanceRows"/, 'detailed attendance report table exists');
assert.match(html, /id="reportExamRows"/, 'exam outcomes report table exists');
assert.match(html, /id="reportFeeRows"/, 'student fee report table exists');
assert.match(scripts[0][1], /function renderReports\(/, 'detailed reports renderer exists');
assert.match(scripts[0][1], /reportFrom/, 'reports support a date range');
assert.match(scripts[0][1], /reportFeesDue/, 'reports calculate outstanding fees');

assert.match(scripts[0][1], /classId','الفصل الدراسي','class'/, 'students can be assigned to a school class');
assert.match(scripts[0][1], /function classLabel\(/, 'class names are resolved for student and timetable lists');
assert.match(scripts[0][1], /optionsFor\(type\).*type==='class'/, 'class selectors use the active school classes');
assert.match(scripts[0][1], /x\.teacherId===obj\.teacherId/, 'timetable prevents teacher period conflicts');
assert.match(scripts[0][1], /x\.classId===obj\.classId/, 'timetable prevents class period conflicts');
assert.match(scripts[0][1], /st\.classId&&!x\.classes\.some/, 'backup student class references are validated');
assert.match(scripts[0][1], /l\.classId&&!x\.classes\.some/, 'backup lesson class references are validated');
assert.match(scripts[0][1], /db\.lessons=db\.lessons\.map\(x=>x\.classId===recordId/, 'deleting a class clears linked timetable references');

assert.match(html, /id="attendanceClassFilter"/, 'attendance can be filtered by class');
assert.match(html, /id="attendanceRosterCount"/, 'filtered attendance roster count exists');
assert.match(html, /id="reportClassAttendanceRows"/, 'class attendance report table exists');
assert.match(scripts[0][1], /function renderAttendance\(\)[\s\S]*?st\.classId===filter\.value/, 'attendance renderer filters students by selected class');
assert.match(scripts[0][1], /function renderReports\(\)[\s\S]*?const classGroups=new Map\(\)/, 'reports aggregate attendance by class');
assert.match(scripts[0][1], /g\.present\+g\.late/, 'attendance rate includes present and late statuses');

assert.match(html, /id="weeklyTimetableGrid"/, 'weekly timetable grid exists');
assert.match(html, /id="timetableClassFilter"/, 'weekly timetable can be filtered by class');
assert.match(scripts[0][1], /function renderWeeklyTimetable\(/, 'weekly timetable renderer exists');
assert.match(scripts[0][1], /days=\['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'\]/, 'weekly timetable includes the school week');
assert.match(scripts[0][1], /lessons\.filter\(l=>l\.day===day&&String\(l\.period\)===p\)/, 'weekly timetable groups lessons by day and period');

for (const id of ['staff','leaves']) assert.match(html, new RegExp('id="' + id + '"'), id + ' section exists');
assert.match(html, /id="staffRows"/, 'employee directory table exists');
assert.match(html, /id="leaveRows"/, 'leave requests table exists');
assert.match(html, /id="teacherLoadRows"/, 'teacher workload table exists');
assert.match(scripts[0][1], /staff:\{title:'الملف الوظيفي للموظف'/, 'employee profile form exists');
assert.match(scripts[0][1], /leave:\{title:'طلب إجازة أو استئذان'/, 'leave request form exists');
assert.match(scripts[0][1], /function renderStaff\(/, 'employee directory renderer exists');
assert.match(scripts[0][1], /function renderLeaves\(/, 'leave list renderer exists');
assert.match(scripts[0][1], /function renderTeachers\([\s\S]*?teacherLoadRows/, 'teacher workload is calculated from timetable lessons');
assert.match(scripts[0][1], /data\.toDate<data\.fromDate/, 'leave date range is validated');
assert.ok(scripts[0][1].includes('data.fromDate<=x.toDate&&x.fromDate<=data.toDate'), 'overlapping approved leave requests are rejected');
assert.match(scripts[0][1], /db\.leaves=db\.leaves\.filter\(x=>x\.staffId!==recordId\)/, 'employee deletion clears linked leave requests');
assert.match(scripts[0][1], /x\.staff=Array\.isArray\(x\.staff\)\?x\.staff:\[\]/, 'legacy browser data gains employee collection');
assert.match(scripts[0][1], /x\.leaves=Array\.isArray\(x\.leaves\)\?x\.leaves:\[\]/, 'legacy browser data gains leave collection');
assert.match(scripts[0][1], /const staffIds=new Set\(x\.staff\.map\(s=>s\.id\)\)/, 'backup leave employee references are validated');

assert.match(html, /id="staff-attendance"/, 'staff attendance section exists');
assert.match(html, /id="staffAttendanceRows"/, 'staff attendance register exists');
assert.match(html, /id="staffAttendanceDate"/, 'staff attendance date filter exists');
assert.match(html, /id="staffPresentCount"/, 'staff attendance summary counters exist');
assert.match(scripts[0][1], /staffAttendance:\{title:'تسجيل دوام موظف'/, 'staff attendance form exists');
assert.match(scripts[0][1], /function renderStaffAttendance\(/, 'staff attendance renderer exists');
assert.match(scripts[0][1], /x\.staffAttendance=Array\.isArray\(x\.staffAttendance\)\?x\.staffAttendance:\[\]/, 'legacy browser data gains staff attendance collection');
assert.match(scripts[0][1], /a\.staffId===data\.staffId&&x\.date===data\.date/, 'duplicate staff attendance is rejected');
assert.match(scripts[0][1], /a\.checkOut<a\.checkIn/, 'check-out cannot precede check-in');
assert.match(scripts[0][1], /db\.staffAttendance=db\.staffAttendance\.filter\(x=>x\.staffId!==recordId\)/, 'employee deletion clears linked attendance');
assert.match(scripts[0][1], /staffAttendance\.some\(a=>!x\.staff\.some/, 'backup staff attendance employee references are validated');
