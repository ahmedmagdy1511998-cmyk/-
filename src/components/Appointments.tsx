import React, { useState } from 'react';
import { Appointment, Patient, Doctor } from '../types';

interface AppointmentsProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  patients: Patient[];
  doctors: Doctor[];
}

export const Appointments: React.FC<AppointmentsProps> = ({
  appointments,
  setAppointments,
  patients,
  doctors,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    treatment: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      treatment: '',
      notes: '',
    });
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);
    
    if (editingAppointment) {
      setAppointments(appointments.map(a =>
        a.id === editingAppointment.id
          ? { 
              ...a, 
              ...formData, 
              patientName: patient?.name || '',
              doctorName: doctor?.name || ''
            }
          : a
      ));
    } else {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...formData,
        patientName: patient?.name || '',
        doctorName: doctor?.name || '',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      setAppointments([...appointments, newAppointment]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      treatment: appointment.treatment,
      notes: appointment.notes,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map(a =>
      a.id === id ? { ...a, status } : a
    ));
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterDate && a.date !== filterDate) return false;
    return true;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'قيد الانتظار';
      case 'completed': return 'تم الكشف';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-white/20 p-3 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              إدارة المواعيد
            </h1>
            <p className="text-emerald-100 mt-2">إجمالي المواعيد: {appointments.length}</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة موعد جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="scheduled">قيد الانتظار</option>
              <option value="completed">تم الكشف</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            >
              مسح الفلتر
            </button>
          )}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
            <div className={`p-4 ${
              appointment.status === 'scheduled' ? 'bg-gradient-to-l from-blue-500 to-cyan-400' :
              appointment.status === 'completed' ? 'bg-gradient-to-l from-green-500 to-emerald-400' :
              'bg-gradient-to-l from-red-500 to-rose-400'
            } text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">{new Date(appointment.date).toLocaleDateString('ar-EG')}</p>
                  <p className="text-xl font-bold">{appointment.time}</p>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {getStatusText(appointment.status)}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">د. {appointment.doctorName}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-600">{appointment.treatment}</p>
              </div>
              {appointment.notes && (
                <p className="text-sm text-gray-500">{appointment.notes}</p>
              )}
              <div className="flex gap-2 pt-2">
                {appointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => updateStatus(appointment.id, 'completed')}
                      className="flex-1 bg-green-100 text-green-700 py-2 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      تم الكشف
                    </button>
                    <button
                      onClick={() => updateStatus(appointment.id, 'cancelled')}
                      className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      ملغي
                    </button>
                  </>
                )}
                {appointment.status !== 'scheduled' && (
                  <button
                    onClick={() => updateStatus(appointment.id, 'scheduled')}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    إرجاع لقيد الانتظار
                  </button>
                )}
                <button
                  onClick={() => handleEdit(appointment)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(appointment.id)}
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

      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مواعيد</h3>
          <p className="text-gray-500">قم بإضافة موعد جديد</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-l from-emerald-600 to-teal-500 p-6 text-white rounded-t-3xl">
              <h2 className="text-2xl font-bold">
                {editingAppointment ? 'تعديل الموعد' : 'إضافة موعد جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المريض *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الطبيب *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر الطبيب</option>
                  {doctors.filter(d => d.isActive).map(d => (
                    <option key={d.id} value={d.id}>د. {d.name} - {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الوقت *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">العلاج *</label>
                <input
                  type="text"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  placeholder="مثال: فحص دوري"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-500 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg"
                >
                  {editingAppointment ? 'حفظ التعديلات' : 'إضافة الموعد'}
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
