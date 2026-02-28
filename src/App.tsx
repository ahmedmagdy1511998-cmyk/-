import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Doctors } from './components/Doctors';
import { Appointments } from './components/Appointments';
import { Treatments } from './components/Treatments';
import { Invoices } from './components/Invoices';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { SetupWizard } from './components/SetupWizard';
import PatientFiles from './components/PatientFiles';
import { Reports } from './components/Reports';
import { PatientNotes } from './components/PatientNotes';
import { Prescriptions } from './components/Prescriptions';
import { XRays } from './components/XRays';
import { Inventory } from './components/Inventory';
import { Notifications } from './components/Notifications';
import UserManagement from './components/UserManagement';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  Patient, Appointment, Treatment, Invoice, Doctor, CenterSettings,
  PatientNote, Prescription, XRayImage, InventoryItem, AppNotification,
  User, ROLE_PERMISSIONS, RolePermissions
} from './types';

const defaultCenterSettings: CenterSettings = {
  centerName: '',
  logo: '',
  phone: '',
  address: '',
  isSetupComplete: false,
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useLocalStorage<Patient[]>('dental_patients', []);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('dental_doctors', []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('dental_appointments', []);
  const [treatments, setTreatments] = useLocalStorage<Treatment[]>('dental_treatments', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('dental_invoices', []);
  const [centerSettings, setCenterSettings] = useLocalStorage<CenterSettings>('dental_center_settings', defaultCenterSettings);
  const [patientNotes, setPatientNotes] = useLocalStorage<PatientNote[]>('dental_patient_notes', []);
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>('dental_prescriptions', []);
  const [xrays, setXrays] = useLocalStorage<XRayImage[]>('dental_xrays', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('dental_inventory', []);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('dental_notifications', []);
  const [users, setUsers] = useLocalStorage<User[]>('dental_users', []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get permissions for current user
  const permissions: RolePermissions = currentUser 
    ? ROLE_PERMISSIONS[currentUser.role] 
    : ROLE_PERMISSIONS.admin;

  useEffect(() => {
    const savedUser = localStorage.getItem('dental_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('dental_current_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dental_current_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  // Show setup wizard if not completed (only for admin)
  if (!centerSettings.isSetupComplete && currentUser?.role === 'admin') {
    return (
      <SetupWizard
        onComplete={(settings) => {
          setCenterSettings(settings);
        }}
      />
    );
  }

  // If setup not complete and not admin, show message
  if (!centerSettings.isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">جاري إعداد النظام</h2>
          <p className="text-gray-600">يرجى الانتظار حتى يقوم المدير بإكمال إعداد النظام</p>
          <button
            onClick={handleLogout}
            className="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Check permissions before rendering
    switch (activeTab) {
      case 'dashboard':
        return permissions.dashboard ? (
          <Dashboard
            patients={patients}
            doctors={doctors}
            appointments={appointments}
            treatments={treatments}
            invoices={invoices}
          />
        ) : null;
      case 'notifications':
        return permissions.notifications ? (
          <Notifications
            appointments={appointments}
            invoices={invoices}
            inventory={inventory}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        ) : null;
      case 'patientFiles':
        return permissions.patientFiles ? (
          <PatientFiles
            patients={patients}
            doctors={doctors}
            treatments={treatments}
            appointments={appointments}
            centerSettings={{
              name: centerSettings.centerName,
              phone: centerSettings.phone,
              address: centerSettings.address,
              logo: centerSettings.logo
            }}
          />
        ) : null;
      case 'patients':
        return permissions.patients ? (
          <Patients patients={patients} setPatients={setPatients} />
        ) : null;
      case 'patientNotes':
        return permissions.patientNotes ? (
          <PatientNotes
            patients={patients}
            notes={patientNotes}
            setNotes={setPatientNotes}
          />
        ) : null;
      case 'doctors':
        return permissions.doctors ? (
          <Doctors doctors={doctors} setDoctors={setDoctors} />
        ) : null;
      case 'appointments':
        return permissions.appointments ? (
          <Appointments
            appointments={appointments}
            setAppointments={setAppointments}
            patients={patients}
            doctors={doctors}
          />
        ) : null;
      case 'treatments':
        return permissions.treatments ? (
          <Treatments
            treatments={treatments}
            setTreatments={setTreatments}
            patients={patients}
            doctors={doctors}
          />
        ) : null;
      case 'prescriptions':
        return permissions.prescriptions ? (
          <Prescriptions
            patients={patients}
            doctors={doctors}
            prescriptions={prescriptions}
            setPrescriptions={setPrescriptions}
            centerSettings={centerSettings}
          />
        ) : null;
      case 'xrays':
        return permissions.xrays ? (
          <XRays
            patients={patients}
            doctors={doctors}
            xrays={xrays}
            setXrays={setXrays}
            centerSettings={centerSettings}
          />
        ) : null;
      case 'invoices':
        return permissions.invoices ? (
          <Invoices
            invoices={invoices}
            setInvoices={setInvoices}
            patients={patients}
            centerSettings={centerSettings}
          />
        ) : null;
      case 'inventory':
        return permissions.inventory ? (
          <Inventory
            inventory={inventory}
            setInventory={setInventory}
          />
        ) : null;
      case 'reports':
        return permissions.reports ? (
          <Reports
            patients={patients}
            doctors={doctors}
            appointments={appointments}
            treatments={treatments}
            invoices={invoices}
            inventory={inventory}
            centerSettings={{
              centerName: centerSettings.centerName,
              logo: centerSettings.logo,
              phone: centerSettings.phone,
              address: centerSettings.address
            }}
          />
        ) : null;
      case 'settings':
        return permissions.settings ? (
          <Settings
            centerSettings={centerSettings}
            setCenterSettings={setCenterSettings}
            onClearAllData={() => {
              setPatients([]);
              setDoctors([]);
              setAppointments([]);
              setTreatments([]);
              setInvoices([]);
              setPatientNotes([]);
              setPrescriptions([]);
              setXrays([]);
              setInventory([]);
              setNotifications([]);
              setUsers([]);
            }}
          />
        ) : null;
      case 'userManagement':
        return permissions.userManagement ? (
          <UserManagement
            users={users}
            setUsers={setUsers}
            doctors={doctors}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-slate-800 text-white p-3 rounded-xl shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 right-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          currentUser={currentUser}
          permissions={permissions}
        />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
