import React, { useState } from 'react';
import { Appointment, Customer, Employee, Procedure, MessageTemplate } from '../types';
import { initialCenterSettings } from '../data/initialData';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  appointments: Appointment[];
  customers: Customer[];
  procedures: Procedure[];
  employees: Employee[];
  templates: MessageTemplate[];
  currentUser: Employee;
  centerName: string;
  onNavigate: (tab: string) => void;
  onOpenQuickBook: (prefilled?: Partial<Appointment>) => void;
  onSendMessage: (phone: string, text: string, templateName: string) => void;
}

export default function DashboardView({
  appointments,
  customers,
  procedures,
  employees,
  templates,
  currentUser,
  centerName,
  onNavigate,
  onOpenQuickBook,
  onSendMessage
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Get current date string (YYYY-MM-DD) based on current environment (2026-06-28)
  const todayStr = "2026-06-28";

  // Filter today's appointments
  const todayAppointments = appointments.filter(appt => {
    const apptDate = appt.dateTime.split('T')[0];
    const isToday = apptDate === todayStr;
    
    // Employees can only see their own appointments, admins see all
    if (currentUser.role === 'employee') {
      return isToday && appt.employeeId === currentUser.id;
    }
    return isToday;
  });

  // Calculate stats
  const completedToday = todayAppointments.filter(a => a.appointmentStatus === 'completed');
  const revenueToday = completedToday.reduce((sum, a) => sum + a.finalPrice, 0);
  const totalBookingsCount = todayAppointments.length;
  const pendingConfirmation = appointments.filter(a => a.appointmentStatus === 'pending_confirmation');

  // Search filter for quick customer lookup
  const filteredCustomers = searchTerm.trim() 
    ? customers.filter(c => 
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      ).slice(0, 5)
    : [];

  // Helper to format currency
  const fmtGEL = (amount: number) => `${amount} ₾`;

  // Helper to get relative hour string (e.g., 14:30)
  const formatTime = (dateTimeStr: string) => {
    return dateTimeStr.split('T')[1]?.substring(0, 5) || '';
  };

  // Helper to get status details
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-100">დასრულებული</span>;
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">დადასტურებული</span>;
      case 'booked':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-100">ჩაწერილია</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-100">გაუქმებული</span>;
      case 'pending_confirmation':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-100">შესათანხმებელი</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-100">{status}</span>;
    }
  };

  // Quick Action triggers
  const handleQuickLaserFollowUpMessage = (appt: Appointment) => {
    const cust = customers.find(c => c.id === appt.customerId);
    const laserTemplate = templates.find(t => t.type === 'laser_followup') || templates[0];
    const proc = procedures.find(p => p.id === appt.procedureId);
    
    if (!cust || !laserTemplate) return;

    let text = laserTemplate.text
      .replace(/\[მომხმარებლის სახელი\]/g, `${cust.firstName} ${cust.lastName}`)
      .replace(/\[თარიღი\]/g, appt.dateTime.split('T')[0])
      .replace(/\[პროცედურა\]/g, proc?.name || '')
      .replace(/\[ცენტრის სახელი\]/g, centerName);

    onSendMessage(cust.phone, text, laserTemplate.name);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 border border-stone-100 rounded-2xl gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-widest block mb-1">
            საკონტროლო პანელი
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-stone-800">
            გამარჯობა, {currentUser.name}!
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            დღეს არის: <span className="font-semibold text-stone-700">28 ივნისი, 2026</span> | როლი: <span className="font-semibold text-primary-600">{currentUser.role === 'admin' ? 'ადმინისტრატორი' : 'სპეციალისტი'}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onOpenQuickBook()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი ჩაწერა</span>
          </button>
          
          <button
            onClick={() => onNavigate('calendar')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium rounded-xl text-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-stone-500" />
            <span>კალენდარი</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-stone-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400">დღევანდელი შემოსავალი</p>
            <h4 className="text-lg md:text-xl font-bold text-stone-800 font-display mt-0.5">
              {fmtGEL(revenueToday)}
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400">ჩაწერილი ვიზიტები</p>
            <h4 className="text-lg md:text-xl font-bold text-stone-800 font-display mt-0.5">
              {totalBookingsCount}
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400">დასრულებული დღეს</p>
            <h4 className="text-lg md:text-xl font-bold text-stone-800 font-display mt-0.5">
              {completedToday.length} / {totalBookingsCount}
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400">ელოდება დადასტურებას</p>
            <h4 className="text-lg md:text-xl font-bold text-stone-800 font-display mt-0.5 text-purple-600">
              {pendingConfirmation.length}
            </h4>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick Search & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Search Bar */}
          <div className="bg-white p-4 border border-stone-100 rounded-2xl space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-500" />
              კლიენტის სწრაფი ძებნა ტელეფონით ან სახელით
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="ჩაწერეთ მობილური ან სახელი..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-stone-50/50"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Instant Search Results */}
            {searchTerm.trim() !== '' && (
              <div className="border border-stone-100 rounded-xl overflow-hidden divide-y divide-stone-50 bg-white">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(cust => (
                    <div key={cust.id} className="p-3 hover:bg-stone-50 flex items-center justify-between transition-all">
                      <div>
                        <h4 className="font-semibold text-stone-800 text-sm">
                          {cust.firstName} {cust.lastName}
                        </h4>
                        <p className="text-xs text-stone-500 font-mono">{cust.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onOpenQuickBook({
                              customerId: cust.id,
                              customerName: `${cust.firstName} ${cust.lastName}`,
                              phone: cust.phone,
                            });
                            setSearchTerm('');
                          }}
                          className="px-2.5 py-1 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg text-xs font-medium transition-all"
                        >
                          ჩაწერა
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('customers');
                            // Delay slightly or use state
                          }}
                          className="px-2.5 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-medium transition-all"
                        >
                          ბარათი
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-stone-400 text-xs">
                    კლიენტი ასეთი სახელით ან ნომრით ვერ მოიძებნა.
                    <button
                      onClick={() => {
                        onNavigate('customers');
                        setSearchTerm('');
                      }}
                      className="text-primary-600 underline font-semibold ml-1 hover:text-primary-700"
                    >
                      ახლის დამატება
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                დღევანდელი ჩაწერები ({todayAppointments.length})
              </h3>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                ყველას ნახვა →
              </button>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="divide-y divide-stone-100 max-h-[480px] overflow-y-auto">
                {todayAppointments
                  .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
                  .map(appt => {
                    const proc = procedures.find(p => p.id === appt.procedureId);
                    const emp = employees.find(e => e.id === appt.employeeId);
                    
                    return (
                      <div key={appt.id} className="p-4 hover:bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
                        <div className="flex gap-3">
                          <div className="text-center bg-primary-50/60 text-primary-700 p-2.5 rounded-xl shrink-0 h-14 w-14 flex flex-col justify-center border border-primary-100/50">
                            <span className="text-xs font-medium text-primary-500">საათი</span>
                            <span className="text-sm font-bold font-mono tracking-tight leading-none">
                              {formatTime(appt.dateTime)}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-stone-800 text-sm">
                                {appt.customerName}
                              </h4>
                              {getStatusBadge(appt.appointmentStatus)}
                            </div>
                            
                            <p className="text-xs text-stone-500 mt-0.5">
                              <span className="font-medium text-stone-700">{proc?.name || 'უცნობი პროცედურა'}</span> | <span className="text-stone-600">{emp?.name}</span>
                            </p>
                            
                            <p className="text-xs text-stone-400 mt-0.5 font-mono">
                              ტელ: {appt.phone} | ხანგრძლივობა: {appt.duration} წთ.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t border-dashed border-stone-100 sm:border-0">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-stone-400">საბოლოო ფასი</p>
                            <p className="font-bold text-stone-800 font-mono text-sm">
                              {fmtGEL(appt.finalPrice)}
                            </p>
                          </div>

                          {/* Action quick links */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const confirmTmpl = templates.find(t => t.type === 'booking_confirmation') || templates[0];
                                if (confirmTmpl) {
                                  let text = confirmTmpl.text
                                    .replace(/\[მომხმარებლის სახელი\]/g, appt.customerName)
                                    .replace(/\[თარიღი\]/g, appt.dateTime.split('T')[0])
                                    .replace(/\[საათი\]/g, formatTime(appt.dateTime))
                                    .replace(/\[პროცედურა\]/g, proc?.name || '')
                                    .replace(/\[თანამშრომელი\]/g, emp?.name || '')
                                    .replace(/\[მისამართი\]/g, initialCenterSettings.address)
                                    .replace(/\[ტელეფონი\]/g, appt.phone)
                                    .replace(/\[ცენტრის სახელი\]/g, centerName);
                                  onSendMessage(appt.phone, text, confirmTmpl.name);
                                }
                              }}
                              title="შეხსენების გაგზავნა"
                              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-primary-600 transition-all shrink-0 cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                onNavigate('calendar');
                                // Could pass an appointment to open/highlight
                              }}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              მართვა
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-12 text-center text-stone-400">
                <Calendar className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="text-sm">დღეს ჩაწერილი ვიზიტები არ გაქვთ.</p>
                <button
                  onClick={() => onOpenQuickBook()}
                  className="mt-3 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100/30 hover:bg-primary-100 transition-all"
                >
                  კლიენტის პირველი ჩაწერა
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: 21-Day Follow-ups & Reminders */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-primary-50/20">
              <span className="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                ავტომატური სისტემა
              </span>
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-primary-500 shrink-0" />
                ლაზერის 21-დღიანი შეხსენებები
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                კლიენტები, რომელთაც უახლოვდებათ შემდეგი ლაზერული ეპილაციის გეგმიური ვიზიტი.
              </p>
            </div>

            {pendingConfirmation.length > 0 ? (
              <div className="divide-y divide-stone-50">
                {pendingConfirmation.map(appt => {
                  const cust = customers.find(c => c.id === appt.customerId);
                  const proc = procedures.find(p => p.id === appt.procedureId);
                  const emp = employees.find(e => e.id === appt.employeeId);
                  
                  return (
                    <div key={appt.id} className="p-4 hover:bg-stone-50/50 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <h4 className="font-bold text-stone-800 text-sm">
                              {appt.customerName}
                            </h4>
                          </div>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">
                            მობ: {appt.phone}
                          </p>
                        </div>
                        
                        <span className="text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md shrink-0">
                          შემოთავაზებული: {appt.dateTime.split('T')[0]}
                        </span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100/50 text-xs text-stone-600">
                        <span className="font-semibold text-stone-700">{proc?.name || 'ლაზერული ეპილაცია'}</span> | ბოლო სპეციალისტი: <span className="font-semibold">{emp?.name || 'Tamar'}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-stone-100">
                        {/* Send whatsapp/sms option */}
                        <button
                          onClick={() => handleQuickLaserFollowUpMessage(appt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>შეტყობინება</span>
                        </button>

                        <button
                          onClick={() => {
                            // Perfect fit: prefill a calendar booking for this recommendation!
                            onOpenQuickBook({
                              id: appt.id, // specify ID so we edit or confirm it
                              customerId: appt.customerId,
                              customerName: appt.customerName,
                              phone: appt.phone,
                              procedureId: appt.procedureId,
                              employeeId: appt.employeeId,
                              price: appt.price,
                              duration: appt.duration,
                              dateTime: appt.dateTime, // Prefill the 21-day target
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>ჩაწერა</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto text-stone-300 mb-1.5" />
                არ არის აქტიური 21-დღიანი რიგი ამ ეტაპზე.
              </div>
            )}
          </div>
          
          {/* Quick tips */}
          <div className="bg-[#fdfaf7] border border-amber-100 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-semibold text-amber-950 flex items-center gap-1">
              💡 ყოველდღიური მითითება
            </h4>
            <p className="text-amber-800 leading-relaxed">
              ლაზერული ეპილაციის ჩაწერის დასრულებისას, სისტემა ავტომატურად ითვლის 21 დღეს და ინახავს შემოთავაზებულ ვიზიტს „შესათანხმებელი“ სტატუსით. შეტყობინებაზე დაჭერით შეგიძლიათ მომხმარებელს გაუგზავნოთ ტექსტი WhatsApp/SMS-ით და შეათანხმოთ ზუსტი საათი.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
