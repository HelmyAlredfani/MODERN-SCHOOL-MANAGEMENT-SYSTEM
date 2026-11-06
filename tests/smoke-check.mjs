import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
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
assert.ok(scripts[0][1].includes('x.staffId===data.staffId&&x.date===data.date'), 'duplicate staff attendance is rejected');
assert.match(scripts[0][1], /a\.checkOut<a\.checkIn/, 'check-out cannot precede check-in');
assert.match(scripts[0][1], /db\.staffAttendance=db\.staffAttendance\.filter\(x=>x\.staffId!==recordId\)/, 'employee deletion clears linked attendance');
assert.match(scripts[0][1], /staffAttendance\.some\(a=>!x\.staff\.some/, 'backup staff attendance employee references are validated');

assert.match(html, /id="staffReportMonth"/, 'monthly staff report month selector exists');
assert.match(html, /id="staffMonthlyRows"/, 'monthly staff breakdown table exists');
assert.match(html, /id="monthlyTeacherLoadRows"/, 'monthly teacher workload table exists');
assert.match(html, /id="staffReportLeaveDays"/, 'approved leave day summary exists');
assert.ok(scripts[0][1].includes('function staffMonthlyData()'), 'monthly HR report data builder exists');
assert.ok(scripts[0][1].includes("scoped('staffAttendance').filter(x=>x.date>=start&&x.date<=end)"), 'staff attendance is scoped to selected month and school');
assert.ok(scripts[0][1].includes("requests=scoped('leaves').filter(x=>x.fromDate<=end&&x.toDate>=start)"), 'all leave requests overlapping selected month are included for status reporting');
assert.ok(scripts[0][1].includes("ownRequests.filter(x=>x.status==='موافق عليها')"), 'approved leave days are calculated only from approved requests');
assert.ok(scripts[0][1].includes('function exportStaffMonthlyReport()'), 'monthly CSV export exists');
assert.ok(scripts[0][1].includes("type:'text/csv;charset=utf-8'"), 'CSV export uses UTF-8');
assert.ok(scripts[0][1].includes("String(new Date(year,mon,0).getDate()).padStart(2,'0')"), 'month end date avoids UTC timezone shifts');

assert.match(html, /id="financeReportMonth"/, 'monthly finance report month selector exists');
assert.match(html, /id="financeStudentRows"/, 'monthly finance student breakdown exists');
assert.match(html, /id="financeClassRows"/, 'monthly finance class breakdown exists');
assert.match(html, /id="financeRate"/, 'monthly fee collection ratio exists');
assert.match(html, /id="financeOverdue"/, 'current overdue balance summary exists');
assert.ok(scripts[0][1].includes('function financeMonthlyData()'), 'monthly finance report data builder exists');
assert.ok(scripts[0][1].includes("scoped('fees').filter(f=>f.dueDate&&f.dueDate>=start&&f.dueDate<=end)"), 'fees are filtered by due month and active school');
assert.ok(scripts[0][1].includes("f.dueDate&&f.dueDate<today()"), 'overdue fee balance is calculated');
assert.ok(scripts[0][1].includes('function exportFinanceMonthlyReport()'), 'monthly finance CSV export exists');
assert.ok(scripts[0][1].includes("type:'text/csv;charset=utf-8'"), 'finance CSV uses UTF-8 encoding');
assert.ok(scripts[0][1].includes("renderFinanceMonthlyReport()"), 'finance report refreshes with report screen');

assert.match(html, /id="paymentRows"/, 'payment receipt register exists');
assert.match(html, /onclick="openForm\('payment'\)"/, 'new payment receipt action exists');
assert.ok(scripts[0][1].includes("payments:[],lessons:[]"), 'new datasets include payment transactions');
assert.ok(scripts[0][1].includes("x.payments=Array.isArray(x.payments)?x.payments:[]"), 'legacy local storage migrates to payments array');
assert.ok(scripts[0][1].includes("function exportFinanceMonthlyReport()"), 'finance report export remains available');
assert.ok(scripts[0][1].includes("scoped('payments').filter(p=>p.date>=start&&p.date<=end)"), 'monthly finance report filters actual receipts by payment date');
assert.ok(scripts[0][1].includes("newFee.paid=Number(newFee.paid)+Number(data.amount)"), 'receipt save updates fee paid balance');
assert.ok(scripts[0][1].includes("fee.paid=Math.max(0,Number(fee.paid)-Number(removed.amount))"), 'receipt deletion reverses fee paid balance');
assert.ok(scripts[0][1].includes('f.id===p.feeId&&f.schoolId===p.schoolId&&f.studentId===p.studentId'), 'payment references are validated against fee, school and student');
assert.ok(scripts[0][1].includes("x.payments=Array.isArray(x.payments)?x.payments:[]"), 'legacy backups gain empty payments array');

assert.match(html, /id="paymentRows"/, 'payment receipt register remains available');
assert.match(html, /طباعة السند/, 'payment receipt print action exists');
assert.ok(scripts[0][1].includes('function printReceipt(paymentId)'), 'printable receipt renderer exists');
assert.ok(scripts[0][1].includes("data.receiptNo=old?.receiptNo||'MSMS-'"), 'new receipts receive a generated receipt number');
assert.ok(scripts[0][1].includes("p.receiptNo='MSMS-'+String(p.date||'').replace"), 'legacy receipt numbers are generated during local migration');
assert.ok(scripts[0][1].includes('if(x.payments.some(p=>!p.receiptNo'), 'backup receipts require a receipt number and valid fee link');
assert.ok(scripts[0][1].includes("n.receiptNo===p.receiptNo"), 'duplicate receipt numbers within a school are rejected on import');
assert.match(html, /id="financePaymentRows"/, 'monthly receipt report is present');


assert.match(html, /id="student-account"/, 'individual student account section exists');
assert.match(html, /id="accountStudent"/, 'student account selector exists');
assert.match(html, /id="accountFeeRows"/, 'student fee statement table exists');
assert.match(html, /id="accountPaymentRows"/, 'student receipt history table exists');
assert.match(scripts[0][1], /function studentAccountData\(/, 'student account data builder exists');
assert.ok(scripts[0][1].includes("scoped('fees').filter(f=>f.studentId===studentId"), 'student fees are restricted to active school and selected student');
assert.ok(scripts[0][1].includes("scoped('payments').filter(p=>p.studentId===studentId"), 'receipts are restricted to active school and selected student');
assert.ok(scripts[0][1].includes("p.studentId===studentId&&inRange(p.date)"), 'receipts use their own payment date range, independently of fee due dates');
assert.ok(scripts[0][1].includes("f.dueDate&&inRange(f.dueDate)"), 'fee date range uses due date separately');
assert.ok(scripts[0][1].includes("inRange(p.date)"), 'receipt date range uses receipt date separately');
assert.ok(scripts[0][1].includes("billed=fees.reduce"), 'student account calculates assessed total');
assert.ok(scripts[0][1].includes("receipts=payments.reduce"), 'student account calculates receipt total');
assert.ok(scripts[0][1].includes('function exportStudentAccount()'), 'student account CSV export exists');
assert.ok(scripts[0][1].includes('function printStudentAccount()'), 'student account print view exists');
const accountBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function studentAccountData(){'),scripts[0][1].indexOf('function renderStudentAccount(){'));
assert.ok(!accountBuilder.includes('persist(')&&!accountBuilder.includes('db.'), 'student account data builder does not mutate stored records');


assert.match(html, /id="student-report-card"/, 'student report card section exists');
assert.match(html, /id="resultStudent"/, 'report card student selector exists');
assert.match(html, /id="resultExam"/, 'report card exam selector exists');
assert.match(html, /id="resultSubjectRows"/, 'report card subject details table exists');
assert.ok(scripts[0][1].includes('function studentReportCardData()'), 'student report card data builder exists');
assert.ok(scripts[0][1].includes("scoped('students').find(x=>x.id===studentId)"), 'report card student is restricted to active school');
assert.ok(scripts[0][1].includes("scoped('exams').find(x=>x.id===examId)"), 'report card exam is restricted to active school');
assert.ok(scripts[0][1].includes("scoped('grades').filter(g=>g.studentId===studentId&&g.examId===examId)"), 'report card joins grades to selected student and exam');
assert.ok(scripts[0][1].includes('percentage>=Number(exam.passMark||0)'), 'overall result uses configured exam pass mark');
assert.ok(scripts[0][1].includes('function exportStudentReportCard()'), 'report card CSV export exists');
assert.ok(scripts[0][1].includes('function printStudentReportCard()'), 'report card print view exists');
const cardBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function studentReportCardData(){'),scripts[0][1].indexOf('function renderStudentReportCard(){'));
assert.ok(!cardBuilder.includes('persist(')&&!cardBuilder.includes('db.'), 'report card data builder is read-only');
assert.ok(scripts[0][1].includes("function exportStudentReportCard()"), 'report card export remains present');
assert.ok(scripts[0][1].includes("type:'text/csv;charset=utf-8'"), 'report card CSV uses UTF-8');

assert.match(serviceWorker, /msms-github-edition-v3/, 'service worker cache version is bumped to invalidate stale site assets');
assert.match(serviceWorker, /request\.mode==='navigate'\|\|url\.pathname\.endsWith\('\/index\.html'\)/, 'page navigations use a network-first strategy');
assert.match(serviceWorker, /fetch\(request\)[\s\S]*?caches\.match\(request\)[\s\S]*?caches\.match\('\.\/index\.html'\)/, 'page navigation falls back to cached HTML when offline');
assert.match(serviceWorker, /keys\.filter\(key=>key!==CACHE\)/, 'old service worker caches are removed on activation');
assert.match(html, /MSMS 2\.8/, 'visible product version is updated to 2.8');
assert.match(html, /id="academicSubjectRows"/, 'academic subject analytics table exists');
assert.match(html, /id="academicClassRows"/, 'academic class analytics table exists');
assert.match(html, /id="academicExamRows"/, 'academic exam analytics table exists');
assert.ok(scripts[0][1].includes('function academicPerformanceData()'), 'academic performance data builder exists');
assert.ok(scripts[0][1].includes('function renderAcademicPerformance()'), 'academic performance renderer exists');
assert.ok(scripts[0][1].includes('function exportAcademicPerformance()'), 'academic performance CSV export exists');
assert.ok(scripts[0][1].includes("grades.filter(g=>studentMap.has(g.studentId)&&examMap.has(g.examId)"), 'academic analytics is scoped to active-school students and exams');
assert.ok(scripts[0][1].includes("inRange({date:examMap.get(g.examId).date||''})"), 'academic analytics respects the selected exam date range');
const academicBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function academicPerformanceData(){'),scripts[0][1].indexOf('function renderAcademicPerformance(){'));
assert.ok(!academicBuilder.includes('persist(')&&!academicBuilder.includes('db.'), 'academic analytics builder is read-only');

assert.match(html, /MSMS 2\.8/, 'visible product version is updated to 2.8');
assert.match(html, /id="staffReportApprovedRequests"/, 'monthly approved leave request KPI exists');
assert.match(html, /id="staffReportPendingRequests"/, 'monthly pending leave request KPI exists');
assert.match(html, /id="staffReportRejectedRequests"/, 'monthly rejected leave request KPI exists');
assert.ok(scripts[0][1].includes("function staffMonthlyData()"), 'staff monthly report data builder exists');
assert.ok(scripts[0][1].includes("x.fromDate<=end&&x.toDate>=start"), 'staff leave requests are selected when they overlap the report month');
assert.ok(scripts[0][1].includes("requestCount('قيد المراجعة')"), 'staff report counts pending leave requests');
assert.ok(scripts[0][1].includes("requestCount('مرفوضة')"), 'staff report counts rejected leave requests');
assert.ok(scripts[0][1].includes("approvedLeaveDays"), 'staff report calculates approved leave days within the selected month');
const staffBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function staffMonthlyData(){'),scripts[0][1].indexOf('function renderStaffMonthlyReport(){'));
assert.ok(!staffBuilder.includes('persist(')&&!staffBuilder.includes('db.'), 'staff monthly report builder is read-only and scoped');
assert.ok(scripts[0][1].includes("function exportStaffMonthlyReport()"), 'staff monthly CSV export remains available');


// MSMS 2.7 – student attendance analytics
assert.match(html, /MSMS 2\.8/, 'visible product version is updated to 2.8');
assert.match(html, /id="attendanceAnalyticsClassRows"/, 'class and section attendance comparison exists');
assert.match(html, /id="studentAttendanceDetailRows"/, 'individual student attendance detail exists');
assert.match(html, /id="attendanceStudentFilter"/, 'student attendance selector exists');
assert.ok(scripts[0][1].includes('function studentAttendanceAnalyticsData()'), 'student attendance analytics builder exists');
assert.ok(scripts[0][1].includes('function renderStudentAttendanceAnalytics()'), 'student attendance analytics renderer exists');
assert.ok(scripts[0][1].includes('function exportStudentAttendanceAnalytics()'), 'student attendance analytics CSV export exists');
assert.ok(scripts[0][1].includes("scoped('attendance').filter(x=>studentMap.has(x.studentId)"), 'attendance analytics is restricted to active-school students');
assert.ok(scripts[0][1].includes("(!from||x.date>=from)&&(!to||x.date<=to)"), 'attendance analytics respects report date range');
assert.ok(scripts[0][1].includes('observed=present+absent+late'), 'excused records are excluded from attendance-rate denominator');
assert.ok(scripts[0][1].includes('attendanceRate:observed?(present+late)/observed*100:0'), 'attendance rate counts present and late as attended observations');
const attendanceBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function studentAttendanceAnalyticsData(){'),scripts[0][1].indexOf('function renderStudentAttendanceAnalytics(){'));
assert.ok(!attendanceBuilder.includes('persist(')&&!attendanceBuilder.includes('db.'), 'student attendance analytics builder is read-only and uses active-school scope');
assert.ok(scripts[0][1].includes("type:'text/csv;charset=utf-8'"), 'student attendance CSV uses UTF-8');


// MSMS 2.8 – student absence follow-up
assert.match(html, /MSMS 2\.8/, 'visible product version is updated to 2.8');
assert.match(html, /id="absenceFollowupRows"/, 'student absence follow-up register exists');
assert.match(html, /id="absenceFollowupThreshold"/, 'absence follow-up threshold control exists');
assert.ok(scripts[0][1].includes('function studentAbsenceFollowupData()'), 'student absence follow-up data builder exists');
assert.ok(scripts[0][1].includes('function renderStudentAbsenceFollowup()'), 'student absence follow-up renderer exists');
assert.ok(scripts[0][1].includes('function exportStudentAbsenceFollowup()'), 'student absence follow-up CSV export exists');
assert.ok(scripts[0][1].includes("scoped('attendance').filter(x=>studentMap.has(x.studentId)"), 'absence follow-up is scoped to active-school students');
assert.ok(scripts[0][1].includes("x.status==='absent'"), 'only unexcused absent status counts toward follow-up');
assert.ok(scripts[0][1].includes("guardians.get(st.guardianId)"), 'follow-up resolves guardian contact from active-school guardian records');
assert.ok(scripts[0][1].includes("absences.length>=threshold"), 'follow-up threshold is applied to student absence count');
const followupBuilder=scripts[0][1].slice(scripts[0][1].indexOf('function studentAbsenceFollowupData(){'),scripts[0][1].indexOf('function renderStudentAbsenceFollowup(){'));
assert.ok(!followupBuilder.includes('persist(')&&!followupBuilder.includes('db.'), 'absence follow-up builder is read-only and scoped');
assert.ok(scripts[0][1].includes("type:'text/csv;charset=utf-8'"), 'absence follow-up CSV uses UTF-8');
