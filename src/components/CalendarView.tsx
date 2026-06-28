import React, { useState, useMemo } from 'react';
import { Appointment, Customer, Employee, Procedure, PaymentStatus, PaymentMethod, AppointmentStatus, DiscountType, MessageTemplate } from '../types';
import { laserZones } from '../data/initialData';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  Edit, 
  Check, 
  X, 
  MessageSquare, 
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  customers: Customer[];
  procedures: Procedure[];
  employees: Employee[];
  templates: MessageTemplate[];
  currentUser: Employee;
  centerName: string;
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointment: (appt: Appointment) => void;
  onAddCustomer: (cust: Customer) => void;
  onLogAction: (action: string, details: string) => void;
  onSendMessage: (phone: string, text: string, templateName: string) => void;
  // State for opening/prefilling the booking form from dashboard
  prefilledAppt: Partial<Appointment> | null;
  setPrefilledAppt: (appt: Partial<Appointment> | null) => void;
}

export default function CalendarView({
  appointments,
  customers,
  procedures,
  employees,
  templates,
  currentUser,
  centerName,
  onAddAppointment,
  onUpdateAppointment,
  onAddCustomer,
  onLogAction,
  onSendMessage,
  prefilledAppt,
  setPrefilledAppt
}: CalendarViewProps) {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day');
  const [activeDate, setActiveDate] = useState<Date>(new Date("2026-06-28")); // Anchor today in 2026
  
  // Filters
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [filterProcedureId, setFilterProcedureId] = useState<string>('all');

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form State for Booking
  const [formPhone, setFormPhone] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formProcedureId, setFormProcedureId] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDate, setFormDate] = useState('2026-06-28');
  const [formTime, setFormTime] = useState('10:00');
  const [formCustomPrice, setFormCustomPrice] = useState<number | ''>('');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('none');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('cash');
  const [formAppointmentStatus, setFormAppointmentStatus] = useState<AppointmentStatus>('booked');
  const [formNote, setFormNote] = useState('');
  
  // Laser epilation zones and messaging state
  const [formSelectedZones, setFormSelectedZones] = useState<string[]>([]);
  const [formMessageText, setFormMessageText] = useState('');
  const [selectedTemplateName, setSelectedTemplateName] = useState('');

  // Handle external prefill from Dashboard
  React.useEffect(() => {
    if (prefilledAppt) {
      // Open modal
      if (prefilledAppt.id && !prefilledAppt.id.startsWith('new_')) {
        // Edit existing recommendation or appointment
        const realAppt = appointments.find(a => a.id === prefilledAppt.id);
        if (realAppt) {
          handleOpenEdit(realAppt);
        }
      } else {
        // Prefill new appointment
        handleOpenNew();
        if (prefilledAppt.phone) setFormPhone(prefilledAppt.phone);
        if (prefilledAppt.customerName) {
          const parts = prefilledAppt.customerName.split(' ');
          setFormFirstName(parts[0] || '');
          setFormLastName(parts.slice(1).join(' ') || '');
        }
        if (prefilledAppt.procedureId) {
          setFormProcedureId(prefilledAppt.procedureId);
          const pr = procedures.find(p => p.id === prefilledAppt.procedureId);
          if (pr) setFormCustomPrice(pr.price);
        }
        if (prefilledAppt.employeeId) setFormEmployeeId(prefilledAppt.employeeId);
        if (prefilledAppt.dateTime) {
          const [d, t] = prefilledAppt.dateTime.split('T');
          setFormDate(d);
          if (t) setFormTime(t.substring(0, 5));
        }
      }
      // Clear prefill so it doesn't trigger again
      setPrefilledAppt(null);
    }
  }, [prefilledAppt]);

  // Handle phone auto-lookup
  const handlePhoneChange = (phoneInput: string) => {
    const rawDigits = phoneInput.replace(/\D/g, '');
    setFormPhone(rawDigits);
    
    // Look up in database
    const matchedCustomer = customers.find(c => c.phone.replace(/\D/g, '').endsWith(rawDigits) && rawDigits.length >= 6);
    if (matchedCustomer) {
      setFormFirstName(matchedCustomer.firstName);
      setFormLastName(matchedCustomer.lastName);
    }
  };

  // When procedure changes, auto-load standard price
  const handleProcedureChange = (id: string) => {
    setFormProcedureId(id);
    const selectedProc = procedures.find(p => p.id === id);
    if (selectedProc) {
      setFormCustomPrice(selectedProc.price);
    } else {
      setFormCustomPrice('');
    }
  };

  // Calculations for booking form final price
  const calculatedFinalPrice = useMemo(() => {
    const base = Number(formCustomPrice) || 0;
    if (formDiscountType === 'none') return base;
    if (formDiscountType === 'amount') return Math.max(0, base - formDiscountValue);
    if (formDiscountType === 'percent') return Math.max(0, base - Math.round((base * formDiscountValue) / 100));
    return base;
  }, [formCustomPrice, formDiscountType, formDiscountValue]);

  // Navigate dates
  const handlePrevDate = () => {
    const newDate = new Date(activeDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setActiveDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(activeDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setActiveDate(newDate);
  };

  const setToday = () => {
    setActiveDate(new Date("2026-06-28"));
  };

  // Format active date label
  const formattedDateLabel = useMemo(() => {
    const monthsGeo = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ];
    const monthIndex = activeDate.getMonth();
    const year = activeDate.getFullYear();
    
    if (currentView === 'day') {
      const day = activeDate.getDate();
      return `${day} ${monthsGeo[monthIndex]}, ${year}`;
    } else if (currentView === 'week') {
      // Find start of week (Monday)
      const currentDay = activeDate.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay; // Distance to Monday
      const monday = new Date(activeDate);
      monday.setDate(monday.getDate() + distance);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      
      return `${monday.getDate()} ${monthsGeo[monday.getMonth()]} - ${sunday.getDate()} ${monthsGeo[sunday.getMonth()]} ${year}`;
    } else {
      return `${monthsGeo[monthIndex]} ${year}`;
    }
  }, [activeDate, currentView]);

  // Filtered Appointments list
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      // Employee filter
      if (filterEmployeeId !== 'all' && appt.employeeId !== filterEmployeeId) return false;
      // Procedure filter
      if (filterProcedureId !== 'all' && appt.procedureId !== filterProcedureId) return false;
      
      return true;
    });
  }, [appointments, filterEmployeeId, filterProcedureId]);

  // Appointments grouped by date
  const appointmentsByDate = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(appt => {
      const dateStr = appt.dateTime.split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(appt);
    });
    return groups;
  }, [filteredAppointments]);

  // Current day's appointments sorted by hour
  const todayAppointments = useMemo(() => {
    const dateStr = activeDate.toISOString().split('T')[0];
    const appts = appointmentsByDate[dateStr] || [];
    return [...appts].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  }, [appointmentsByDate, activeDate]);

  // Get days of the current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const currentDay = activeDate.getDay();
    const distance = currentDay === 0 ? -6 : 1 - currentDay; // Distance to Monday
    const monday = new Date(activeDate);
    monday.setDate(monday.getDate() + distance);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  }, [activeDate]);

  // Get days of current month grid
  const monthDays = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 is Mon
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fill previous month padding
    const days: (Date | null)[] = [];
    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      days.push(null);
    }
    
    // Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [activeDate]);

  // Open New Form
  const handleOpenNew = (dateOverride?: Date, timeOverride?: string) => {
    setSelectedAppointment(null);
    setFormPhone('');
    setFormFirstName('');
    setFormLastName('');
    setFormProcedureId(procedures[0]?.id || '');
    setFormEmployeeId(currentUser.role === 'employee' ? currentUser.id : employees[1]?.id || employees[0]?.id || '');
    setFormDate(dateOverride ? dateOverride.toISOString().split('T')[0] : activeDate.toISOString().split('T')[0]);
    setFormTime(timeOverride || '11:00');
    setFormCustomPrice(procedures[0]?.price || '');
    setFormDiscountType('none');
    setFormDiscountValue(0);
    setFormPaymentStatus('unpaid');
    setFormPaymentMethod('cash');
    setFormAppointmentStatus('booked');
    setFormNote('');
    setFormSelectedZones([]);
    setFormMessageText('');
    setSelectedTemplateName('');
    setIsBookModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (appt: Appointment) => {
    setSelectedAppointment(appt);
    
    const matchedCustomer = customers.find(c => c.id === appt.customerId);
    
    setFormPhone(appt.phone);
    if (matchedCustomer) {
      setFormFirstName(matchedCustomer.firstName);
      setFormLastName(matchedCustomer.lastName);
    } else {
      const parts = appt.customerName.split(' ');
      setFormFirstName(parts[0] || '');
      setFormLastName(parts.slice(1).join(' ') || '');
    }
    
    setFormProcedureId(appt.procedureId);
    setFormEmployeeId(appt.employeeId);
    
    const [d, t] = appt.dateTime.split('T');
    setFormDate(d);
    setFormTime(t?.substring(0, 5) || '12:00');
    setFormCustomPrice(appt.price);
    setFormDiscountType(appt.discountType);
    setFormDiscountValue(appt.discountValue);
    setFormPaymentStatus(appt.paymentStatus);
    setFormPaymentMethod(appt.paymentMethod);
    setFormAppointmentStatus(appt.appointmentStatus);
    setFormNote(appt.note || '');
    setFormSelectedZones(appt.selectedZones || []);
    setFormMessageText('');
    setSelectedTemplateName('');
    setIsBookModalOpen(true);
  };

  // Submit appointment creation or editing
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formPhone || !formFirstName || !formLastName || !formProcedureId || !formEmployeeId) {
      alert('გთხოვთ შეავსოთ სავალდებულო ველები');
      return;
    }

    // 1. Resolve customer
    let targetCustomer = customers.find(c => c.phone.replace(/\D/g, '') === formPhone.replace(/\D/g, ''));
    
    if (!targetCustomer) {
      // Create new customer profile
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        phone: formPhone.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddCustomer(newCust);
      targetCustomer = newCust;
      onLogAction('კლიენტის დამატება', `სისტემამ ავტომატურად შექმნა კლიენტი ჩაწერისას: ${newCust.firstName} ${newCust.lastName}`);
    }

    // 2. Build Appointment payload
    const dateTimeStr = `${formDate}T${formTime}`;
    
    const finalAppointment: Appointment = {
      id: selectedAppointment ? selectedAppointment.id : `appt_${Date.now()}`,
      customerId: targetCustomer.id,
      customerName: `${targetCustomer.firstName} ${targetCustomer.lastName}`,
      phone: targetCustomer.phone,
      procedureId: formProcedureId,
      employeeId: formEmployeeId,
      dateTime: dateTimeStr,
      duration: procedures.find(p => p.id === formProcedureId)?.duration || 30,
      price: Number(formCustomPrice) || 0,
      discountType: formDiscountType,
      discountValue: Number(formDiscountValue) || 0,
      finalPrice: calculatedFinalPrice,
      paidAmount: formPaymentStatus === 'paid' ? calculatedFinalPrice : formPaymentStatus === 'partial' ? Math.round(calculatedFinalPrice / 2) : 0,
      paymentStatus: formPaymentStatus,
      paymentMethod: formPaymentMethod,
      appointmentStatus: formAppointmentStatus,
      note: formNote.trim(),
      selectedZones: formSelectedZones,
      createdAt: selectedAppointment ? selectedAppointment.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };

    if (selectedAppointment) {
      onUpdateAppointment(finalAppointment);
      onLogAction('ვიზიტის რედაქტირება', `რედაქტირდა ვიზიტი #${apptIdShort(finalAppointment.id)} კლიენტისთვის ${finalAppointment.customerName}`);
    } else {
      onAddAppointment(finalAppointment);
      onLogAction('ვიზიტის დამატება', `ახალი ჩაწერა #${apptIdShort(finalAppointment.id)} კლიენტისთვის ${finalAppointment.customerName} პროცედურაზე ${procedures.find(p => p.id === formProcedureId)?.name}`);
    }

    setIsBookModalOpen(false);
  };

  const handleQuickStatusChange = (appt: Appointment, newStatus: AppointmentStatus) => {
    const updated: Appointment = {
      ...appt,
      appointmentStatus: newStatus,
      updatedAt: new Date().toISOString()
    };
    onUpdateAppointment(updated);
    onLogAction('ვიზიტის სტატუსის შეცვლა', `ვიზიტის #${apptIdShort(appt.id)} სტატუსი გახდა: ${newStatus} კლიენტისთვის ${appt.customerName}`);
  };

  const handleQuickPaymentChange = (appt: Appointment, status: PaymentStatus, method: PaymentMethod) => {
    const updated: Appointment = {
      ...appt,
      paymentStatus: status,
      paymentMethod: method,
      paidAmount: status === 'paid' ? appt.finalPrice : appt.paidAmount,
      updatedAt: new Date().toISOString()
    };
    onUpdateAppointment(updated);
    onLogAction('ვიზიტის გადახდის შეცვლა', `ვიზიტის #${apptIdShort(appt.id)} გადახდის სტატუსი: ${status} (${method})`);
  };

  const apptIdShort = (id: string) => id.substring(0, 8);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed': return 'border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50 text-green-900';
      case 'confirmed': return 'border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-900';
      case 'booked': return 'border-l-4 border-l-amber-500 bg-amber-50/50 hover:bg-amber-50 text-amber-900';
      case 'cancelled': return 'border-l-4 border-l-red-500 bg-red-50/40 hover:bg-red-50 text-stone-500 line-through';
      case 'pending_confirmation': return 'border-l-4 border-l-purple-500 bg-purple-50/50 hover:bg-purple-50 text-purple-950';
      case 'reschedule': return 'border-l-4 border-l-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900';
      case 'noshow': return 'border-l-4 border-l-rose-600 bg-rose-50/30 text-rose-900';
      default: return 'border-l-4 border-l-stone-300 bg-stone-100 text-stone-800';
    }
  };

  const formatGEL = (amount: number) => `${amount} ₾`;

  const getEmployeeColor = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp?.color || '#ec4899'; // fallback to beautiful rose/pink
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Calendar Header with Controls */}
      <div className="bg-white p-4 border border-stone-100 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        {/* Navigation Arrows & Current Label */}
        <div className="flex items-center gap-3 justify-between md:justify-start">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${currentView === 'day' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
            >
              დღე
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${currentView === 'week' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
            >
              კვირა
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${currentView === 'month' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
            >
              თვე
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevDate}
              className="p-2 hover:bg-stone-100 rounded-xl transition-all cursor-pointer text-stone-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-700 font-semibold cursor-pointer"
            >
              დღეს
            </button>
            
            <button
              onClick={handleNextDate}
              className="p-2 hover:bg-stone-100 rounded-xl transition-all cursor-pointer text-stone-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Title */}
        <h2 className="text-lg md:text-xl font-bold font-display text-stone-800 text-center">
          {formattedDateLabel}
        </h2>

        {/* Quick New Booking Button */}
        <button
          onClick={() => handleOpenNew()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>ჩაწერა</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white px-4 py-3 border border-stone-100 rounded-2xl flex flex-wrap items-center gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-stone-500">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="font-semibold">ფილტრები:</span>
        </div>

        {/* Employee Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400">სპეციალისტი:</span>
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 focus:outline-hidden focus:ring-1 focus:ring-primary-500 font-semibold text-stone-700"
          >
            <option value="all">ყველა სპეციალისტი</option>
            {employees.filter(e => e.id !== 'emp_1').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.profession})</option>
            ))}
          </select>
        </div>

        {/* Procedure Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400">პროცედურა:</span>
          <select
            value={filterProcedureId}
            onChange={(e) => setFilterProcedureId(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 focus:outline-hidden focus:ring-1 focus:ring-primary-500 font-semibold text-stone-700"
          >
            <option value="all">ყველა პროცედურა</option>
            {procedures.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER ACTIVE CALENDAR VIEW */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
        {currentView === 'day' && (
          <div className="p-4 space-y-4">
            <div className="border-b border-stone-100 pb-2 mb-2 flex justify-between items-center bg-stone-50/50 p-2 rounded-xl">
              <span className="text-xs font-semibold text-stone-500">საათობრივი განრიგი (9:00 - 20:00)</span>
              <span className="text-xs text-stone-400 font-mono">2026-06-28</span>
            </div>

            {/* Custom Day Schedule Grid */}
            <div className="space-y-3">
              {/* Generate standard hours slots */}
              {Array.from({ length: 12 }, (_, i) => {
                const hour = 9 + i;
                const timeLabel = `${hour < 10 ? '0' : ''}${hour}:00`;
                const nextTimeLabel = `${hour < 10 ? '0' : ''}${hour}:30`;

                // Find appointments in this specific hour slot
                const slotsAppts = todayAppointments.filter(appt => {
                  const apptHour = parseInt(appt.dateTime.split('T')[1]?.substring(0, 2) || '0');
                  return apptHour === hour;
                });

                return (
                  <div key={hour} className="flex gap-4 group">
                    {/* Time Column */}
                    <div className="w-14 shrink-0 text-right py-1">
                      <span className="text-xs font-bold font-mono text-stone-400">{timeLabel}</span>
                    </div>

                    {/* Booking Blocks column */}
                    <div className="flex-1 space-y-2 border-t border-dashed border-stone-100 pt-2 min-h-[50px]">
                      {slotsAppts.length > 0 ? (
                        slotsAppts.map(appt => {
                          const proc = procedures.find(p => p.id === appt.procedureId);
                          const emp = employees.find(e => e.id === appt.employeeId);

                          return (
                            <div
                              key={appt.id}
                              className={`p-3 rounded-xl border transition-all relative flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xs ${getStatusColor(appt.appointmentStatus)}`}
                              style={{ borderLeftColor: getEmployeeColor(appt.employeeId), borderLeftWidth: '6px' }}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-mono text-xs font-bold text-stone-400 bg-white/60 px-1.5 py-0.5 rounded-md border border-stone-200/30">
                                    {appt.dateTime.split('T')[1]?.substring(0, 5)}
                                  </span>
                                  <h4 className="font-bold text-sm text-stone-900 cursor-pointer hover:underline" onClick={() => handleOpenEdit(appt)}>
                                    {appt.customerName}
                                  </h4>
                                  <span 
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-3xs"
                                    style={{ backgroundColor: getEmployeeColor(appt.employeeId) }}
                                  >
                                    <User className="w-2.5 h-2.5" />
                                    {emp?.name.split(' ')[0]}
                                  </span>
                                </div>
                                <p className="text-xs">
                                  <span className="font-bold">{proc?.name || 'უცნობი პროცედურა'}</span>
                                </p>
                                
                                {appt.procedureId === 'proc_1' && appt.selectedZones && appt.selectedZones.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center py-0.5">
                                    <span className="text-[10px] text-stone-500 font-bold">ზონები:</span>
                                    {appt.selectedZones.map(zone => (
                                      <span key={zone} className="inline-block text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-md border border-primary-100/30 font-semibold">
                                        {zone}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <p className="text-xs opacity-80 font-mono">
                                  ტელ: {appt.phone} | ხანგრძლივობა: {appt.duration} წთ
                                  {appt.note && ` | შენიშვნა: "${appt.note}"`}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 justify-between md:justify-end border-t border-dashed border-stone-200/30 pt-2 md:pt-0 md:border-0">
                                {/* Details & Pricing */}
                                <div className="text-left md:text-right">
                                  <p className="text-[10px] opacity-70">საბოლოო ფასი</p>
                                  <p className="text-sm font-extrabold font-mono text-stone-800">{formatGEL(appt.finalPrice)}</p>
                                </div>

                                {/* Quick Controls */}
                                <div className="flex gap-1.5">
                                  {appt.appointmentStatus !== 'completed' && appt.appointmentStatus !== 'cancelled' && (
                                    <>
                                      <button
                                        onClick={() => handleQuickStatusChange(appt, 'completed')}
                                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all cursor-pointer"
                                        title="დასრულება"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      
                                      <button
                                        onClick={() => handleQuickStatusChange(appt, 'cancelled')}
                                        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-all cursor-pointer"
                                        title="გაუქმება"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {appt.paymentStatus !== 'paid' && (
                                    <button
                                      onClick={() => handleQuickPaymentChange(appt, 'paid', 'cash')}
                                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-0.5 cursor-pointer"
                                      title="გადახდა"
                                    >
                                      <DollarSign className="w-3 h-3" />
                                      <span>გადახდა</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleOpenEdit(appt)}
                                    className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-all border border-green-200/40 cursor-pointer"
                                    title="შეტყობინების გაგზავნა"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleOpenEdit(appt)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-all cursor-pointer"
                                    title="რედაქტირება"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          onClick={() => handleOpenNew(activeDate, timeLabel)}
                          className="py-1 px-3 rounded-xl border border-dashed border-stone-200 text-stone-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/10 cursor-pointer text-xs transition-all flex items-center gap-1 group-hover:border-stone-300"
                        >
                          <Plus className="w-3.5 h-3.5 opacity-50" />
                          <span>დრო თავისუფალია - ჩაწერა</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'week' && (
          <div className="p-2 overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const dayStr = day.toISOString().split('T')[0];
                const dayAppts = appointmentsByDate[dayStr] || [];
                const weekdaysGeo = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];

                const isToday = dayStr === "2026-06-28";

                return (
                  <div key={dayStr} className={`border border-stone-100 rounded-xl p-2 min-h-[400px] flex flex-col space-y-2 ${isToday ? 'bg-primary-50/10 border-primary-300' : 'bg-stone-50/20'}`}>
                    <div className={`text-center pb-2 border-b border-stone-100 ${isToday ? 'text-primary-700' : ''}`}>
                      <p className="text-[10px] uppercase font-bold tracking-wider">{weekdaysGeo[day.getDay()]}</p>
                      <p className="text-sm font-extrabold">{day.getDate()}</p>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto">
                      {dayAppts.length > 0 ? (
                        dayAppts
                          .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
                          .map(appt => {
                            const proc = procedures.find(p => p.id === appt.procedureId);
                            return (
                              <div
                                key={appt.id}
                                onClick={() => handleOpenEdit(appt)}
                                className={`p-1.5 rounded-lg border text-[10px] leading-tight cursor-pointer shadow-3xs transition-all truncate hover:scale-[1.02] ${getStatusColor(appt.appointmentStatus)}`}
                                style={{ borderLeftColor: getEmployeeColor(appt.employeeId), borderLeftWidth: '4px' }}
                              >
                                <span className="font-bold font-mono block text-stone-500">
                                  {appt.dateTime.split('T')[1]?.substring(0, 5)}
                                </span>
                                <span className="font-bold block text-stone-800 truncate">{appt.customerName}</span>
                                <span className="block text-stone-500 truncate">{proc?.name}</span>
                              </div>
                            );
                          })
                      ) : (
                        <div className="h-full flex items-center justify-center text-stone-300 text-[10px] py-12">
                          ცარიელია
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenNew(day)}
                      className="w-full py-1 border border-dashed border-stone-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 rounded-lg text-[10px] font-bold text-stone-400 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>დამატება</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'month' && (
          <div className="p-4">
            {/* Days of week headers */}
            <div className="grid grid-cols-7 text-center mb-2">
              {['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'].map(label => (
                <div key={label} className="text-xs font-bold text-stone-400 py-1">{label}</div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-3">
              {monthDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="bg-stone-50/50 rounded-xl aspect-square md:min-h-[80px]" />;
                }

                const dayStr = day.toISOString().split('T')[0];
                const dayAppts = appointmentsByDate[dayStr] || [];
                const isToday = dayStr === "2026-06-28";

                return (
                  <div
                    key={dayStr}
                    onClick={() => {
                      setActiveDate(day);
                      setCurrentView('day');
                    }}
                    className={`border rounded-xl p-1.5 aspect-square md:min-h-[90px] flex flex-col justify-between cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/10 ${
                      isToday 
                        ? 'border-primary-500 bg-primary-50/10 shadow-xs' 
                        : 'border-stone-100 bg-stone-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${isToday ? 'bg-primary-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-stone-700'}`}>
                        {day.getDate()}
                      </span>
                      
                      {dayAppts.length > 0 && (
                        <span className="text-[10px] font-bold px-1 py-0.2 bg-stone-200 text-stone-700 rounded-md font-mono">
                          {dayAppts.length}
                        </span>
                      )}
                    </div>

                    <div className="hidden md:block flex-1 mt-1 space-y-1 overflow-hidden max-h-[50px]">
                      {dayAppts.slice(0, 2).map(appt => {
                        const proc = procedures.find(p => p.id === appt.procedureId);
                        return (
                          <div 
                            key={appt.id} 
                            className="text-[9px] bg-stone-100 rounded-md px-1 py-0.5 border-l-2 truncate text-stone-700 font-semibold"
                            style={{ borderLeftColor: getEmployeeColor(appt.employeeId) }}
                          >
                            {appt.dateTime.split('T')[1]?.substring(0, 5)} {appt.customerName.split(' ')[0]}
                          </div>
                        );
                      })}
                      {dayAppts.length > 2 && (
                        <div className="text-[8px] text-primary-500 font-bold text-center mt-0.5">
                          +{dayAppts.length - 2} კიდევ
                        </div>
                      )}
                    </div>

                    <div className="md:hidden flex flex-wrap justify-center gap-0.5 mt-1">
                      {dayAppts.slice(0, 3).map(appt => (
                        <span 
                          key={appt.id} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: getEmployeeColor(appt.employeeId) }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-stone-100 animate-zoomIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                {selectedAppointment ? 'ვიზიტის მართვა' : 'ახალი ვიზიტი / ჩაწერა'}
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 hover:bg-stone-200 rounded-full transition-all text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitBooking} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Phone Lookup field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    ტელეფონის ნომერი *
                  </label>
                  <input
                    type="tel"
                    placeholder="მაგ: 599123456"
                    required
                    value={formPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    ნომრის ჩაწერისას სისტემა ავტომატურად ეძებს კლიენტს
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    სახელი და გვარი *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="სახელი"
                      required
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-1/2 px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                    />
                    <input
                      type="text"
                      placeholder="გვარი"
                      required
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-1/2 px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Procedure & Employee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    პროცედურა *
                  </label>
                  <select
                    value={formProcedureId}
                    onChange={(e) => handleProcedureChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2"
                  >
                    {procedures.filter(p => p.isActive).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price} ₾, {p.duration} წთ)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    სპეციალისტი *
                  </label>
                  <select
                    value={formEmployeeId}
                    disabled={currentUser.role === 'employee'}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 disabled:bg-stone-50"
                  >
                    {employees.filter(e => e.id !== 'emp_1' && e.isActive).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.profession})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Laser Epilation Zones selector */}
              {formProcedureId === 'proc_1' && (
                <div className="p-4 bg-primary-50/40 border border-primary-100 rounded-2xl space-y-3 animate-fadeIn">
                  <span className="block text-xs font-bold text-primary-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-primary-600" />
                    ლაზერული ეპილაციის ზონები (მონიშნეთ რამდენიმე):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[180px] overflow-y-auto p-3 border border-primary-100/30 rounded-xl bg-white shadow-3xs">
                    {laserZones.map(zone => {
                      const isChecked = formSelectedZones.includes(zone.name);
                      return (
                        <label key={zone.name} className={`flex items-center gap-2 text-xs text-stone-700 hover:text-stone-950 cursor-pointer p-1.5 rounded-lg border transition-all select-none ${isChecked ? 'bg-primary-50/60 border-primary-200 font-semibold' : 'border-stone-100 hover:bg-stone-50'}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let nextZones = [...formSelectedZones];
                              if (isChecked) {
                                nextZones = nextZones.filter(z => z !== zone.name);
                              } else {
                                nextZones.push(zone.name);
                              }
                              setFormSelectedZones(nextZones);
                              
                              // Automatically calculate the sum of selected zones as the base custom price
                              const newBasePrice = nextZones.reduce((sum, zName) => {
                                const matched = laserZones.find(lz => lz.name === zName);
                                return sum + (matched?.price || 0);
                              }, 0);
                              
                              setFormCustomPrice(newBasePrice || '');
                            }}
                            className="rounded-sm border-stone-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 accent-primary-600 cursor-pointer"
                          />
                          <span>{zone.name} ({zone.price}₾)</span>
                        </label>
                      );
                    })}
                  </div>
                  {formSelectedZones.length > 0 && (
                    <div className="text-xs text-primary-700 flex justify-between items-center px-1 font-semibold">
                      <span>მონიშნულია: {formSelectedZones.length} ზონა</span>
                      <span className="bg-primary-100/50 px-2.5 py-1 rounded-lg border border-primary-200/20 text-primary-800 font-mono">ჯამური ფასი: {formCustomPrice} ₾</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    თარიღი *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    საათი *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 font-mono"
                  />
                </div>
              </div>

              {/* Price and Discounts */}
              <div className="p-3.5 bg-stone-50 border border-stone-100 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-stone-700">ფასები და ფასდაკლებები</h4>
                
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">პროცედურის ფასი</label>
                    <input
                      type="number"
                      value={formCustomPrice}
                      onChange={(e) => setFormCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">ფასდაკლების ტიპი</label>
                    <select
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value as DiscountType)}
                      className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    >
                      <option value="none">არა</option>
                      <option value="amount">ფიქსირებული ₾</option>
                      <option value="percent">პროცენტი %</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">მნიშვნელობა</label>
                    <input
                      type="number"
                      disabled={formDiscountType === 'none'}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs font-mono disabled:bg-stone-100"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2 border border-stone-100 rounded-lg">
                  <span className="text-xs font-bold text-stone-500">გადასახდელი ჯამი:</span>
                  <span className="text-sm font-extrabold text-stone-800 font-mono">
                    {formatGEL(calculatedFinalPrice)}
                  </span>
                </div>
              </div>

              {/* Statuses */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    ვიზიტის სტატუსი
                  </label>
                  <select
                    value={formAppointmentStatus}
                    onChange={(e) => setFormAppointmentStatus(e.target.value as AppointmentStatus)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  >
                    <option value="booked">ჩაწერილია</option>
                    <option value="confirmed">დადასტურებულია</option>
                    <option value="completed">დასრულებულია</option>
                    <option value="noshow">არ მოვიდა</option>
                    <option value="cancelled">გაუქმებულია</option>
                    <option value="reschedule">გადასატანია</option>
                    <option value="pending_confirmation">ელოდება შეთანხმებას</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    გადახდის სტატუსი
                  </label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  >
                    <option value="unpaid">გადასახდელია</option>
                    <option value="partial">ნაწილობრივ</option>
                    <option value="paid">გადახდილია</option>
                    <option value="cancelled">გაუქმებულია</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    გადახდის მეთოდი
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  >
                    <option value="cash">ნაღდი</option>
                    <option value="card">ბარათი</option>
                    <option value="transfer">გადმორიცხვა</option>
                    <option value="other">სხვა</option>
                  </select>
                </div>
              </div>

              {/* Message Templates Quick Communication */}
              {selectedAppointment && templates && templates.length > 0 && (
                <div className="p-4 bg-green-50/40 border border-green-200/40 rounded-2xl space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    შეტყობინების გაგზავნა კლიენტთან
                  </h4>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">აირჩიეთ შაბლონი</label>
                      <select
                        onChange={(e) => {
                          const selectedTemplateId = e.target.value;
                          const tpl = templates.find(t => t.id === selectedTemplateId);
                          if (tpl) {
                            const emp = employees.find(em => em.id === formEmployeeId);
                            const proc = procedures.find(p => p.id === formProcedureId);
                            let formatted = tpl.text
                              .replace(/\[მომხმარებლის სახელი\]/g, `${formFirstName} ${formLastName}`)
                              .replace(/\[თარიღი\]/g, formDate)
                              .replace(/\[საათი\]/g, formTime)
                              .replace(/\[პროცედურა\]/g, proc?.name || '')
                              .replace(/\[თანამშრომელი\]/g, emp?.name || '')
                              .replace(/\[ცენტრის სახელი\]/g, centerName || 'BELLISSIMA')
                              .replace(/\[მისამართი\]/g, 'ჭავჭავაძის გამზ. 37')
                              .replace(/\[ტელეფონი\]/g, '+995 599 123 456');
                            
                            setFormMessageText(formatted);
                            setSelectedTemplateName(tpl.name);
                          } else {
                            setFormMessageText('');
                            setSelectedTemplateName('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-green-500/10 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="">-- აირჩიეთ შაბლონი გასაგზავნად --</option>
                        {templates.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.channel === 'whatsapp' ? 'WhatsApp' : tpl.channel === 'email' ? 'Email' : 'SMS'})</option>
                        ))}
                      </select>
                    </div>

                    {formMessageText && (
                      <div className="space-y-2 animate-fadeIn">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">ტექსტის წინასწარი ნახვა</label>
                        <textarea
                          rows={4}
                          value={formMessageText}
                          onChange={(e) => setFormMessageText(e.target.value)}
                          className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-sans focus:outline-hidden focus:ring-2 focus:ring-green-500/10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formPhone && formMessageText) {
                              onSendMessage(formPhone, formMessageText, selectedTemplateName || 'კალენდარი');
                              setFormMessageText('');
                            } else {
                              alert('ტელეფონი ან ტექსტი ცარიელია');
                            }
                          }}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-green-700/20"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>გაგზავნა (WhatsApp / SMS)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Note / Comment */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  შენიშვნა კლიენტზე ან ვიზიტზე (სურვილისამებრ)
                </label>
                <textarea
                  rows={2}
                  placeholder="მაგ: მგრძნობიარე კანის ზონა, ჩაწერა შემოთავაზებულია"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                {selectedAppointment && (
                  <button
                    type="button"
                    onClick={() => {
                      if(confirm("ნამდვილად გსურთ ამ ჩაწერის წაშლა?")) {
                        onUpdateAppointment({
                          ...selectedAppointment,
                          appointmentStatus: 'cancelled',
                          updatedAt: new Date().toISOString()
                        });
                        onLogAction('ვიზიტის წაშლა / გაუქმება', `წაიშალა ჩაწერა #${apptIdShort(selectedAppointment.id)} კლიენტისთვის ${selectedAppointment.customerName}`);
                        setIsBookModalOpen(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-xl transition-all border border-red-200/40 cursor-pointer"
                  >
                    წაშლა
                  </button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    გაუქმება
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {selectedAppointment ? 'რედაქტირება' : 'ჩაწერა'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
