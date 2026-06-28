import React, { useState, useMemo } from 'react';
import { Customer, Appointment, Procedure, Employee, CustomerStatus } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  DollarSign, 
  Clock, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Heart,
  X,
  Archive
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  appointments: Appointment[];
  procedures: Procedure[];
  employees: Employee[];
  onAddCustomer: (cust: Customer) => void;
  onUpdateCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onLogAction: (action: string, details: string) => void;
  onOpenQuickBook: (prefilled: Partial<Appointment>) => void;
}

export default function CustomersView({
  customers,
  appointments,
  procedures,
  employees,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onLogAction,
  onOpenQuickBook
}: CustomersViewProps) {
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Selected Customer detail drawer / modal state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('active');

  // Filter & Search customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      // Search matches first name, last name, or phone number
      const fullName = `${cust.firstName} ${cust.lastName}`.toLowerCase();
      const searchMatch = 
        fullName.includes(searchTerm.toLowerCase()) || 
        cust.phone.includes(searchTerm);

      if (!searchMatch) return false;

      // Status filter
      if (filterStatus !== 'all' && cust.status !== filterStatus) return false;

      return true;
    });
  }, [customers, searchTerm, filterStatus]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Selected customer history
  const customerAppointments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return appointments
      .filter(appt => appt.customerId === selectedCustomerId)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime)); // reverse chron
  }, [appointments, selectedCustomerId]);

  // Calculated statistics for selected customer
  const customerStats = useMemo(() => {
    if (customerAppointments.length === 0) return { totalSpend: 0, completedCount: 0, lastSpecialist: 'N/A' };
    
    const completed = customerAppointments.filter(a => a.appointmentStatus === 'completed');
    const totalSpend = completed.reduce((sum, a) => sum + a.finalPrice, 0);
    const lastAppt = customerAppointments[0];
    const specialist = employees.find(e => e.id === lastAppt.employeeId)?.name || 'N/A';

    return {
      totalSpend,
      completedCount: completed.length,
      lastSpecialist: specialist
    };
  }, [customerAppointments, employees]);

  // Handle open add customer
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setBirthDate('');
    setNotes('');
    setStatus('new');
    setIsFormOpen(true);
  };

  // Handle open edit customer
  const handleOpenEdit = (cust: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCustomer(cust);
    setFirstName(cust.firstName);
    setLastName(cust.lastName);
    setPhone(cust.phone);
    setEmail(cust.email || '');
    setBirthDate(cust.birthDate || '');
    setNotes(cust.notes || '');
    setStatus(cust.status);
    setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone) {
      alert('გთხოვთ შეავსოთ სავალდებულო ველები');
      return;
    }

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
      status: status,
      nextRecommendedDate: editingCustomer?.nextRecommendedDate,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingCustomer) {
      onUpdateCustomer(payload);
      onLogAction('კლიენტის რედაქტირება', `ადმინმა განაახლა კლიენტის ბარათი: ${payload.firstName} ${payload.lastName}`);
    } else {
      onAddCustomer(payload);
      onLogAction('კლიენტის დამატება', `ახალი კლიენტი დარეგისტრირდა: ${payload.firstName} ${payload.lastName} (ტელ: ${payload.phone})`);
    }

    setIsFormOpen(false);
  };

  // Badge stylings
  const getStatusBadge = (status: CustomerStatus) => {
    const base = "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md border";
    switch (status) {
      case 'active':
        return <span className={`${base} bg-green-50 text-green-700 border-green-100`}>აქტიური</span>;
      case 'vip':
        return <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>⭐ VIP</span>;
      case 'new':
        return <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>ახალი</span>;
      case 'passive':
        return <span className={`${base} bg-stone-100 text-stone-500 border-stone-200`}>პასიური</span>;
      case 'problematic':
        return <span className={`${base} bg-red-50 text-red-700 border-red-100`}>⚠️ პრობლემური</span>;
      case 'archived':
        return <span className={`${base} bg-stone-50 text-stone-400 border-stone-100`}>არქივი</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Customers List Section - spans 2 columns on desktop */}
      <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-stone-800 font-display">მომხმარებლების ბაზა ({filteredCustomers.length})</h2>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>კლიენტის დამატება</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 border-b border-stone-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ძებნა სახელით, გვარით ან მობილურით..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-stone-50/30"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-xs rounded-xl py-2 px-3 focus:outline-hidden text-stone-700 font-semibold"
          >
            <option value="all">ყველა სტატუსი</option>
            <option value="active">აქტიური</option>
            <option value="vip">VIP</option>
            <option value="new">ახალი</option>
            <option value="passive">პასიური</option>
            <option value="problematic">პრობლემური</option>
            <option value="archived">არქივში</option>
          </select>
        </div>

        {/* Tabular List */}
        <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-stone-100">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(cust => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className={`p-4 flex items-center justify-between hover:bg-stone-50/50 transition-all cursor-pointer ${selectedCustomerId === cust.id ? 'bg-primary-50/20 border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">
                      {cust.firstName} {cust.lastName}
                    </h3>
                    {getStatusBadge(cust.status)}
                  </div>

                  <p className="text-xs text-stone-500 font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {cust.phone}
                    {cust.birthDate && (
                      <span className="text-stone-300 ml-1">| დაბ: {cust.birthDate}</span>
                    )}
                  </p>
                  
                  {cust.notes && (
                    <p className="text-xs text-stone-400 italic truncate max-w-md">
                      შენიშვნა: "{cust.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {cust.nextRecommendedDate && (
                    <div className="hidden md:flex flex-col items-end text-xs shrink-0 mr-4">
                      <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md text-[10px] border border-purple-100">გეგმიური ლაზერი</span>
                      <span className="text-stone-500 font-mono mt-0.5">{cust.nextRecommendedDate}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => handleOpenEdit(cust, e)}
                    className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-700 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-5 h-5 text-stone-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-stone-400">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-2" />
              <p className="text-sm">მომხმარებლები ვერ მოიძებნა.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl"
              >
                დაამატე ახალი კლიენტი პირდაპირ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Full Detail Card - spans 1 column on desktop */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
        {selectedCustomer ? (
          <div className="flex flex-col h-full">
            {/* Detail Header */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500" />
                კლიენტის ბარათი
              </h3>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 hover:bg-stone-200 text-stone-500 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-800 font-display">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>
                  {getStatusBadge(selectedCustomer.status)}
                </div>

                <div className="space-y-1 text-xs text-stone-600">
                  <p className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    ტელ: {selectedCustomer.phone}
                  </p>
                  {selectedCustomer.email && (
                    <p className="flex items-center gap-1.5 font-mono">
                      <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                      {selectedCustomer.email}
                    </p>
                  )}
                  {selectedCustomer.birthDate && (
                    <p className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                      დაბადების დღე: {selectedCustomer.birthDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 block uppercase">ჯამური დანახარჯი</span>
                  <span className="text-base font-bold text-stone-800 font-mono block mt-0.5">
                    {customerStats.totalSpend} ₾
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 block uppercase">ვიზიტები</span>
                  <span className="text-base font-bold text-stone-800 font-mono block mt-0.5">
                    {customerStats.completedCount} სესია
                  </span>
                </div>
              </div>

              {selectedCustomer.nextRecommendedDate && (
                <div className="bg-purple-50 p-3.5 border border-purple-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                    შემდეგი რეკომენდებული ვიზიტი:
                  </span>
                  <p className="text-sm font-extrabold text-purple-900 font-mono">
                    {selectedCustomer.nextRecommendedDate} (ლაზერი)
                  </p>
                  <p className="text-[10px] text-purple-600">
                    21 დღის ავტომატური გეგმიური შეხსენება
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-[#fcfaf7] border border-stone-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                    შენიშვნა კლიენტზე:
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    "{selectedCustomer.notes}"
                  </p>
                </div>
              )}

              {/* Appointment History Logs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                  <Clock className="w-4 h-4 text-stone-400" />
                  ვიზიტების ისტორია ({customerAppointments.length})
                </h3>

                {customerAppointments.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {customerAppointments.map(appt => {
                      const proc = procedures.find(p => p.id === appt.procedureId);
                      const emp = employees.find(e => e.id === appt.employeeId);
                      
                      return (
                        <div key={appt.id} className="p-2.5 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-800">{proc?.name || 'პროცედურა'}</span>
                            <span className="font-mono text-stone-500 font-medium">{appt.dateTime.split('T')[0]}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-stone-500">
                            <span>სპეციალისტი: {emp?.name}</span>
                            <span className="font-mono text-stone-700 font-bold">{appt.finalPrice} ₾</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className={`px-1.5 py-0.2 rounded-md ${appt.appointmentStatus === 'completed' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                              {appt.appointmentStatus}
                            </span>
                            <span className="text-stone-400 font-mono">ითვალისწინებს ფასდაკლებას: -{appt.discountValue}{appt.discountType === 'percent' ? '%' : '₾'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 text-center py-6">ჩაწერების ისტორია ცარიელია.</p>
                )}
              </div>

              {/* Quick Book directly */}
              <button
                onClick={() => onOpenQuickBook({
                  customerId: selectedCustomer.id,
                  customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
                  phone: selectedCustomer.phone
                })}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>ახალი ვიზიტი ამ კლიენტზე</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-stone-400 h-full flex flex-col justify-center items-center">
            <Heart className="w-10 h-10 text-stone-200 mb-2" />
            <p className="text-sm">კლიენტი არ არის არჩეული.</p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">
              აირჩიეთ კლიენტი სიიდან მისი ისტორიისა და ბარათის სანახავად.
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-stone-100 animate-zoomIn">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-500" />
                {editingCustomer ? 'კლიენტის რედაქტირება' : 'ახალი კლიენტის რეგისტრაცია'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-stone-200 rounded-full text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">სახელი *</label>
                  <input
                    type="text"
                    required
                    placeholder="მაგ: მარიამ"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">გვარი *</label>
                  <input
                    type="text"
                    required
                    placeholder="მაგ: მელიქიძე"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">მობილურის ნომერი *</label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: 599123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ელფოსტა (სურვილისამებრ)</label>
                <input
                  type="email"
                  placeholder="მაგ: mari@glow.ge"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">დაბადების თარიღი</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">კლიენტის სტატუსი</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-semibold text-stone-700"
                  >
                    <option value="active">აქტიური</option>
                    <option value="vip">VIP კლიენტი</option>
                    <option value="new">ახალი</option>
                    <option value="passive">პასიური</option>
                    <option value="problematic">პრობლემური</option>
                    <option value="archived">არქივში</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">შენიშვნები მომხმარებელზე</label>
                <textarea
                  rows={2}
                  placeholder="მაგ: მგრძნობიარე კანი, ალერგია..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                {editingCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      if(confirm("ნამდვილად გსურთ ამ მომხმარებლის არქივში გადაყვანა?")) {
                        onUpdateCustomer({ ...editingCustomer, status: 'archived', updatedAt: new Date().toISOString() });
                        onLogAction('კლიენტის დაარქივება', `კლიენტი ${editingCustomer.firstName} ${editingCustomer.lastName} გადავიდა არქივში`);
                        setIsFormOpen(false);
                      }
                    }}
                    className="mr-auto px-3.5 py-2 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-200 border border-transparent rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    დაარქივება
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
