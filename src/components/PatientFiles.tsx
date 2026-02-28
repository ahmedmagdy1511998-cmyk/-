import { useState, useRef } from 'react';
import { Patient, Doctor, Treatment, Appointment } from '../types';

interface PatientFilesProps {
  patients: Patient[];
  doctors: Doctor[];
  treatments: Treatment[];
  appointments: Appointment[];
  centerSettings: {
    name: string;
    phone: string;
    address: string;
    logo: string;
  } | null;
}

export default function PatientFiles({ patients, doctors, treatments, appointments, centerSettings }: PatientFilesProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getPatientTreatments = (patientId: string) => {
    return treatments.filter(t => t.patientId === patientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(a => a.patientId === patientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'غير محدد';
  };

  const getDoctorSpecialty = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.specialization : '';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'قيد الانتظار';
      case 'completed': return 'تم الكشف';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (age: number) => {
    return age;
  };

  const getFirstVisitDate = (patientId: string) => {
    const patientAppointments = appointments.filter(a => a.patientId === patientId);
    if (patientAppointments.length === 0) return null;
    const sorted = patientAppointments.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted[0].date;
  };

  const getLastVisitDate = (patientId: string) => {
    const completedAppointments = appointments.filter(a => a.patientId === patientId && a.status === 'completed');
    if (completedAppointments.length === 0) return null;
    const sorted = completedAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0].date;
  };

  const getTotalTreatments = (patientId: string) => {
    return treatments.filter(t => t.patientId === patientId).length;
  };

  const getCompletedAppointments = (patientId: string) => {
    return appointments.filter(a => a.patientId === patientId && a.status === 'completed').length;
  };

  const handlePrint = () => {
    setShowPrintModal(true);
    setTimeout(() => {
      const printContent = printRef.current;
      if (printContent) {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(`
            <html dir="rtl">
              <head>
                <title>الملف الطبي - ${selectedPatient?.name}</title>
                <style>
                  * { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
                  body { padding: 20px; direction: rtl; }
                  .header { text-align: center; border-bottom: 3px solid #0891b2; padding-bottom: 20px; margin-bottom: 20px; }
                  .logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
                  .center-name { font-size: 24px; font-weight: bold; color: #0891b2; margin: 10px 0; }
                  .center-info { color: #666; font-size: 14px; }
                  .patient-header { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                  .patient-name { font-size: 22px; font-weight: bold; margin-bottom: 10px; }
                  .patient-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px; }
                  .section { margin-bottom: 25px; }
                  .section-title { font-size: 18px; font-weight: bold; color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
                  .medical-history { background: #fef3c7; padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th { background: #f1f5f9; padding: 12px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; }
                  td { padding: 10px; border: 1px solid #e2e8f0; }
                  tr:nth-child(even) { background: #f8fafc; }
                  .status { padding: 4px 10px; border-radius: 15px; font-size: 12px; display: inline-block; }
                  .status-completed { background: #dcfce7; color: #166534; }
                  .status-scheduled { background: #fef9c3; color: #854d0e; }
                  .status-cancelled { background: #fee2e2; color: #991b1b; }
                  .summary-box { background: #f0fdfa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; }
                  .summary-item { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                  .summary-value { font-size: 24px; font-weight: bold; color: #0891b2; }
                  .summary-label { font-size: 12px; color: #666; }
                  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #666; font-size: 12px; }
                  .print-date { background: #f1f5f9; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
                  .no-data { text-align: center; padding: 20px; color: #999; font-style: italic; }
                  @media print {
                    body { padding: 0; }
                    .patient-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
        }
      }
      setShowPrintModal(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">ملفات المرضى الطبية</h1>
            <p className="text-cyan-100">السجل الطبي الكامل لكل مريض</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المرضى */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg font-bold text-gray-800 mb-3">قائمة المرضى</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث عن مريض..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>لا يوجد مرضى</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 border-b cursor-pointer transition-all hover:bg-cyan-50 ${
                      selectedPatient?.id === patient.id ? 'bg-cyan-100 border-r-4 border-r-cyan-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        patient.gender === 'male' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{patient.name}</h3>
                        <p className="text-sm text-gray-500">{patient.phone}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                            {getTotalTreatments(patient.id)} علاج
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {getCompletedAppointments(patient.id)} زيارة
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل الملف الطبي */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* رأس الملف */}
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                      selectedPatient.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'
                    }`}>
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                      <p className="text-cyan-100 mt-1">
                        {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'} • {calculateAge(selectedPatient.age)} سنة
                      </p>
                      <p className="text-cyan-100">{selectedPatient.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    طباعة الملف
                  </button>
                </div>
              </div>

              {/* ملخص إحصائي */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-cyan-50 border-b">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <div className="text-3xl font-bold text-cyan-600">{getTotalTreatments(selectedPatient.id)}</div>
                    <div className="text-sm text-gray-500">إجمالي العلاجات</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <div className="text-3xl font-bold text-green-600">{getCompletedAppointments(selectedPatient.id)}</div>
                    <div className="text-sm text-gray-500">الزيارات المكتملة</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {getFirstVisitDate(selectedPatient.id) ? new Date(getFirstVisitDate(selectedPatient.id)!).toLocaleDateString('ar-EG') : '-'}
                    </div>
                    <div className="text-sm text-gray-500">أول زيارة</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {getLastVisitDate(selectedPatient.id) ? new Date(getLastVisitDate(selectedPatient.id)!).toLocaleDateString('ar-EG') : '-'}
                    </div>
                    <div className="text-sm text-gray-500">آخر زيارة</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {/* التاريخ المرضي */}
                {selectedPatient.medicalHistory && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      التاريخ المرضي
                    </h3>
                    <p className="text-amber-900">{selectedPatient.medicalHistory}</p>
                  </div>
                )}

                {/* العنوان */}
                {selectedPatient.address && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      العنوان
                    </h3>
                    <p className="text-gray-600">{selectedPatient.address}</p>
                  </div>
                )}

                {/* سجل العلاجات */}
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                    <span className="p-2 bg-cyan-100 rounded-lg">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                    سجل العلاجات
                  </h3>
                  {getPatientTreatments(selectedPatient.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      لا توجد علاجات مسجلة
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-right p-3 rounded-tr-lg">التاريخ</th>
                            <th className="text-right p-3">نوع العلاج</th>
                            <th className="text-right p-3">الطبيب المعالج</th>
                            <th className="text-right p-3 rounded-tl-lg">ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPatientTreatments(selectedPatient.id).map((treatment) => (
                            <tr key={treatment.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{new Date(treatment.date).toLocaleDateString('ar-EG')}</td>
                              <td className="p-3">
                                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                                  {treatment.treatmentType}
                                </span>
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{getDoctorName(treatment.doctorId)}</div>
                                  <div className="text-xs text-gray-500">{getDoctorSpecialty(treatment.doctorId)}</div>
                                </div>
                              </td>
                              <td className="p-3 text-gray-600">{treatment.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* سجل المواعيد */}
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                    <span className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    سجل المواعيد والزيارات
                  </h3>
                  {getPatientAppointments(selectedPatient.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      لا توجد مواعيد مسجلة
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-right p-3 rounded-tr-lg">التاريخ</th>
                            <th className="text-right p-3">الوقت</th>
                            <th className="text-right p-3">الطبيب</th>
                            <th className="text-right p-3">الحالة</th>
                            <th className="text-right p-3 rounded-tl-lg">ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPatientAppointments(selectedPatient.id).map((appointment) => (
                            <tr key={appointment.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{new Date(appointment.date).toLocaleDateString('ar-EG')}</td>
                              <td className="p-3">{appointment.time}</td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{getDoctorName(appointment.doctorId)}</div>
                                  <div className="text-xs text-gray-500">{getDoctorSpecialty(appointment.doctorId)}</div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                                  {getStatusText(appointment.status)}
                                </span>
                              </td>
                              <td className="p-3 text-gray-600">{appointment.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">اختر مريضاً لعرض ملفه الطبي</h3>
              <p className="text-gray-500">قم باختيار مريض من القائمة لعرض السجل الطبي الكامل</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal - Hidden */}
      {showPrintModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 opacity-0">
          <div ref={printRef} className="bg-white max-w-4xl w-full">
            {/* Header */}
            <div className="header">
              {centerSettings?.logo && (
                <img src={centerSettings.logo} alt="Logo" className="logo" style={{ margin: '0 auto' }} />
              )}
              <div className="center-name">{centerSettings?.name || 'مركز الأسنان'}</div>
              <div className="center-info">
                {centerSettings?.phone && <span>📞 {centerSettings.phone}</span>}
                {centerSettings?.address && <span> | 📍 {centerSettings.address}</span>}
              </div>
            </div>

            {/* Print Date */}
            <div className="print-date">
              تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* Patient Header */}
            <div className="patient-header">
              <div className="patient-name">الملف الطبي: {selectedPatient.name}</div>
              <div className="patient-info">
                <div>📱 الهاتف: {selectedPatient.phone}</div>
                <div>👤 الجنس: {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                <div>🎂 العمر: {calculateAge(selectedPatient.age)} سنة</div>
                <div>📍 العنوان: {selectedPatient.address || 'غير محدد'}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="summary-box">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{getTotalTreatments(selectedPatient.id)}</div>
                  <div className="summary-label">إجمالي العلاجات</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{getCompletedAppointments(selectedPatient.id)}</div>
                  <div className="summary-label">الزيارات المكتملة</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value" style={{ fontSize: '14px' }}>
                    {getFirstVisitDate(selectedPatient.id) ? new Date(getFirstVisitDate(selectedPatient.id)!).toLocaleDateString('ar-EG') : '-'}
                  </div>
                  <div className="summary-label">أول زيارة</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value" style={{ fontSize: '14px' }}>
                    {getLastVisitDate(selectedPatient.id) ? new Date(getLastVisitDate(selectedPatient.id)!).toLocaleDateString('ar-EG') : '-'}
                  </div>
                  <div className="summary-label">آخر زيارة</div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {selectedPatient.medicalHistory && (
              <div className="section">
                <div className="section-title">⚠️ التاريخ المرضي</div>
                <div className="medical-history">{selectedPatient.medicalHistory}</div>
              </div>
            )}

            {/* Treatments */}
            <div className="section">
              <div className="section-title">🦷 سجل العلاجات</div>
              {getPatientTreatments(selectedPatient.id).length === 0 ? (
                <div className="no-data">لا توجد علاجات مسجلة</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>نوع العلاج</th>
                      <th>الطبيب المعالج</th>
                      <th>التخصص</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPatientTreatments(selectedPatient.id).map((treatment) => (
                      <tr key={treatment.id}>
                        <td>{new Date(treatment.date).toLocaleDateString('ar-EG')}</td>
                        <td>{treatment.treatmentType}</td>
                        <td>{getDoctorName(treatment.doctorId)}</td>
                        <td>{getDoctorSpecialty(treatment.doctorId)}</td>
                        <td>{treatment.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Appointments */}
            <div className="section">
              <div className="section-title">📅 سجل المواعيد والزيارات</div>
              {getPatientAppointments(selectedPatient.id).length === 0 ? (
                <div className="no-data">لا توجد مواعيد مسجلة</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>الوقت</th>
                      <th>الطبيب</th>
                      <th>الحالة</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPatientAppointments(selectedPatient.id).map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{new Date(appointment.date).toLocaleDateString('ar-EG')}</td>
                        <td>{appointment.time}</td>
                        <td>{getDoctorName(appointment.doctorId)}</td>
                        <td>
                          <span className={`status ${
                            appointment.status === 'completed' ? 'status-completed' :
                            appointment.status === 'scheduled' ? 'status-scheduled' : 'status-cancelled'
                          }`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td>{appointment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="footer">
              <p>هذا الملف الطبي صادر من {centerSettings?.name || 'مركز الأسنان'}</p>
              <p>جميع البيانات سرية ولا يجوز مشاركتها مع أطراف أخرى</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
