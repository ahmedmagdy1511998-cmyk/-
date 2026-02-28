import { useState } from 'react';
import { User, UserRole, ROLE_NAMES, Doctor } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
  doctors: Doctor[];
}

export default function UserManagement({ users, setUsers, doctors }: UserManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'reception' as UserRole,
    doctorId: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'reception',
      doctorId: '',
      isActive: true,
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              ...formData,
              password: formData.password || editingUser.password,
            } 
          : u
      ));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }
    resetForm();
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      doctorId: user.doctorId || '',
      isActive: user.isActive,
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'reception': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return '👑';
      case 'reception': return '🖥️';
      case 'doctor': return '👨‍⚕️';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-1">إضافة وتعديل صلاحيات المستخدمين</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          إضافة مستخدم جديد
        </button>
      </div>

      {/* صلاحيات كل دور */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👑</span>
            <h3 className="font-bold text-purple-800">مدير النظام</h3>
          </div>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>✓ جميع الصلاحيات</li>
            <li>✓ إدارة المستخدمين</li>
            <li>✓ التقارير والإحصائيات</li>
            <li>✓ الإعدادات</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🖥️</span>
            <h3 className="font-bold text-blue-800">موظف الاستقبال</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ إدارة المرضى</li>
            <li>✓ المواعيد</li>
            <li>✓ الفواتير</li>
            <li>✗ التقارير والملفات الطبية</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👨‍⚕️</span>
            <h3 className="font-bold text-green-800">الطبيب</h3>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✓ ملفات المرضى الطبية</li>
            <li>✓ العلاجات والوصفات</li>
            <li>✓ صور الأشعة</li>
            <li>✗ الفواتير والمخزن</li>
          </ul>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسم المستخدم للدخول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور {editingUser && '(اتركها فارغة للإبقاء على القديمة)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="كلمة المرور"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, doctorId: '' })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="admin">👑 مدير النظام</option>
                  <option value="reception">🖥️ موظف استقبال</option>
                  <option value="doctor">👨‍⚕️ طبيب</option>
                </select>
              </div>
              {formData.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ربط بطبيب</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- اختر الطبيب --</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">مستخدم نشط</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium"
                >
                  {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* قائمة المستخدمين */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">المستخدم</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">اسم المستخدم</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">الدور</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">الحالة</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">تاريخ الإنشاء</th>
              <th className="text-center py-4 px-6 font-semibold text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      {user.doctorId && (
                        <p className="text-xs text-gray-500">
                          {doctors.find(d => d.id === user.doctorId)?.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{user.username}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)} {ROLE_NAMES[user.role]}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {user.isActive ? '✓ نشط' : '✗ معطل'}
                  </button>
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">👥</p>
            <p>لا يوجد مستخدمين</p>
          </div>
        )}
      </div>
    </div>
  );
}
