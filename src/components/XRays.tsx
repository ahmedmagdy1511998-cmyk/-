import React, { useState } from 'react';
import { Patient, Doctor, XRayImage, CenterSettings } from '../types';

interface XRaysProps {
  patients: Patient[];
  doctors: Doctor[];
  xrays: XRayImage[];
  setXrays: React.Dispatch<React.SetStateAction<XRayImage[]>>;
  centerSettings: CenterSettings;
}

export const XRays: React.FC<XRaysProps> = ({
  patients,
  doctors,
  xrays,
  setXrays,
  centerSettings
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [viewImage, setViewImage] = useState<XRayImage | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    title: '',
    description: '',
    imageData: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredXrays = xrays.filter(x => {
    const matchesSearch = x.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      x.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = selectedPatient === 'all' || x.patientId === selectedPatient;
    return matchesSearch && matchesPatient;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);

    if (!patient || !doctor || !formData.imageData) return;

    const xray: XRayImage = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: patient.name,
      doctorId: formData.doctorId,
      doctorName: doctor.name,
      title: formData.title,
      description: formData.description,
      imageData: formData.imageData,
      date: formData.date
    };

    setXrays([...xrays, xray]);
    setFormData({
      patientId: '',
      doctorId: '',
      title: '',
      description: '',
      imageData: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      setXrays(xrays.filter(x => x.id !== id));
    }
  };

  const handlePrint = (xray: XRayImage) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>صورة أشعة - ${centerSettings.centerName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0d9488; }
          .logo { max-width: 60px; margin-bottom: 10px; }
          .header h1 { color: #0d9488; font-size: 24px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .info { display: flex; justify-content: space-between; background: #f0fdfa; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
          .info-item { text-align: center; }
          .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; color: #333; }
          .xray-image { text-align: center; margin: 20px 0; }
          .xray-image img { max-width: 100%; max-height: 500px; border: 3px solid #0d9488; border-radius: 10px; }
          .title { text-align: center; font-size: 20px; font-weight: bold; color: #0d9488; margin: 20px 0; }
          .description { background: #f9fafb; padding: 15px; border-radius: 10px; border-right: 4px solid #0d9488; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${centerSettings.logo ? `<img src="${centerSettings.logo}" class="logo" />` : ''}
            <h1>${centerSettings.centerName}</h1>
            <p>📞 ${centerSettings.phone} | 📍 ${centerSettings.address}</p>
          </div>
          
          <div class="info">
            <div class="info-item">
              <div class="info-label">اسم المريض</div>
              <div class="info-value">${xray.patientName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الطبيب</div>
              <div class="info-value">د. ${xray.doctorName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">التاريخ</div>
              <div class="info-value">${new Date(xray.date).toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
          
          <div class="title">📷 ${xray.title}</div>
          
          <div class="xray-image">
            <img src="${xray.imageData}" alt="صورة الأشعة" />
          </div>
          
          ${xray.description ? `
            <div class="description">
              <strong>📋 الوصف والملاحظات:</strong><br/>
              ${xray.description}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>🦷 ${centerSettings.centerName} - صحتك أولويتنا</p>
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
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
        <h2 className="text-2xl font-bold text-gray-800">📸 صور الأشعة</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <span>➕</span>
          إضافة صورة
        </button>
      </div>

      {/* نموذج إضافة صورة */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-purple-600 to-purple-700 text-white p-4 rounded-t-xl">
              <h3 className="text-xl font-bold">📸 إضافة صورة أشعة جديدة</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المريض *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر الطبيب</option>
                    {doctors.filter(d => d.isActive).map(d => (
                      <option key={d.id} value={d.id}>د. {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الصورة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أشعة بانوراما"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الأشعة *</label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="xray-upload"
                  />
                  <label htmlFor="xray-upload" className="cursor-pointer">
                    {formData.imageData ? (
                      <div>
                        <img src={formData.imageData} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <p className="text-sm text-gray-500 mt-2">اضغط لتغيير الصورة</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl block mb-2">📷</span>
                        <p className="text-gray-500">اضغط لرفع صورة الأشعة</p>
                        <p className="text-sm text-gray-400">PNG, JPG, JPEG</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف والملاحظات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أي ملاحظات أو وصف للصورة..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!formData.imageData}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ✓ حفظ الصورة
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

      {/* عرض صورة */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-purple-600 to-purple-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">📸 {viewImage.title}</h3>
              <button onClick={() => setViewImage(null)} className="text-white hover:text-gray-200 text-2xl">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">المريض</div>
                  <div className="font-bold">{viewImage.patientName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">الطبيب</div>
                  <div className="font-bold">د. {viewImage.doctorName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">التاريخ</div>
                  <div className="font-bold">{new Date(viewImage.date).toLocaleDateString('ar-EG')}</div>
                </div>
              </div>

              <div className="bg-black rounded-lg p-2 mb-4">
                <img
                  src={viewImage.imageData}
                  alt={viewImage.title}
                  className="w-full max-h-[500px] object-contain rounded"
                />
              </div>

              {viewImage.description && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <h4 className="font-bold text-purple-800 mb-2">📋 الوصف والملاحظات</h4>
                  <p>{viewImage.description}</p>
                </div>
              )}

              <button
                onClick={() => handlePrint(viewImage)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
              >
                🖨️ طباعة الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 بحث بالمريض أو العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="min-w-[200px]">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع المرضى</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* شبكة الصور */}
      {filteredXrays.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
          <span className="text-6xl block mb-4">📸</span>
          <p className="text-lg">لا توجد صور أشعة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredXrays.map(xray => (
            <div key={xray.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
              <div className="relative">
                <img
                  src={xray.imageData}
                  alt={xray.title}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setViewImage(xray)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => setViewImage(xray)}
                    className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    👁️ عرض
                  </button>
                  <button
                    onClick={() => handlePrint(xray)}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    🖨️ طباعة
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{xray.title}</h3>
                <p className="text-sm text-purple-600 mb-2">{xray.patientName}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>د. {xray.doctorName}</span>
                  <span>{new Date(xray.date).toLocaleDateString('ar-EG')}</span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => setViewImage(xray)}
                    className="flex-1 bg-purple-100 text-purple-700 py-1.5 rounded-lg hover:bg-purple-200 text-sm"
                  >
                    👁️ عرض
                  </button>
                  <button
                    onClick={() => handleDelete(xray.id)}
                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
