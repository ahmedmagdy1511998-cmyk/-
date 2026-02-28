import React, { useState, useRef } from 'react';
import { CenterSettings } from '../types';

interface SetupWizardProps {
  onComplete: (settings: CenterSettings) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [centerName, setCenterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (!centerName.trim()) {
      alert('يرجى إدخال اسم المركز');
      return;
    }
    onComplete({
      centerName,
      logo,
      phone,
      address,
      isSetupComplete: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-blue-600 to-cyan-500 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🦷</span>
          </div>
          <h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة مركز الأسنان</h1>
          <p className="text-blue-100 mt-2">دعنا نقوم بإعداد المركز الخاص بك</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 p-4 bg-gray-50">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-12 h-2 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-l from-blue-500 to-cyan-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🏥</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">اسم المركز</h2>
                <p className="text-gray-500">أدخل اسم مركز الأسنان الخاص بك</p>
              </div>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="مثال: مركز الابتسامة لطب الأسنان"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-center"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">بيانات التواصل</h2>
                <p className="text-gray-500">أدخل معلومات التواصل مع المركز</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل عنوان المركز"
                    rows={3}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🖼️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">شعار المركز</h2>
                <p className="text-gray-500">قم برفع شعار المركز (اختياري)</p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                {logo ? (
                  <div className="relative">
                    <img
                      src={logo}
                      alt="شعار المركز"
                      className="w-40 h-40 object-contain rounded-2xl border-4 border-blue-200 shadow-lg"
                    />
                    <button
                      onClick={() => setLogo('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <span className="text-4xl text-gray-400 mb-2">📷</span>
                    <span className="text-sm text-gray-500">اضغط للرفع</span>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  {logo ? 'تغيير الصورة' : 'اختر صورة من جهازك'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              السابق
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !centerName.trim()) {
                  alert('يرجى إدخال اسم المركز');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-8 py-3 bg-gradient-to-l from-blue-500 to-cyan-400 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-500 transition-all shadow-lg"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-gradient-to-l from-green-500 to-emerald-400 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-500 transition-all shadow-lg flex items-center gap-2"
            >
              <span>🚀</span>
              بدء استخدام النظام
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
