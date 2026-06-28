import React, { useState, useMemo } from 'react';
import { Employee, AuditLog, SystemSettings } from '../types';
import { 
  Shield, 
  Settings, 
  History, 
  Lock, 
  Users, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  HelpCircle, 
  Search, 
  Sliders, 
  Trash2,
  Bell 
} from 'lucide-react';

interface AdminPanelProps {
  auditLogs: AuditLog[];
  employees: Employee[];
  currentUser: Employee;
  settings: SystemSettings;
  onUpdateSettings: (setts: SystemSettings) => void;
  onLogAction: (action: string, details: string) => void;
  onClearLogs: () => void;
}

export default function AdminPanel({
  auditLogs,
  employees,
  currentUser,
  settings,
  onUpdateSettings,
  onLogAction,
  onClearLogs
}: AdminPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'settings' | 'permissions' | 'audit'>('settings');

  // Search inside Audit Logs
  const [auditSearch, setAuditSearch] = useState('');

  // Local Form state for Settings
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [openingTime, setOpeningTime] = useState(settings.workingHoursStart);
  const [closingTime, setClosingTime] = useState(settings.workingHoursEnd);
  const [currency, setCurrency] = useState(settings.currency);
  const [whatsappGateway, setWhatsappGateway] = useState(settings.whatsappGatewayStatus);
  const [enforceMinPrice, setEnforceMinPrice] = useState(settings.enforceMinPriceLimit);

  // Local state for role permissions rules
  const [employeePermissions, setEmployeePermissions] = useState({
    viewFinances: false,
    deleteCustomers: false,
    viewAllCalendar: true,
    editProcedures: false
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSettings: SystemSettings = {
      ...settings,
      businessName,
      workingHoursStart: openingTime,
      workingHoursEnd: closingTime,
      currency,
      whatsappGatewayStatus: whatsappGateway,
      enforceMinPriceLimit: enforceMinPrice
    };

    onUpdateSettings(updatedSettings);
    onLogAction('სისტემის პარამეტრების შეცვლა', `ადმინისტრატორმა განაახლა სისტემის გლობალური პარამეტრები (სამუშაო დრო: ${openingTime} - ${closingTime})`);
    alert('სისტემის პარამეტრები წარმატებით განახლდა!');
  };

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const searchStr = `${log.action} ${log.details} ${log.user}`.toLowerCase();
      return searchStr.includes(auditSearch.toLowerCase());
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [auditLogs, auditSearch]);

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 font-sans">
        <Shield className="w-12 h-12 text-red-600 animate-bounce" />
        <h2 className="text-lg font-bold font-display">წვდომა შეზღუდულია (Access Denied)</h2>
        <p className="text-xs max-w-sm">
          ადმინისტრატორის მართვის პანელი ხელმისაწვდომია მხოლოდ ავტორიზებული მენეჯერებისთვის. თქვენ გაქვთ სპეციალისტის როლი.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header controls layout */}
      <div className="bg-white p-4 border border-stone-100 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-bold text-stone-800 text-base font-display flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-primary-500" />
            ადმინისტრატორის საკონტროლო პანელი
          </h2>
          <p className="text-xs text-stone-400">სისტემის კონფიგურაცია, წვდომის უფლებები და აქტივობების ჟურნალი</p>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${activeTab === 'settings' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>პარამეტრები</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${activeTab === 'permissions' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>როლები და უფლებები</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${activeTab === 'audit' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            <History className="w-3.5 h-3.5" />
            <span>აქტივობების ლოგი</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB LAYOUTS */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-stone-800 border-b border-stone-50 pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              გლობალური მუშაობის პარამეტრები
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    ესთეტიკური ცენტრის დასახელება
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      გახსნის საათი
                    </label>
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      დახურვის საათი
                    </label>
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    ფულის ვალუტა
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-700"
                  >
                    <option value="GEL">ქართული ლარი (₾)</option>
                    <option value="USD">აშშ დოლარი ($)</option>
                  </select>
                </div>

                {/* Secure minimum prices */}
                <div className="p-3 bg-[#fdfbf7] border border-stone-200/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      მინიმალური ფასის კონტროლი
                    </span>
                    <input
                      type="checkbox"
                      checked={enforceMinPrice}
                      onChange={(e) => setEnforceMinPrice(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    გააქტიურების შემთხვევაში, სპეციალისტები ვერ შეძლებენ ფასდაკლების ისე გაკეთებას, რომ ფასი ჩამოვიდეს სერვისისთვის ადმინისტრატორის მიერ დადგენილი მინიმალური ზღვრის ქვემოთ.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification gateway */}
            <div className="border-t border-stone-50 pt-6">
              <h3 className="text-sm font-bold text-stone-800 border-b border-stone-50 pb-2 flex items-center gap-1.5 mb-4">
                <Bell className="w-4 h-4 text-primary-500" />
                SMS / WhatsApp API პროტოკოლი
              </h3>

              <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-700 block">WhatsApp Cloud API Gateway</span>
                  <p className="text-[11px] text-stone-400">
                    მომხმარებელთა ტელეფონებზე ავტომატური SMS/WhatsApp შეტყობინებების გაგზავნის გარე კავშირი.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${whatsappGateway ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
                  <select
                    value={whatsappGateway ? 'active' : 'inactive'}
                    onChange={(e) => setWhatsappGateway(e.target.value === 'active')}
                    className="bg-white border border-stone-200 rounded-lg text-xs py-1.5 px-2.5 font-semibold text-stone-700"
                  >
                    <option value="active">სტატუსი: LIVE (აქტიური)</option>
                    <option value="inactive">სტატუსი: OFFLINE (გათიშული)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-50 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                პარამეტრების შენახვა
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ROLES & PERMISSIONS CONTROL PANEL */}
        {activeTab === 'permissions' && (
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-stone-800 border-b border-stone-50 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary-500" />
              როლებისა და წვდომების უფლებების მატრიცა
            </h3>

            <p className="text-xs text-stone-400">
              განსაზღვრეთ რა უფლებები დაინერგოს სისტემაში სპეციალისტების (Employee) როლის მქონე თანამშრომლებისთვის. ადმინისტრატორს აქვს ულიმიტო წვდომა.
            </p>

            <div className="border border-stone-100 rounded-2xl overflow-hidden divide-y divide-stone-100 text-xs text-stone-700">
              <div className="bg-stone-50/50 p-4 grid grid-cols-1 md:grid-cols-3 font-bold text-stone-500">
                <div>უფლების დასახელება</div>
                <div className="text-center">სპეციალისტი (Employee)</div>
                <div className="text-center">ადმინისტრატორი (Admin)</div>
              </div>

              {/* View Financial Reports Permission */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 block">სრული ფინანსური ანგარიშების ნახვა</span>
                  <span className="text-[10px] text-stone-400">ცენტრის მოგება, თვიური შემოსავლები, სხვა თანამშრომლების ხელფასები</span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setEmployeePermissions({ ...employeePermissions, viewFinances: !employeePermissions.viewFinances })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      employeePermissions.viewFinances 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {employeePermissions.viewFinances ? 'ნებადართულია' : 'შეზღუდულია'}
                  </button>
                </div>
                <div className="flex justify-center text-green-600 font-bold">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              {/* Delete Customers Permission */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 block">მომხმარებლების ბარათის წაშლა/დაარქივება</span>
                  <span className="text-[10px] text-stone-400">კლიენტების ბაზიდან ჩანაწერების წაშლა</span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setEmployeePermissions({ ...employeePermissions, deleteCustomers: !employeePermissions.deleteCustomers })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      employeePermissions.deleteCustomers 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {employeePermissions.deleteCustomers ? 'ნებადართულია' : 'შეზღუდულია'}
                  </button>
                </div>
                <div className="flex justify-center text-green-600 font-bold">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              {/* View all calendars Permission */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 block">სრული კალენდრის ნახვა</span>
                  <span className="text-[10px] text-stone-400">დაინახოს სხვისი ჩაწერები კალენდარში დროის გადაფარვის თავიდან ასაცილებლად</span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setEmployeePermissions({ ...employeePermissions, viewAllCalendar: !employeePermissions.viewAllCalendar })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      employeePermissions.viewAllCalendar 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {employeePermissions.viewAllCalendar ? 'ყველას ნახულობს' : 'მხოლოდ თავისას დაინახავს'}
                  </button>
                </div>
                <div className="flex justify-center text-green-600 font-bold">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              {/* Edit Procedures Permission */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 block">პროცედურებისა და ფასების რედაქტირება</span>
                  <span className="text-[10px] text-stone-400">ცენტრის სერვისების ფასებისა და ხანგრძლივობის შეცვლა</span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setEmployeePermissions({ ...employeePermissions, editProcedures: !employeePermissions.editProcedures })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      employeePermissions.editProcedures 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {employeePermissions.editProcedures ? 'ნებადართულია' : 'შეზღუდულია'}
                  </button>
                </div>
                <div className="flex justify-center text-green-600 font-bold">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-950 text-xs">
              💡 <strong>შენიშვნა:</strong> როლების მართვის წესები ავტომატურად ვრცელდება სისტემის ყველა სპეციალისტზე. ცვლილებები მყისიერად აქტიურდება.
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-50 pb-3">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-primary-500" />
                სისტემის მოქმედებების ჟურნალი (Audit Log)
              </h3>

              <button
                onClick={() => {
                  if (confirm("ნამდვილად გსურთ აქტივობების ჟურნალის სრულად გასუფთავება?")) {
                    onClearLogs();
                    onLogAction('მოქმედებების ჟურნალის გასუფთავება', 'ჟურნალი წაიშალა ადმინისტრატორის მიერ.');
                  }
                }}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ჟურნალის გასუფთავება</span>
              </button>
            </div>

            {/* Audit Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="მოქმედებების, იუზერების ან დეტალების ძებნა ჟურნალში..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Audit Logs table */}
            <div className="border border-stone-100 rounded-2xl overflow-hidden text-xs max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 font-bold border-b border-stone-100 uppercase text-[9px] tracking-wider">
                    <th className="p-3">თარიღი და საათი</th>
                    <th className="p-3">იუზერი (მოქმედი)</th>
                    <th className="p-3">აქტივობა</th>
                    <th className="p-3">დეტალები</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-stone-50/50 transition-all">
                        <td className="p-3 font-mono text-stone-400 shrink-0">
                          {log.timestamp.replace('T', ' ').substring(0, 19)}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-stone-800">{log.user}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 font-sans italic">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-stone-400">
                        აქტივობების ჟურნალი ცარიელია
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
