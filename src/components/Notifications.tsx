import React, { useMemo } from 'react';
import { Appointment, Invoice, InventoryItem, AppNotification } from '../types';

interface NotificationsProps {
  appointments: Appointment[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const Notifications: React.FC<NotificationsProps> = ({
  appointments,
  invoices,
  inventory,
  notifications,
  setNotifications
}) => {
  // حساب التنبيهات التلقائية
  const autoNotifications = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const alerts: { type: AppNotification['type']; title: string; message: string; id: string }[] = [];

    // مواعيد اليوم
    const todayAppointments = appointments.filter(a => a.date === today && a.status === 'scheduled');
    todayAppointments.forEach(apt => {
      alerts.push({
        type: 'appointment',
        title: '📅 موعد اليوم',
        message: `${apt.patientName} - الساعة ${apt.time} مع د. ${apt.doctorName}`,
        id: `apt-${apt.id}`
      });
    });

    // مواعيد الغد
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowAppointments = appointments.filter(a => a.date === tomorrowStr && a.status === 'scheduled');
    if (tomorrowAppointments.length > 0) {
      alerts.push({
        type: 'appointment',
        title: '📆 مواعيد الغد',
        message: `لديك ${tomorrowAppointments.length} موعد غداً`,
        id: 'apt-tomorrow'
      });
    }

    // فواتير غير مدفوعة
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
    if (unpaidInvoices.length > 0) {
      const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
      alerts.push({
        type: 'payment',
        title: '💰 فواتير غير مدفوعة',
        message: `${unpaidInvoices.length} فاتورة غير مدفوعة بإجمالي ${totalUnpaid.toLocaleString()} ج.م`,
        id: 'unpaid-invoices'
      });
    }

    // فواتير مدفوعة جزئياً
    const partialInvoices = invoices.filter(i => i.status === 'partial');
    if (partialInvoices.length > 0) {
      const totalPending = partialInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
      alerts.push({
        type: 'payment',
        title: '💳 فواتير مدفوعة جزئياً',
        message: `${partialInvoices.length} فاتورة بها متأخرات ${totalPending.toLocaleString()} ج.م`,
        id: 'partial-invoices'
      });
    }

    // مخزون ناقص
    const lowStock = inventory.filter(item => item.quantity <= item.minQuantity);
    lowStock.forEach(item => {
      alerts.push({
        type: 'inventory',
        title: '⚠️ نقص في المخزون',
        message: `${item.name} - المتبقي ${item.quantity} ${item.unit} فقط`,
        id: `inv-low-${item.id}`
      });
    });

    // مخزون زائد
    const highStock = inventory.filter(item => item.quantity >= item.maxQuantity);
    highStock.forEach(item => {
      alerts.push({
        type: 'inventory',
        title: '📦 مخزون زائد',
        message: `${item.name} - الكمية ${item.quantity} ${item.unit} تجاوزت الحد الأقصى`,
        id: `inv-high-${item.id}`
      });
    });

    return alerts;
  }, [appointments, invoices, inventory]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      setNotifications([]);
    }
  };

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'inventory': return '📦';
      case 'payment': return '💰';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'appointment': return 'from-blue-400 to-blue-600';
      case 'inventory': return 'from-orange-400 to-orange-600';
      case 'payment': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🔔 التنبيهات والإشعارات</h2>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm"
            >
              ✓ تعليم الكل كمقروء
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm"
            >
              🗑️ حذف الكل
            </button>
          )}
        </div>
      </div>

      {/* التنبيهات التلقائية */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-teal-700 flex items-center gap-2">
          <span>⚡</span>
          التنبيهات الفورية
        </h3>

        {autoNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-5xl block mb-3">✅</span>
            <p>لا توجد تنبيهات حالياً - كل شيء على ما يرام!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {autoNotifications.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-r-4 ${
                  alert.type === 'appointment' ? 'bg-blue-50 border-blue-500' :
                  alert.type === 'payment' ? 'bg-green-50 border-green-500' :
                  alert.type === 'inventory' ? 'bg-orange-50 border-orange-500' :
                  'bg-gray-50 border-gray-500'
                }`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(alert.type)} flex items-center justify-center text-white text-xl`}>
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{alert.title}</h4>
                  <p className="text-gray-600 text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ملخص سريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center">
          <div className="text-3xl font-bold">
            {appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'scheduled').length}
          </div>
          <div className="text-sm opacity-90">مواعيد اليوم</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl text-center">
          <div className="text-3xl font-bold">
            {inventory.filter(i => i.quantity <= i.minQuantity).length}
          </div>
          <div className="text-sm opacity-90">مواد ناقصة</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl text-center">
          <div className="text-3xl font-bold">
            {invoices.filter(i => i.status === 'unpaid').length}
          </div>
          <div className="text-sm opacity-90">فواتير غير مدفوعة</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-xl text-center">
          <div className="text-3xl font-bold">
            {invoices.filter(i => i.status === 'partial').length}
          </div>
          <div className="text-sm opacity-90">مدفوعة جزئياً</div>
        </div>
      </div>

      {/* الإشعارات المحفوظة */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2">
          <span>📋</span>
          سجل الإشعارات
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
              {unreadCount} جديد
            </span>
          )}
        </h3>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-5xl block mb-3">📭</span>
            <p>لا توجد إشعارات محفوظة</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notification => (
              <div
                key={notification.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition ${
                  notification.isRead ? 'bg-gray-50' : 'bg-teal-50 border border-teal-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getTypeColor(notification.type)} flex items-center justify-center text-white`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-teal-600 hover:text-teal-800 p-2"
                      title="تعليم كمقروء"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="حذف"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نصائح */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
        <h3 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
          <span>💡</span>
          نصائح لإدارة أفضل
        </h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-teal-500">•</span>
            راجع المواعيد يومياً للتأكد من عدم وجود تعارضات
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-500">•</span>
            تابع المخزون بانتظام وقم بالطلب قبل نفاد المواد
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-500">•</span>
            حاول تحصيل الفواتير المعلقة في أقرب وقت
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-500">•</span>
            احتفظ بنسخة احتياطية من البيانات بشكل دوري
          </li>
        </ul>
      </div>
    </div>
  );
};
