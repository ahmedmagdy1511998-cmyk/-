import React from 'react';
import { User, RolePermissions, ROLE_NAMES } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: User | null;
  permissions: RolePermissions;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  permission: keyof RolePermissions;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', emoji: '🏠', permission: 'dashboard' },
  { id: 'notifications', name: 'التنبيهات', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', emoji: '🔔', permission: 'notifications' },
  { id: 'patientFiles', name: 'ملفات المرضى', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', emoji: '📁', permission: 'patientFiles' },
  { id: 'patients', name: 'المرضى', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', emoji: '👥', permission: 'patients' },
  { id: 'patientNotes', name: 'ملاحظات المرضى', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', emoji: '📝', permission: 'patientNotes' },
  { id: 'doctors', name: 'الأطباء', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', emoji: '👨‍⚕️', permission: 'doctors' },
  { id: 'appointments', name: 'المواعيد', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', emoji: '📅', permission: 'appointments' },
  { id: 'treatments', name: 'العلاجات', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5', emoji: '🦷', permission: 'treatments' },
  { id: 'prescriptions', name: 'الوصفات الطبية', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', emoji: '💊', permission: 'prescriptions' },
  { id: 'xrays', name: 'صور الأشعة', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', emoji: '📸', permission: 'xrays' },
  { id: 'invoices', name: 'الفواتير', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z', emoji: '💰', permission: 'invoices' },
  { id: 'inventory', name: 'المخزن', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', emoji: '📦', permission: 'inventory' },
  { id: 'reports', name: 'التقارير', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', emoji: '📊', permission: 'reports' },
  { id: 'settings', name: 'الإعدادات', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', emoji: '⚙️', permission: 'settings' },
  { id: 'userManagement', name: 'إدارة المستخدمين', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', emoji: '👤', permission: 'userManagement' },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'from-purple-400 to-pink-400';
    case 'reception': return 'from-blue-400 to-cyan-400';
    case 'doctor': return 'from-green-400 to-emerald-400';
    default: return 'from-gray-400 to-gray-500';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return '👑';
    case 'reception': return '🖥️';
    case 'doctor': return '👨‍⚕️';
    default: return '👤';
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, currentUser, permissions }) => {
  const filteredMenuItems = menuItems.filter(item => permissions[item.permission]);

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen p-4 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="mb-8 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">مركز الأسنان</h1>
            <p className="text-xs text-slate-400">نظام الإدارة المتكامل</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-6 px-2">
        <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(currentUser?.role || 'admin')} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
              {getRoleIcon(currentUser?.role || 'admin')}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{currentUser?.name || 'مدير النظام'}</p>
              <p className="text-slate-400 text-xs">{ROLE_NAMES[currentUser?.role || 'admin']}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-gradient-to-l from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="font-medium text-sm">{item.name}</span>
            {activeTab === item.id && (
              <span className="mr-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-4 px-2 pt-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 px-4 py-3 text-center">
        <p className="text-slate-500 text-xs">الإصدار 2.0</p>
      </div>
    </aside>
  );
};
