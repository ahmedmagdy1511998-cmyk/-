import React, { useState } from 'react';
import { Treatment, Patient, Doctor } from '../types';

interface TreatmentsProps {
  treatments: Treatment[];
  setTreatments: React.Dispatch<React.SetStateAction<Treatment[]>>;
  patients: Patient[];
  doctors: Doctor[];
}

const TREATMENT_TYPES = [
  { name: 'فحص دوري', price: 100 },
  { name: 'تنظيف الأسنان', price: 200 },
  { name: 'حشو عادي', price: 300 },
  { name: 'حشو تجميلي', price: 500 },
  { name: 'علاج العصب', price: 800 },
  { name: 'خلع ضرس', price: 250 },
  { name: 'خلع ضرس جراحي', price: 500 },
  { name: 'تركيب تاج', price: 1500 },
  { name: 'زراعة سن', price: 5000 },
  { name: 'تقويم أسنان', price: 8000 },
  { name: 'تبييض الأسنان', price: 1000 },
];

export const Treatments: React.FC<TreatmentsProps> = ({
  treatments,
  setTreatments,
  patients,
  doctors,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    treatmentType: '',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      treatmentType: '',
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);
    
    const newTreatment: Treatment = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: patient?.name || '',
      doctorId: formData.doctorId,
      doctorName: doctor?.name || '',
      treatmentType: formData.treatmentType,
      description: formData.description,
      cost: parseFloat(formData.cost),
      date: formData.date,
      createdAt: new Date().toISOString(),
    };
    setTreatments([...treatments, newTreatment]);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العلاج؟')) {
      setTreatments(treatments.filter(t => t.id !== id));
    }
  };

  const handleTreatmentTypeChange = (type: string) => {
    const treatment = TREATMENT_TYPES.find(t => t.name === type);
    setFormData({
      ...formData,
      treatmentType: type,
      cost: treatment?.price.toString() || '',
    });
  };

  const filteredTreatments = treatments.filter(t =>
    t.patientName.includes(searchTerm) ||
    t.treatmentType.includes(searchTerm) ||
    t.doctorName.includes(searchTerm)
  );

  const totalRevenue = treatments.reduce((sum, t) => sum + t.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-white/20 p-3 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </span>
              سجل العلاجات
            </h1>
            <p className="text-amber-100 mt-2">إجمالي العلاجات: {treatments.length} | الإيرادات: {totalRevenue.toLocaleString()} جنيه</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-white text-amber-600 px-6 py-3 rounded-2xl font-bold hover:bg-amber-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            تسجيل علاج جديد
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="relative">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="البحث بالمريض أو نوع العلاج أو الطبيب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTreatments.map((treatment) => (
          <div key={treatment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-l from-amber-500 to-orange-400 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-bold">{treatment.treatmentType}</p>
                  <p className="text-amber-100 text-sm">{new Date(treatment.date).toLocaleDateString('ar-EG')}</p>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-lg font-bold">
                  {treatment.cost.toLocaleString()} ج
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">
                  {treatment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{treatment.patientName}</p>
                  <p className="text-sm text-gray-500">د. {treatment.doctorName}</p>
                </div>
              </div>
              {treatment.description && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600">{treatment.description}</p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(treatment.id)}
                  className="p-2 bg-gray-100 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTreatments.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد علاجات</h3>
          <p className="text-gray-500">قم بتسجيل علاج جديد</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-l from-amber-500 to-orange-500 p-6 text-white rounded-t-3xl">
              <h2 className="text-2xl font-bold">تسجيل علاج جديد</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المريض *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الطبيب المعالج *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر الطبيب</option>
                  {doctors.filter(d => d.isActive).map(d => (
                    <option key={d.id} value={d.id}>د. {d.name} - {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع العلاج *</label>
                <select
                  value={formData.treatmentType}
                  onChange={(e) => handleTreatmentTypeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر نوع العلاج</option>
                  {TREATMENT_TYPES.map(t => (
                    <option key={t.name} value={t.name}>{t.name} - {t.price} جنيه</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التكلفة *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:bg-white transition-all outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-l from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  تسجيل العلاج
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
