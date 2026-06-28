import React, { useState, useEffect } from 'react';
import {
  Appointment,
  Customer,
  Employee,
  Procedure,
  AuditLog,
  MessageLog,
  MessageTemplate,
  SystemSettings
} from './types';

// Firebase (Firestore) data layer — ყველა მონაცემი ინახება Firestore-ზე, ცოცხალი სინქით
import {
  COLLECTIONS,
  defaultSettings,
  subscribeCollection,
  subscribeSettings,
  seedIfEmpty,
  upsert,
  remove,
  saveSettings,
  clearCollection,
} from './firestoreService';

// Import Components
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import CustomersView from './components/CustomersView';
import ProceduresView from './components/ProceduresView';
import EmployeesView from './components/EmployeesView';
import AnalyticsView from './components/AnalyticsView';
import MessagingView from './components/MessagingView';
import AdminPanel from './components/AdminPanel';

import { 
  Sparkles, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Scissors, 
  UserSquare2, 
  TrendingUp, 
  MessageSquare, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  Clock,
  Bell,
  Loader2
} from 'lucide-react';

const SESSION_KEY = 'bellissima_session_uid';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Core CRM Shared States — იტვირთება Firestore-დან ცოცხალი გამოწერით
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Firestore — საწყისი მონაცემების ჩატვირთვა (თუ ცარიელია) და ცოცხალი გამოწერები
  useEffect(() => {
    seedIfEmpty().catch((e) => {
      console.error('seed error', e);
      setDbError(e?.message || String(e));
    });

    const unsubs: Array<() => void> = [];

    // უსაფრთხო ფარი — Firestore-ის ხანგრძლივი დაყოვნებისას მაინც ჩაიტვირთოს ეკრანი
    const safety = setTimeout(() => setAuthResolved(true), 6000);

    // employees — პირველი snapshot-ით ვცდილობთ სესიის აღდგენას
    unsubs.push(
      subscribeCollection<Employee>(
        COLLECTIONS.employees,
        (items) => {
          setDbError(null);
          setEmployees(items);
          setCurrentUser((prev) => {
            if (prev) {
              // მიმდინარე მომხმარებლის ჩანაწერი თუ განახლდა — ვასინქრონებთ
              const fresh = items.find((e) => e.id === prev.id);
              return fresh || prev;
            }
            const storedId = localStorage.getItem(SESSION_KEY);
            if (storedId) {
              const restored = items.find((e) => e.id === storedId && e.isActive);
              if (restored) return restored;
            }
            return prev;
          });
          setAuthResolved(true);
        },
        (e) => {
          // შეცდომისასაც ვუშვებთ ეკრანს (ბლენქი/გაჭედვა არ ხდება)
          setDbError(e?.message || String(e));
          setAuthResolved(true);
        }
      )
    );

    unsubs.push(subscribeCollection<Procedure>(COLLECTIONS.procedures, setProcedures));
    unsubs.push(subscribeCollection<Customer>(COLLECTIONS.customers, setCustomers));
    unsubs.push(subscribeCollection<MessageTemplate>(COLLECTIONS.templates, setTemplates));
    unsubs.push(subscribeCollection<Appointment>(COLLECTIONS.appointments, setAppointments));
    unsubs.push(
      subscribeCollection<AuditLog>(COLLECTIONS.auditLogs, (items) =>
        setAuditLogs([...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
      )
    );
    unsubs.push(
      subscribeCollection<MessageLog>(COLLECTIONS.messageLogs, (items) =>
        setMessageLogs([...items].sort((a, b) => b.sentAt.localeCompare(a.sentAt)))
      )
    );
    unsubs.push(subscribeSettings(setSettings));

    return () => {
      clearTimeout(safety);
      unsubs.forEach((u) => u());
    };
  }, []);

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'customers' | 'procedures' | 'employees' | 'analytics' | 'messaging' | 'admin'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Deep linking helper state (allows prefilling and redirecting to Booking modal from other views)
  const [prefilledAppt, setPrefilledAppt] = useState<Partial<Appointment> | null>(null);

  // Authentication Sign In — სესია ნარჩუნდება გასვლის ხელით დაჭერამდე
  const handleLogin = (user: Employee) => {
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
    handleLogAction(user, 'სისტემაში ავტორიზაცია', `თანამშრომელი ${user.name} წარმატებით შევიდა CRM-ში.`);
  };

  // Authentication Sign Out — მხოლოდ ხელით გასვლისას
  const handleLogout = () => {
    if (currentUser) {
      handleLogAction(currentUser, 'სისტემიდან გასვლა', `${currentUser.name} გავიდა CRM-დან.`);
    }
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Logging engine — ინახება Firestore-ზე
  const handleLogAction = (userObj: Employee, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      user: userObj.name,
      action,
      details
    };
    upsert(COLLECTIONS.auditLogs, newLog);
  };

  // Wrapping logger for general components
  const wrapLogAction = (action: string, details: string) => {
    if (currentUser) {
      handleLogAction(currentUser, action, details);
    }
  };

  // ----------------------------------------
  // DATA OPERATIONS (CRUD PROPAGATORS)
  // ----------------------------------------
  
  // Appointments
  const handleAddAppointment = (appt: Appointment) => {
    upsert(COLLECTIONS.appointments, appt);
  };

  const handleUpdateAppointment = (updatedAppt: Appointment) => {
    upsert(COLLECTIONS.appointments, updatedAppt);

    // Automatically trigger follow-up recommended check if appointment was completed and procedure is marked isRecurring
    if (updatedAppt.appointmentStatus === 'completed') {
      const proc = procedures.find(p => p.id === updatedAppt.procedureId);
      if (proc && proc.isRecurring) {
        const days = proc.recurrenceDays || 21;

        // Calculate new date
        const originDate = new Date(updatedAppt.dateTime);
        originDate.setDate(originDate.getDate() + days);
        const nextDateStr = originDate.toISOString().split('T')[0];

        const cust = customers.find(c => c.id === updatedAppt.customerId);
        if (cust) {
          upsert(COLLECTIONS.customers, {
            ...cust,
            nextRecommendedDate: nextDateStr,
            updatedAt: new Date().toISOString()
          });
        }

        wrapLogAction('ლაზერის გეგმიური განრიგი', `კლიენტს ${updatedAppt.customerName} გაეწერა შემდეგი ვიზიტი: ${nextDateStr} პროცედურისთვის: ${proc.name}`);
      }
    }
  };

  const handleDeleteAppointment = (id: string) => {
    remove(COLLECTIONS.appointments, id);
  };

  // Customers
  const handleAddCustomer = (cust: Customer) => {
    upsert(COLLECTIONS.customers, cust);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    upsert(COLLECTIONS.customers, updatedCust);
  };

  const handleDeleteCustomer = (id: string) => {
    remove(COLLECTIONS.customers, id);
  };

  // Procedures
  const handleAddProcedure = (proc: Procedure) => {
    upsert(COLLECTIONS.procedures, proc);
  };

  const handleUpdateProcedure = (updatedProc: Procedure) => {
    upsert(COLLECTIONS.procedures, updatedProc);
  };

  const handleDeleteProcedure = (id: string) => {
    remove(COLLECTIONS.procedures, id);
  };

  // Employees
  const handleAddEmployee = (emp: Employee) => {
    upsert(COLLECTIONS.employees, emp);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    upsert(COLLECTIONS.employees, updatedEmp);
  };

  const handleDeleteEmployee = (id: string) => {
    remove(COLLECTIONS.employees, id);
  };

  // Templates
  const handleAddTemplate = (tpl: MessageTemplate) => {
    upsert(COLLECTIONS.templates, tpl);
  };

  const handleUpdateTemplate = (updatedTpl: MessageTemplate) => {
    upsert(COLLECTIONS.templates, updatedTpl);
  };

  const handleDeleteTemplate = (id: string) => {
    remove(COLLECTIONS.templates, id);
  };

  // Message Logs
  const handleAddMessageLog = (msg: MessageLog) => {
    upsert(COLLECTIONS.messageLogs, msg);
  };

  const handleDashboardSendMessage = (phone: string, text: string, templateName: string) => {
    const matchedCust = customers.find(c => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
    const recipientName = matchedCust ? `${matchedCust.firstName} ${matchedCust.lastName}` : 'კლიენტი';
    
    const newLog: MessageLog = {
      id: `msg_${Date.now()}`,
      customerId: matchedCust?.id || 'manual',
      customerName: recipientName,
      channel: 'whatsapp',
      templateName,
      content: text,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    handleAddMessageLog(newLog);
    wrapLogAction('შეტყობინების გაგზავნა', `ავტომატური შეტყობინება გაეგზავნა მომხმარებელს: ${recipientName} (${phone})`);
    alert(`შეტყობინება გაიგზავნა WhatsApp-ით:\n\n${text}`);
  };

  // Handle deep-linked action: redirects user to Calendar tab and opens Booking prefilled
  const handleOpenQuickBook = (prefilledData: Partial<Appointment>) => {
    setPrefilledAppt(prefilledData);
    setActiveTab('calendar');
  };

  // Firestore-დან მონაცემების/სესიის აღდგენამდე — ჩატვირთვის ეკრანი (ბლენქი არ ჩანს)
  if (!authResolved) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center gap-4 text-stone-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-sm font-medium">იტვირთება...</p>
      </div>
    );
  }

  // Render Login state shield
  if (!currentUser) {
    return (
      <>
        {dbError && (
          <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-xs md:text-sm font-semibold px-4 py-2.5 text-center shadow-md">
            ბაზასთან კავშირი ვერ დამყარდა — შეამოწმეთ Firestore-ის წვდომის წესები (rules). მონაცემები ვერ ჩაიტვირთება ამ პრობლემის მოგვარებამდე.
          </div>
        )}
        <LoginScreen employees={employees} onLogin={handleLogin} centerName={settings.businessName} />
      </>
    );
  }

  // ანალიტიკას ხედავს ადმინი ან მფლობელი (ლანა)
  const canSeeAnalytics = currentUser.role === 'admin' || !!currentUser.isOwner;

  // Sidebar link object
  const navLinks: { id: string; label: string; icon: any; adminOnly?: boolean; ownerOrAdmin?: boolean }[] = [
    { id: 'dashboard', label: 'მთავარი', icon: LayoutDashboard },
    { id: 'calendar', label: 'კალენდარი', icon: CalendarIcon },
    { id: 'customers', label: 'კლიენტები', icon: Users },
    { id: 'procedures', label: 'პროცედურები', icon: Scissors },
    { id: 'employees', label: 'თანამშრომლები', icon: UserSquare2 },
    { id: 'analytics', label: 'ანალიტიკა', icon: TrendingUp, ownerOrAdmin: true },
    { id: 'messaging', label: 'შეტყობინებები', icon: MessageSquare },
    { id: 'admin', label: 'ადმინი', icon: Shield, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row text-stone-800 font-sans">
      
      {/* SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800/20 shrink-0 sticky top-0 h-screen justify-between p-5">
        <div className="space-y-6">
          {/* Logo Brand Brand block */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black shadow-xs">
              B
            </div>
            <div>
              <h1 className="font-bold text-sm font-display text-white tracking-wide">Bellissima CRM</h1>
              <span className="text-[10px] text-stone-500 font-bold uppercase">Aesthetic Studio</span>
            </div>
          </div>

          {/* Nav links list */}
          <nav className="space-y-1">
            {navLinks.map(link => {
              // Hide admin links from employee users
              if (link.adminOnly && currentUser.role !== 'admin') return null;
              if (link.ownerOrAdmin && !canSeeAnalytics) return null;

              const Icon = link.icon;
              const isSelected = activeTab === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                    isSelected 
                      ? 'bg-primary-600 text-white shadow-xs' 
                      : 'hover:bg-stone-800/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile capsule */}
        <div className="border-t border-stone-800/80 pt-4 space-y-3.5">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-extrabold text-xs text-primary-400">
              {currentUser.name.substring(0, 2)}
            </div>
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-bold text-stone-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-stone-500 truncate font-semibold uppercase">{currentUser.role === 'admin' ? 'ადმინისტრატორი' : currentUser.profession}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-red-950 hover:text-red-300 rounded-xl text-[10px] font-bold text-stone-400 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>სისტემიდან გასვლა</span>
          </button>
        </div>
      </aside>

      {/* HEADER BAR FOR MOBILE & SHELL LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 bg-white border-b border-stone-100 px-4 py-3 z-30 flex items-center justify-between shadow-xs">
          {/* Brand/Menu trigger on mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-stone-50 rounded-xl border border-stone-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 md:hidden">
              <span className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs">B</span>
              <span className="font-bold text-xs font-display tracking-wide">Bellissima CRM</span>
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-400 font-sans">
              <span>{settings.businessName}</span>
              <span>/</span>
              <span className="text-stone-800 font-bold capitalize">{activeTab}</span>
            </div>
          </div>

          {/* Utilities section: dynamic date & system stats */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>დღეს:</span>
              <strong className="font-mono text-stone-800">2026-06-28</strong>
            </div>

            {/* Live SMS Gateway status pill */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-100 rounded-full px-2.5 py-1 text-[10px]">
              <span className={`w-2 h-2 rounded-full ${settings.whatsappGatewayStatus ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-semibold text-stone-600 hidden sm:inline">WhatsApp Gateway:</span>
              <span className="font-bold text-stone-800">{settings.whatsappGatewayStatus ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </header>

        {/* MOBILE MENU TRAIL (Conditional Overlay) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[53px] bg-stone-950/80 z-20 transition-all animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 bg-stone-900 h-full p-4 space-y-4 animate-slideRight" onClick={e => e.stopPropagation()}>
              <nav className="space-y-1">
                {navLinks.map(link => {
                  if (link.adminOnly && currentUser.role !== 'admin') return null;
                  if (link.ownerOrAdmin && !canSeeAnalytics) return null;

                  const Icon = link.icon;
                  const isSelected = activeTab === link.id;

                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-primary-600 text-white' 
                          : 'text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-stone-800 pt-4 mt-auto space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center font-bold text-xs text-primary-400">
                    {currentUser.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-200">{currentUser.name}</p>
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">{currentUser.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-stone-800 rounded-xl text-[10px] font-bold text-stone-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>გასვლა</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY MAIN CRM VIEW SLOT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fadeIn">
          {activeTab === 'dashboard' && (
            <DashboardView 
              appointments={appointments}
              customers={customers}
              procedures={procedures}
              employees={employees}
              templates={templates}
              currentUser={currentUser}
              centerName={settings.businessName}
              onNavigate={setActiveTab}
              onOpenQuickBook={handleOpenQuickBook}
              onSendMessage={handleDashboardSendMessage}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              appointments={appointments}
              customers={customers}
              procedures={procedures}
              employees={employees}
              templates={templates}
              currentUser={currentUser}
              centerName={settings.businessName}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onAddCustomer={handleAddCustomer}
              onLogAction={wrapLogAction}
              onSendMessage={handleDashboardSendMessage}
              prefilledAppt={prefilledAppt}
              setPrefilledAppt={setPrefilledAppt}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView 
              customers={customers}
              appointments={appointments}
              procedures={procedures}
              employees={employees}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onLogAction={wrapLogAction}
              onOpenQuickBook={handleOpenQuickBook}
            />
          )}

          {activeTab === 'procedures' && (
            <ProceduresView 
              procedures={procedures}
              employees={employees}
              currentUser={currentUser}
              onAddProcedure={handleAddProcedure}
              onUpdateProcedure={handleUpdateProcedure}
              onDeleteProcedure={handleDeleteProcedure}
              onLogAction={wrapLogAction}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView 
              employees={employees}
              procedures={procedures}
              currentUser={currentUser}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onLogAction={wrapLogAction}
            />
          )}

          {activeTab === 'analytics' && canSeeAnalytics && (
            <AnalyticsView
              appointments={appointments}
              customers={customers}
              procedures={procedures}
              employees={employees}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'messaging' && (
            <MessagingView 
              messageLogs={messageLogs}
              customers={customers}
              appointments={appointments}
              employees={employees}
              templates={templates}
              onAddMessageLog={handleAddMessageLog}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onLogAction={wrapLogAction}
            />
          )}

          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminPanel 
              auditLogs={auditLogs}
              employees={employees}
              currentUser={currentUser}
              settings={settings}
              onUpdateSettings={(s) => saveSettings(s)}
              onLogAction={wrapLogAction}
              onClearLogs={() => clearCollection(COLLECTIONS.auditLogs)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
