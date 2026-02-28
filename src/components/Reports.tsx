import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Appointment, Treatment, Invoice, InventoryItem } from '../types';

interface ReportsProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  treatments: Treatment[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  centerSettings: { centerName: string; logo: string; phone: string; address: string };
}

type ReportType = 'monthly' | 'yearly' | 'doctor' | 'treatment' | 'financial';

export const Reports: React.FC<ReportsProps> = ({
  patients,
  doctors,
  appointments,
  treatments,
  invoices,
  inventory,
  centerSettings
}) => {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedDoctor, setSelectedDoctor] = useState('all');

  const monthlyData = useMemo(() => {
    const filteredAppointments = appointments.filter(a => a.date.startsWith(selectedMonth));
    const filteredTreatments = treatments.filter(t => t.date.startsWith(selectedMonth));
    const filteredInvoices = invoices.filter(i => i.date.startsWith(selectedMonth));
    const newPatients = patients.filter(p => p.createdAt.startsWith(selectedMonth));

    return {
      totalAppointments: filteredAppointments.length,
      completedAppointments: filteredAppointments.filter(a => a.status === 'completed').length,
      cancelledAppointments: filteredAppointments.filter(a => a.status === 'cancelled').length,
      totalTreatments: filteredTreatments.length,
      totalRevenue: filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
      totalPaid: filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0),
      totalPending: filteredInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0),
      newPatients: newPatients.length,
      treatmentsByType: filteredTreatments.reduce((acc, t) => {
        acc[t.treatmentType] = (acc[t.treatmentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      revenueByTreatment: filteredTreatments.reduce((acc, t) => {
        acc[t.treatmentType] = (acc[t.treatmentType] || 0) + t.cost;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [selectedMonth, appointments, treatments, invoices, patients]);

  const yearlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
      const monthAppointments = appointments.filter(a => a.date.startsWith(month));
      const monthTreatments = treatments.filter(t => t.date.startsWith(month));
      const monthInvoices = invoices.filter(inv => inv.date.startsWith(month));
      const monthPatients = patients.filter(p => p.createdAt.startsWith(month));

      return {
        month: new Date(2024, i).toLocaleDateString('ar-EG', { month: 'long' }),
        appointments: monthAppointments.length,
        treatments: monthTreatments.length,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paid: monthInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        newPatients: monthPatients.length
      };
    });

    const yearAppointments = appointments.filter(a => a.date.startsWith(selectedYear));
    const yearTreatments = treatments.filter(t => t.date.startsWith(selectedYear));
    const yearInvoices = invoices.filter(inv => inv.date.startsWith(selectedYear));
    const yearPatients = patients.filter(p => p.createdAt.startsWith(selectedYear));

    return {
      months,
      totals: {
        appointments: yearAppointments.length,
        treatments: yearTreatments.length,
        revenue: yearInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paid: yearInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        newPatients: yearPatients.length
      }
    };
  }, [selectedYear, appointments, treatments, invoices, patients]);

  const doctorData = useMemo(() => {
    const doctorStats = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
      const doctorTreatments = treatments.filter(t => t.doctorId === doctor.id);

      return {
        doctor,
        totalAppointments: doctorAppointments.length,
        completedAppointments: doctorAppointments.filter(a => a.status === 'completed').length,
        totalTreatments: doctorTreatments.length,
        totalRevenue: doctorTreatments.reduce((sum, t) => sum + t.cost, 0)
      };
    });

    return doctorStats;
  }, [doctors, appointments, treatments]);

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير - ${centerSettings.centerName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px; }
          .logo { max-width: 80px; margin-bottom: 10px; }
          h1 { color: #0d9488; margin: 10px 0; }
          .info { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
          th { background: #0d9488; color: white; }
          .stat-box { display: inline-block; width: 23%; margin: 1%; padding: 15px; background: #f0fdfa; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0d9488; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .section-title { background: #0d9488; color: white; padding: 10px; margin: 20px 0 10px; border-radius: 5px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${centerSettings.logo ? `<img src="${centerSettings.logo}" class="logo" />` : ''}
          <h1>${centerSettings.centerName}</h1>
          <div class="info">${centerSettings.phone} | ${centerSettings.address}</div>
          <div class="info">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📊 التقارير</h2>
        <button
          onClick={handlePrint}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <span>🖨️</span>
          طباعة التقرير
        </button>
      </div>

      {/* اختيار نوع التقرير */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              reportType === 'monthly' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📅 تقرير شهري
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              reportType === 'yearly' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📆 تقرير سنوي
          </button>
          <button
            onClick={() => setReportType('doctor')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              reportType === 'doctor' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            👨‍⚕️ تقرير الأطباء
          </button>
          <button
            onClick={() => setReportType('treatment')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              reportType === 'treatment' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🦷 تقرير العلاجات
          </button>
          <button
            onClick={() => setReportType('financial')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              reportType === 'financial' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            💰 تقرير مالي
          </button>
        </div>

        {/* فلاتر */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر الشهر</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}
          {(reportType === 'yearly' || reportType === 'financial') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر السنة</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          {reportType === 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر الطبيب</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">جميع الأطباء</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* محتوى التقرير */}
      <div id="report-content" className="bg-white rounded-xl shadow-lg p-6">
        {/* التقرير الشهري */}
        {reportType === 'monthly' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-700">
              📅 التقرير الشهري - {getMonthName(selectedMonth)}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600">{monthlyData.totalAppointments}</div>
                <div className="text-sm text-gray-600">إجمالي المواعيد</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600">{monthlyData.completedAppointments}</div>
                <div className="text-sm text-gray-600">تم الكشف</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600">{monthlyData.newPatients}</div>
                <div className="text-sm text-gray-600">مرضى جدد</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-teal-600">{monthlyData.totalTreatments}</div>
                <div className="text-sm text-gray-600">علاجات</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-600">{monthlyData.totalRevenue.toLocaleString()} ج.م</div>
                <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-cyan-600">{monthlyData.totalPaid.toLocaleString()} ج.م</div>
                <div className="text-sm text-gray-600">المحصل</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-orange-600">{monthlyData.totalPending.toLocaleString()} ج.م</div>
                <div className="text-sm text-gray-600">المتبقي</div>
              </div>
            </div>

            {Object.keys(monthlyData.treatmentsByType).length > 0 && (
              <div>
                <h4 className="font-bold mb-4 text-gray-700">📊 العلاجات حسب النوع</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-600 text-white">
                      <th className="p-3 text-right rounded-tr-lg">نوع العلاج</th>
                      <th className="p-3 text-center">العدد</th>
                      <th className="p-3 text-center rounded-tl-lg">الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlyData.treatmentsByType).map(([type, count], idx) => (
                      <tr key={type} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border">{type}</td>
                        <td className="p-3 border text-center">{count}</td>
                        <td className="p-3 border text-center">{(monthlyData.revenueByTreatment[type] || 0).toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* التقرير السنوي */}
        {reportType === 'yearly' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-700">
              📆 التقرير السنوي - {selectedYear}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{yearlyData.totals.appointments}</div>
                <div className="text-sm text-gray-600">المواعيد</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{yearlyData.totals.treatments}</div>
                <div className="text-sm text-gray-600">العلاجات</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-600">{yearlyData.totals.newPatients}</div>
                <div className="text-sm text-gray-600">مرضى جدد</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-teal-600">{yearlyData.totals.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">الإيرادات</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-cyan-600">{yearlyData.totals.paid.toLocaleString()}</div>
                <div className="text-sm text-gray-600">المحصل</div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="p-3 text-right rounded-tr-lg">الشهر</th>
                  <th className="p-3 text-center">المواعيد</th>
                  <th className="p-3 text-center">العلاجات</th>
                  <th className="p-3 text-center">مرضى جدد</th>
                  <th className="p-3 text-center">الإيرادات</th>
                  <th className="p-3 text-center rounded-tl-lg">المحصل</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.months.map((month, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 border font-medium">{month.month}</td>
                    <td className="p-3 border text-center">{month.appointments}</td>
                    <td className="p-3 border text-center">{month.treatments}</td>
                    <td className="p-3 border text-center">{month.newPatients}</td>
                    <td className="p-3 border text-center">{month.revenue.toLocaleString()}</td>
                    <td className="p-3 border text-center">{month.paid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* تقرير الأطباء */}
        {reportType === 'doctor' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-700">👨‍⚕️ تقرير أداء الأطباء</h3>

            <div className="grid gap-6">
              {(selectedDoctor === 'all' ? doctorData : doctorData.filter(d => d.doctor.id === selectedDoctor)).map(stat => (
                <div key={stat.doctor.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl">
                      👨‍⚕️
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{stat.doctor.name}</h4>
                      <p className="text-teal-600">{stat.doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{stat.totalAppointments}</div>
                      <div className="text-xs text-gray-500">إجمالي المواعيد</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{stat.completedAppointments}</div>
                      <div className="text-xs text-gray-500">تم الكشف</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{stat.totalTreatments}</div>
                      <div className="text-xs text-gray-500">العلاجات</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                      <div className="text-2xl font-bold text-teal-600">{stat.totalRevenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">الإيرادات</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تقرير العلاجات */}
        {reportType === 'treatment' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-700">🦷 تقرير العلاجات</h3>

            {(() => {
              const treatmentStats = treatments.reduce((acc, t) => {
                if (!acc[t.treatmentType]) {
                  acc[t.treatmentType] = { count: 0, revenue: 0 };
                }
                acc[t.treatmentType].count++;
                acc[t.treatmentType].revenue += t.cost;
                return acc;
              }, {} as Record<string, { count: number; revenue: number }>);

              const sortedTreatments = Object.entries(treatmentStats).sort((a, b) => b[1].count - a[1].count);

              return (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-teal-600">{treatments.length}</div>
                      <div className="text-sm text-gray-600">إجمالي العلاجات</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-blue-600">{Object.keys(treatmentStats).length}</div>
                      <div className="text-sm text-gray-600">أنواع العلاجات</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {treatments.reduce((sum, t) => sum + t.cost, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
                    </div>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="p-3 text-right rounded-tr-lg">نوع العلاج</th>
                        <th className="p-3 text-center">عدد العلاجات</th>
                        <th className="p-3 text-center">الإيرادات</th>
                        <th className="p-3 text-center rounded-tl-lg">متوسط السعر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTreatments.map(([type, data], idx) => (
                        <tr key={type} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 border font-medium">{type}</td>
                          <td className="p-3 border text-center">{data.count}</td>
                          <td className="p-3 border text-center">{data.revenue.toLocaleString()} ج.م</td>
                          <td className="p-3 border text-center">{Math.round(data.revenue / data.count).toLocaleString()} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* التقرير المالي */}
        {reportType === 'financial' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-700">💰 التقرير المالي - {selectedYear}</h3>

            {(() => {
              const yearInvoices = invoices.filter(i => i.date.startsWith(selectedYear));
              const totalRevenue = yearInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
              const totalPaid = yearInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
              const totalPending = totalRevenue - totalPaid;
              const paidInvoices = yearInvoices.filter(i => i.status === 'paid').length;
              const partialInvoices = yearInvoices.filter(i => i.status === 'partial').length;
              const unpaidInvoices = yearInvoices.filter(i => i.status === 'unpaid').length;

              const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

              return (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} ج.م</div>
                      <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-teal-600">{totalPaid.toLocaleString()} ج.م</div>
                      <div className="text-sm text-gray-600">المبالغ المحصلة</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-orange-600">{totalPending.toLocaleString()} ج.م</div>
                      <div className="text-sm text-gray-600">المبالغ المعلقة</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-600">{inventoryValue.toLocaleString()} ج.م</div>
                      <div className="text-sm text-gray-600">قيمة المخزون</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-green-700">{paidInvoices}</div>
                      <div className="text-sm text-green-600">فواتير مدفوعة</div>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-yellow-700">{partialInvoices}</div>
                      <div className="text-sm text-yellow-600">مدفوعة جزئياً</div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-red-700">{unpaidInvoices}</div>
                      <div className="text-sm text-red-600">غير مدفوعة</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold mb-4">📈 نسبة التحصيل</h4>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-l from-teal-400 to-teal-600 h-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ width: `${totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0}%` }}
                      >
                        {totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
