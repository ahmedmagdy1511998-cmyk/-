import React, { useRef, useState } from 'react';
import { CenterSettings } from '../types';

interface SettingsProps {
  centerSettings: CenterSettings;
  setCenterSettings: React.Dispatch<React.SetStateAction<CenterSettings>>;
  onClearAllData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  centerSettings,
  setCenterSettings,
  onClearAllData,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [editingCenter, setEditingCenter] = useState(false);
  const [tempSettings, setTempSettings] = useState<CenterSettings>(centerSettings);

  const handleClearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      if (confirm('تأكيد أخير: سيتم حذف جميع المرضى والأطباء والمواعيد والعلاجات والفواتير!')) {
        onClearAllData();
        alert('تم حذف جميع البيانات.');
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings({ ...tempSettings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCenterSettings = () => {
    setCenterSettings(tempSettings);
    setEditingCenter(false);
    alert('تم حفظ إعدادات المركز بنجاح!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-slate-700 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-white/20 p-3 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          الإعدادات
        </h1>
        <p className="text-slate-300 mt-2">إعدادات المركز والنظام</p>
      </div>

      {/* Center Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-purple-600 to-indigo-500 p-5 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            إعدادات المركز
          </h2>
          {!editingCenter && (
            <button
              onClick={() => {
                setTempSettings(centerSettings);
                setEditingCenter(true);
              }}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل
            </button>
          )}
        </div>
        <div className="p-6">
          {editingCenter ? (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">شعار المركز</label>
                {tempSettings.logo ? (
                  <div className="relative">
                    <img
                      src={tempSettings.logo}
                      alt="شعار المركز"
                      className="w-32 h-32 object-contain rounded-2xl border-4 border-purple-200 shadow-lg"
                    />
                    <button
                      onClick={() => setTempSettings({ ...tempSettings, logo: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <span className="text-3xl text-gray-400 mb-1">📷</span>
                    <span className="text-xs text-gray-500">رفع شعار</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="text-purple-500 hover:text-purple-600 font-medium text-sm"
                >
                  {tempSettings.logo ? 'تغيير الشعار' : 'اختر صورة'}
                </button>
              </div>

              {/* Center Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المركز</label>
                <input
                  type="text"
                  value={tempSettings.centerName}
                  onChange={(e) => setTempSettings({ ...tempSettings, centerName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  placeholder="اسم المركز"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  placeholder="رقم الهاتف"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                <textarea
                  value={tempSettings.address}
                  onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  placeholder="عنوان المركز"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCenterSettings}
                  className="flex-1 bg-gradient-to-l from-purple-600 to-indigo-500 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setEditingCenter(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Logo Display */}
              <div className="flex-shrink-0">
                {centerSettings.logo ? (
                  <img
                    src={centerSettings.logo}
                    alt="شعار المركز"
                    className="w-28 h-28 object-contain rounded-2xl border-4 border-purple-200 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">🦷</span>
                  </div>
                )}
              </div>

              {/* Center Info */}
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{centerSettings.centerName}</h3>
                {centerSettings.phone && (
                  <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span>📞</span> {centerSettings.phone}
                  </p>
                )}
                {centerSettings.address && (
                  <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                    <span>📍</span> {centerSettings.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
        <div className="bg-gradient-to-l from-red-500 to-rose-400 p-5 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            منطقة الخطر
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            <strong className="text-red-600">تحذير:</strong> حذف جميع البيانات سيؤدي إلى فقدان جميع المرضى والأطباء والمواعيد والعلاجات والفواتير بشكل نهائي.
          </p>
          <button
            onClick={handleClearAll}
            className="bg-red-100 text-red-600 py-3 px-6 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            حذف جميع البيانات
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          معلومات النظام
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">اسم النظام</p>
            <p className="font-semibold text-gray-800">نظام إدارة مركز الأسنان</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">الإصدار</p>
            <p className="font-semibold text-gray-800">2.0.0</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">تخزين البيانات</p>
            <p className="font-semibold text-gray-800">LocalStorage</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">آخر تحديث</p>
            <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
