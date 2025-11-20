import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Wrench, 
  FileText, 
  Bell, 
  Settings,
  Menu,
  ChevronLeft,
  Package,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Users,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import Maintenance from './components/Maintenance';
import Billing from './components/Billing';
import Announcements from './components/Announcements';
import ParcelManagement from './components/ParcelManagement';
import SettingsPage from './components/Settings';
import AIChatbot from './components/AIChatbot';
import Login from './components/Login';
import TenantPortal from './components/TenantPortal';
import UserManagement from './components/UserManagement';
import { checkSupabaseConnection, api } from './lib/supabase';
import { Room, AppSettings, Parcel, MaintenanceRequest, Invoice, User } from './types';
import { THEMES } from './lib/themes';

const DEFAULT_SETTINGS: AppSettings = {
    dormName: 'NexDorm Enterprise',
    waterRate: 18,
    elecRate: 7,
    commonFee: 300,
    theme: 'theme-1',
    darkMode: false
};

export default function App() {
  // --- STATE ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // --- ADVANCED THEME ENGINE ---
  useEffect(() => {
    const savedThemeId = appSettings.theme || 'theme-1';
    const isDark = appSettings.darkMode || false;

    const theme = THEMES.find(t => t.id === savedThemeId) || THEMES[0];
    const root = document.documentElement;
    const colors = isDark ? theme.cssVars.dark : theme.cssVars.light;

    root.style.setProperty('--font-sans', theme.fontFamily);
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

  }, [appSettings.theme, appSettings.darkMode]);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- DATA FETCHING ---
  const fetchData = async () => {
      setIsLoading(true);
      try {
          const isConnected = await checkSupabaseConnection();
          if (isConnected) {
              const [r, p, m, i, s] = await Promise.all([
                  api.getRooms(),
                  api.getParcels(),
                  api.getMaintenance(),
                  api.getInvoices(),
                  api.getSettings()
              ]);
              setRooms(r);
              setParcels(p);
              setMaintenanceRequests(m);
              setInvoices(i);
              if (s) setAppSettings(s);
          } else {
              showToast("Database connection failed", 'error');
          }
      } catch (error) {
          console.error("Fetch error:", error);
          showToast("Error loading data", 'error');
      } finally {
          setIsLoading(false);
          setIsInitializing(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const handleLogin = async (user: User) => {
      setCurrentUser(user);
      if (user.role === 'ADMIN') {
        fetchData(); 
      }
  };

  // --- ACTIONS (Passed down) ---
  const handleUpdateRoom = async (updatedRoom: Room) => {
      try {
          await api.updateRoom(updatedRoom);
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          showToast("Room updated");
      } catch(e) { showToast("Failed update", 'error'); }
  };

  const handleAddParcel = async (newParcel: Parcel) => {
      try {
          const created = await api.createParcel(newParcel);
          setParcels(prev => [created, ...prev]);
          showToast("Parcel added");
      } catch(e) { showToast("Failed add", 'error'); }
  };

  const handleUpdateParcel = async (updatedParcel: Parcel) => {
      try {
          await api.updateParcel(updatedParcel);
          setParcels(prev => prev.map(p => p.id === updatedParcel.id ? updatedParcel : p));
      } catch(e) { showToast("Failed update", 'error'); }
  };

  const handleAddMaintenance = async (newRequest: MaintenanceRequest) => {
      try {
          const created = await api.createMaintenance(newRequest);
          setMaintenanceRequests(prev => [created, ...prev]);
          showToast("Request submitted");
      } catch(e) { showToast("Failed submit", 'error'); }
  };

  const handleUpdateMaintenance = async (updatedRequest: MaintenanceRequest) => {
      try {
          await api.updateMaintenance(updatedRequest);
          setMaintenanceRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
          showToast("Status updated");
      } catch(e) { showToast("Failed update", 'error'); }
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
      try {
          await api.updateInvoice(updatedInvoice);
          setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
          showToast("Invoice saved");
      } catch(e) { showToast("Failed save", 'error'); }
  };

  const handleGenerateInvoices = async (newInvoices: Invoice[]) => {
      try {
          setIsLoading(true);
          const createdInvoices = await Promise.all(newInvoices.map(inv => api.createInvoice(inv)));
          setInvoices(prev => [...createdInvoices, ...prev]);
          showToast(`Generated ${createdInvoices.length} invoices`);
      } catch(e) { showToast("Failed generate", 'error'); } 
      finally { setIsLoading(false); }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
      try {
          await api.updateSettings(newSettings);
          setAppSettings(newSettings);
          showToast("Settings saved");
      } catch(e) { showToast("Failed save", 'error'); }
  };

  const handleToggleDarkMode = async (isDark: boolean) => {
      const newSettings = { ...appSettings, darkMode: isDark };
      setAppSettings(newSettings);
      await api.updateSettings(newSettings);
  };

  const handleThemeChange = async (themeId: string) => {
      const newSettings = { ...appSettings, theme: themeId };
      setAppSettings(newSettings);
      await api.updateSettings(newSettings);
      showToast("Theme updated");
  };

  // --- RENDER CONTENT ---
  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  if (!currentUser) return (
    <>
        {toast && <ToastNotification toast={toast} />}
        <Login onLoginSuccess={handleLogin} />
    </>
  );

  if (currentUser.role === 'TENANT') {
     const userRoom = rooms.find(r => r.id === currentUser.roomId);
     return (
        <TenantPortal 
            roomNumber={userRoom ? userRoom.number : 'N/A'} 
            onLogout={() => setCurrentUser(null)} 
            rooms={rooms} 
            parcels={parcels} 
            maintenanceRequests={maintenanceRequests} 
            invoices={invoices} 
            onAddMaintenance={handleAddMaintenance} 
            settings={appSettings} 
        />
     );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} rooms={rooms} />;
      case 'rooms': return <RoomManagement rooms={rooms} onUpdateRoom={handleUpdateRoom} />;
      case 'users': return <UserManagement />;
      case 'billing': return <Billing rooms={rooms} settings={appSettings} invoices={invoices} onUpdateInvoice={handleUpdateInvoice} onGenerateInvoices={handleGenerateInvoices} />;
      case 'parcels': return <ParcelManagement parcels={parcels} onAddParcel={handleAddParcel} onUpdateParcel={handleUpdateParcel} />;
      case 'maintenance': return <Maintenance requests={maintenanceRequests} onUpdateRequest={handleUpdateMaintenance} onAddRequest={handleAddMaintenance} />;
      case 'announcements': return <Announcements />;
      case 'settings': return <SettingsPage settings={appSettings} onUpdate={handleUpdateSettings} onThemeChange={handleThemeChange} onToggleDarkMode={handleToggleDarkMode} />;
      default: return <Dashboard onNavigate={setActiveTab} rooms={rooms} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      <AIChatbot />
      {toast && <ToastNotification toast={toast} />}

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <div className="bg-primary rounded-lg p-1.5">
                        <Building className="text-primary-foreground" size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">NexDorm</h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Enterprise</p>
                    </div>
                </div>
            )}
            {isSidebarCollapsed && (
                 <div className="mx-auto bg-primary rounded-lg p-2">
                    <Building className="text-primary-foreground" size={24} />
                 </div>
            )}
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors ${isSidebarCollapsed ? 'hidden group-hover:block absolute right-2' : ''}`}
            >
                <ChevronLeft size={18} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={Building} label="Room Manager" active={activeTab === 'rooms'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('rooms')} />
            <NavItem icon={Users} label="User Access" active={activeTab === 'users'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('users')} />
            
            <div className={`my-4 border-t border-border mx-2 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`} />
            {!isSidebarCollapsed && <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Operations</p>}
            
            <NavItem icon={Package} label="Parcels" active={activeTab === 'parcels'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('parcels')} />
            <NavItem icon={FileText} label="Billing & Meters" active={activeTab === 'billing'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('billing')} />
            <NavItem icon={Wrench} label="Maintenance" active={activeTab === 'maintenance'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('maintenance')} />
            
            <div className={`my-4 border-t border-border mx-2 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`} />
             {!isSidebarCollapsed && <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">System</p>}

            <NavItem icon={Bell} label="Announcements" active={activeTab === 'announcements'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('announcements')} />
            <NavItem icon={Settings} label="Config" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('settings')} />
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-border">
            <button onClick={() => setCurrentUser(null)} className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all group ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <LogOut size={20} />
                {!isSidebarCollapsed && <span className="font-medium text-sm">Sign Out</span>}
            </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      {/* Mobile Sidebar */}
       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <span className="font-bold text-lg">NexDorm Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><ChevronLeft size={24} /></button>
            </div>
            <div className="p-4 space-y-2">
                {/* Replicate nav items for mobile here simplified */}
                <button onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-lg hover:bg-accent">Dashboard</button>
                <button onClick={() => {setActiveTab('rooms'); setIsMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-lg hover:bg-accent">Rooms</button>
                <button onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-lg hover:bg-accent">Users</button>
                <button onClick={() => {setActiveTab('billing'); setIsMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-lg hover:bg-accent">Billing</button>
                <button onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-lg hover:bg-accent">Settings</button>
                <button onClick={() => setCurrentUser(null)} className="w-full text-left p-3 rounded-lg text-destructive hover:bg-destructive/10 mt-4">Sign Out</button>
            </div>
       </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/10 relative">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-accent rounded-md"><Menu size={20} /></button>
                
                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center text-sm text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
                    <ChevronRight size={14} className="mx-2 opacity-50" />
                    <span className="font-semibold text-foreground capitalize">{activeTab.replace('-', ' ')}</span>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {/* Global Search (Mock) */}
                <div className="hidden md:flex items-center bg-muted/50 rounded-full px-3 py-1.5 border border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all w-64">
                    <Search size={14} className="text-muted-foreground mr-2" />
                    <input type="text" placeholder="Search anything..." className="bg-transparent outline-none text-sm w-full" />
                </div>

                <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>

                {/* Refresh Button */}
                <button 
                    onClick={fetchData} 
                    className={`p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all ${isLoading ? 'animate-spin text-primary' : ''}`}
                    title="Refresh Data"
                >
                    <RefreshCw size={18} />
                </button>

                {/* Theme Toggle */}
                <button 
                    onClick={() => handleToggleDarkMode(!appSettings.darkMode)} 
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                >
                    {appSettings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                
                {/* User Profile Dropdown Trigger */}
                <div className="flex items-center gap-3 pl-2 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none">{currentUser.firstName} {currentUser.lastName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{currentUser.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                        {currentUser.firstName.charAt(0)}
                    </div>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
const NavItem = ({ icon: Icon, label, active, collapsed, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
      active 
        ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20' 
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    } ${collapsed ? 'justify-center' : ''}`}
    title={collapsed ? label : ''}
  >
    <Icon size={20} className={`${active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
    {!collapsed && <span>{label}</span>}
    {collapsed && active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 rounded-l-full"></div>}
  </button>
);

const ToastNotification = ({ toast }: { toast: {msg: string, type: 'success'|'error'} }) => (
    <div className={`fixed top-20 right-6 z-[100] px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 ${
        toast.type === 'success' 
        ? 'bg-white border-emerald-200 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-100' 
        : 'bg-white border-red-200 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-100'
    }`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="font-medium text-sm">{toast.msg}</span>
    </div>
);
