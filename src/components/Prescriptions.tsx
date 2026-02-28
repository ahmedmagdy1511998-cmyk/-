import React, { useState } from 'react';
import { Patient, Doctor, Prescription, PrescriptionMedication, CenterSettings } from '../types';

interface PrescriptionsProps {
  patients: Patient[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  centerSettings: CenterSettings;
}

const emptyMedication: PrescriptionMedication = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: ''
};

export const Prescriptions: React.FC<PrescriptionsProps> = ({
  patients,
  doctors,
  prescriptions,
  setPrescriptions,
  centerSettings
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    medications: [{ ...emptyMedication }],
    notes: ''
  });

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { ...emptyMedication }]
    });
  };

  const handleRemoveMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const handleMedicationChange = (index: number, field: keyof PrescriptionMedication, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);

    if (!patient || !doctor) return;

    const prescription: Prescription = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: patient.name,
      doctorId: formData.doctorId,
      doctorName: doctor.name,
      date: formData.date,
      medications: formData.medications.filter(m => m.name.trim()),
      notes: formData.notes
    };

    setPrescriptions([...prescriptions, prescription]);
    setFormData({
      patientId: '',
      doctorId: '',
      date: new Date().toISOString().split('T')[0],
      medications: [{ ...emptyMedication }],
      notes: ''
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوصفة؟')) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
  };

  const handlePrint = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>وصفة طبية - ${centerSettings.centerName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; background: #fff; }
          .prescription { max-width: 800px; margin: 0 auto; border: 2px solid #0d9488; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 20px; text-align: center; }
          .logo { max-width: 60px; margin-bottom: 10px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .rx-symbol { font-size: 48px; color: #0d9488; margin: 20px; }
          .content { padding: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd; }
          .info-item { text-align: center; }
          .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; color: #333; }
          .medications { margin: 20px 0; }
          .medications h3 { background: #f0fdfa; padding: 10px; border-right: 4px solid #0d9488; margin-bottom: 15px; }
          .medication { background: #f9fafb; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .med-name { font-size: 18px; font-weight: bold; color: #0d9488; margin-bottom: 10px; }
          .med-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px; }
          .med-detail { background: white; padding: 8px; border-radius: 5px; }
          .med-detail span { color: #666; }
          .notes { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .notes h4 { color: #92400e; margin-bottom: 10px; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .signature { margin-top: 30px; text-align: left; padding: 20px; }
          .signature-line { border-top: 1px solid #333; width: 200px; margin-top: 50px; padding-top: 10px; }
          @media print { 
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .prescription { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="prescription">
          <div class="header">
            ${centerSettings.logo ? `<img src="${centerSettings.logo}" class="logo" />` : ''}
            <h1>${centerSettings.centerName}</h1>
            <p>📞 ${centerSettings.phone} | 📍 ${centerSettings.address}</p>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <div class="rx-symbol">℞</div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">اسم المريض</div>
                <div class="info-value">${prescription.patientName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الطبيب المعالج</div>
                <div class="info-value">د. ${prescription.doctorName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">التاريخ</div>
                <div class="info-value">${new Date(prescription.date).toLocaleDateString('ar-EG')}</div>
              </div>
            </div>
            
            <div class="medications">
              <h3>💊 الأدوية الموصوفة</h3>
              ${prescription.medications.map((med, idx) => `
                <div class="medication">
                  <div class="med-name">${idx + 1}. ${med.name}</div>
                  <div class="med-details">
                    <div class="med-detail"><span>الجرعة:</span> ${med.dosage}</div>
                    <div class="med-detail"><span>عدد المرات:</span> ${med.frequency}</div>
                    <div class="med-detail"><span>المدة:</span> ${med.duration}</div>
                    <div class="med-detail"><span>تعليمات:</span> ${med.instructions || 'لا يوجد'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${prescription.notes ? `
              <div class="notes">
                <h4>📋 ملاحظات إضافية</h4>
                <p>${prescription.notes}</p>
              </div>
            ` : ''}
            
            <div class="signature">
              <div class="signature-line">
                توقيع الطبيب
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>🦷 ${centerSettings.centerName} - نتمنى لكم الشفاء العاجل</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">💊 الوصفات الطبية</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <span>➕</span>
          وصفة جديدة
        </button>
      </div>

      {/* نموذج إضافة وصفة */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white p-4 rounded-t-xl">
              <h3 className="text-xl font-bold">📝 إضافة وصفة طبية جديدة</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المريض *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">اختر المريض</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الطبيب *</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">اختر الطبيب</option>
                    {doctors.filter(d => d.isActive).map(d => (
                      <option key={d.id} value={d.id}>د. {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* الأدوية */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">💊 الأدوية</label>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                  >
                    ➕ إضافة دواء
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.medications.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-teal-700">الدواء {idx + 1}</span>
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑️ حذف
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="اسم الدواء *"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="text"
                          placeholder="الجرعة (مثال: 500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="text"
                          placeholder="عدد المرات (مثال: 3 مرات يومياً)"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="text"
                          placeholder="المدة (مثال: أسبوع)"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="text"
                          placeholder="تعليمات خاصة"
                          value={med.instructions}
                          onChange={(e) => handleMedicationChange(idx, 'instructions', e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 md:col-span-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات أو تعليمات إضافية..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium"
                >
                  ✓ حفظ الوصفة
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  ✕ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* عرض وصفة */}
      {viewPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">℞ تفاصيل الوصفة</h3>
              <button onClick={() => setViewPrescription(null)} className="text-white hover:text-gray-200">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">المريض</div>
                  <div className="font-bold">{viewPrescription.patientName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">الطبيب</div>
                  <div className="font-bold">د. {viewPrescription.doctorName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">التاريخ</div>
                  <div className="font-bold">{new Date(viewPrescription.date).toLocaleDateString('ar-EG')}</div>
                </div>
              </div>

              <h4 className="font-bold text-teal-700 mb-3">💊 الأدوية الموصوفة</h4>
              <div className="space-y-3 mb-6">
                {viewPrescription.medications.map((med, idx) => (
                  <div key={idx} className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="font-bold text-teal-800 text-lg mb-2">{med.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">الجرعة:</span> {med.dosage}</div>
                      <div><span className="text-gray-500">عدد المرات:</span> {med.frequency}</div>
                      <div><span className="text-gray-500">المدة:</span> {med.duration}</div>
                      <div><span className="text-gray-500">تعليمات:</span> {med.instructions || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>

              {viewPrescription.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                  <h4 className="font-bold text-yellow-800 mb-2">📋 ملاحظات</h4>
                  <p>{viewPrescription.notes}</p>
                </div>
              )}

              <button
                onClick={() => handlePrint(viewPrescription)}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2"
              >
                🖨️ طباعة الوصفة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* البحث */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <input
          type="text"
          placeholder="🔍 بحث عن وصفة بالمريض أو الطبيب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* قائمة الوصفات */}
      <div className="grid gap-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
            <span className="text-6xl block mb-4">💊</span>
            <p className="text-lg">لا توجد وصفات طبية</p>
          </div>
        ) : (
          filteredPrescriptions.map(prescription => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl">
                    ℞
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{prescription.patientName}</h3>
                    <p className="text-teal-600">د. {prescription.doctorName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(prescription.date).toLocaleDateString('ar-EG')} •
                      {prescription.medications.length} دواء
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewPrescription(prescription)}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    👁️ عرض
                  </button>
                  <button
                    onClick={() => handlePrint(prescription)}
                    className="bg-teal-100 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-200 text-sm"
                  >
                    🖨️ طباعة
                  </button>
                  <button
                    onClick={() => handleDelete(prescription.id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
