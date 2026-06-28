import React, { useState } from 'react';
import { Employee, Procedure } from '../types';
import { 
  Users, 
  Plus, 
  Edit, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  Percent, 
  Sparkles,
  ShieldAlert,
  Lock,
  FileText,
  Crown,
  Trash2,
  X
} from 'lucide-react';

interface EmployeesViewProps {
  employees: Employee[];
  procedures: Procedure[];
  currentUser: Employee;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function EmployeesView({
  employees,
  procedures,
  currentUser,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onLogAction
}: EmployeesViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('20:00');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [commissionPercent, setCommissionPercent] = useState<number>(40);
  const [isOwner, setIsOwner] = useState(false);

  // Custom overriding percents: Record<procedureId, percentage>
  const [procedureCommissions, setProcedureCommissions] = useState<Record<string, number>>({});

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setName('');
    setProfession('ლაზეროთერაპევტი');
    setPhone('');
    setEmail('');
    setUsername('');
    setPassword('user123');
    setIsActive(true);
    setWorkingDays([1, 2, 3, 4, 5]); // Mon - Fri default
    setWorkingHoursStart('09:00');
    setWorkingHoursEnd('19:00');
    setSelectedProcedures([]);
    setCommissionPercent(40);
    setIsOwner(false);
    setProcedureCommissions({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setProfession(emp.profession);
    setPhone(emp.phone);
    setEmail(emp.email || '');
    setUsername(emp.username);
    setPassword(emp.password || 'user123');
    setIsActive(emp.isActive);
    setWorkingDays(emp.workingDays);
    setWorkingHoursStart(emp.workingHoursStart);
    setWorkingHoursEnd(emp.workingHoursEnd);
    setSelectedProcedures(emp.procedures);
    setCommissionPercent(emp.commissionPercent);
    setIsOwner(emp.isOwner || false);
    setProcedureCommissions(emp.procedureCommissions || {});
    setIsFormOpen(true);
  };

  const handleDayToggle = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleProcedureToggle = (procId: string) => {
    if (selectedProcedures.includes(procId)) {
      setSelectedProcedures(selectedProcedures.filter(id => id !== procId));
      
      // Clear custom commission if unlinked
      const copy = { ...procedureCommissions };
      delete copy[procId];
      setProcedureCommissions(copy);
    } else {
      setSelectedProcedures([...selectedProcedures, procId]);
    }
  };

  const handleCustomCommissionChange = (procId: string, value: number) => {
    setProcedureCommissions({
      ...procedureCommissions,
      [procId]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !profession || !phone || !username || !password) {
      alert('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
      return;
    }

    const payload: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp_${Date.now()}`,
      name: name.trim(),
      profession: profession.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      username: username.trim().toLowerCase(),
      password: password,
      isActive: isActive,
      role: 'employee', // Manager is role: admin, others are role: employee
      workingDays: workingDays,
      workingHoursStart: workingHoursStart,
      workingHoursEnd: workingHoursEnd,
      procedures: selectedProcedures,
      commissionPercent: Number(commissionPercent),
      procedureCommissions: procedureCommissions,
      isOwner: isOwner,
    };

    // If they name themselves Clin Manager / Admin - they could be admin
    if (payload.id === 'emp_1' || payload.username === 'admin') {
      payload.role = 'admin';
    }

    if (editingEmployee) {
      onUpdateEmployee(payload);
      onLogAction('თანამშრომლის რედაქტირება', `განახლდა სპეციალისტის პროფილი: ${payload.name}`);
    } else {
      onAddEmployee(payload);
      onLogAction('თანამშრომლის დამატება', `სისტემაში დარეგისტრირდა სპეციალისტი: ${payload.name} (${payload.profession})`);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (emp: Employee) => {
    const isClinicAdmin = emp.id === 'emp_1' || emp.username === 'admin';
    if (isClinicAdmin) {
      alert('მთავარი ადმინისტრატორის წაშლა შეუძლებელია.');
      return;
    }
    if (emp.id === currentUser.id) {
      alert('საკუთარი ანგარიშის წაშლა შეუძლებელია.');
      return;
    }
    if (confirm(`ნამდვილად გსურთ თანამშრომლის წაშლა?\n\n${emp.name} (${emp.profession})\n\nეს მოქმედება შეუქცევადია.`)) {
      onDeleteEmployee(emp.id);
      onLogAction('თანამშრომლის წაშლა', `სისტემიდან წაიშალა სპეციალისტი: ${emp.name} (${emp.profession})`);
      if (editingEmployee && editingEmployee.id === emp.id) setIsFormOpen(false);
    }
  };

  const weekdaysGeo = ['კვ', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'];

  // Filter employees visible to current user (employees can only see themselves)
  const visibleEmployees = employees.filter(emp => {
    if (currentUser.role === 'employee') {
      return emp.id === currentUser.id;
    }
    return true; // Admin can see all
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div className="flex items-center justify-between bg-white p-4 border border-stone-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          <div>
            <h2 className="font-bold text-stone-800 font-display">თანამშრომლების მართვა ({visibleEmployees.length})</h2>
            <p className="text-xs text-stone-400">სპეციალისტების განრიგი, როლები და ფინანსური განაკვეთები</p>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>თანამშრომლის დამატება</span>
          </button>
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleEmployees.map(emp => {
          const isClinicAdmin = emp.id === 'emp_1' || emp.username === 'admin';

          return (
            <div
              key={emp.id}
              className={`bg-white border rounded-2xl p-5 shadow-3xs transition-all relative flex flex-col justify-between ${emp.isActive ? 'border-stone-100' : 'border-stone-200 bg-stone-50/60'}`}
            >
              <div>
                {/* Active Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {emp.isActive ? 'აქტიური' : 'არამუშა'}
                  </span>
                  
                  {currentUser.role === 'admin' && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-lg transition-all"
                        title="რედაქტირება"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!isClinicAdmin && emp.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-all"
                          title="წაშლა"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Overview */}
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-800 text-base font-display flex items-center gap-1">
                    {emp.name}
                    {isClinicAdmin && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">ადმინი</span>
                    )}
                    {emp.isOwner && (
                      <span className="text-[9px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> მფლობელი
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-500 font-semibold">{emp.profession}</p>
                </div>

                {/* Contacts */}
                <div className="text-xs text-stone-400 mt-3 space-y-1 font-mono">
                  <p>ტელ: {emp.phone}</p>
                  {emp.email && <p>ელფოსტა: {emp.email}</p>}
                  {currentUser.role === 'admin' && (
                    <p className="text-stone-500 bg-stone-50 p-1 rounded font-sans border border-stone-100/50">
                      🔐 იუზერნეიმი: <strong className="font-mono text-stone-700">{emp.username}</strong>
                    </p>
                  )}
                </div>

                {/* Schedule details */}
                <div className="mt-4 border-t border-stone-50 pt-3 space-y-2.5 text-xs text-stone-600">
                  <p className="flex items-center gap-1.5 font-sans">
                    <Clock className="w-3.5 h-3.5 text-stone-300" />
                    სამუშაო საათები: <span className="font-bold font-mono text-stone-700">{emp.workingHoursStart} - {emp.workingHoursEnd}</span>
                  </p>

                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">სამუშაო დღეები:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                        const isWorking = emp.workingDays.includes(dayNum);
                        return (
                          <span
                            key={dayNum}
                            className={`w-7 h-7 flex items-center justify-center text-[10px] rounded-lg border font-bold ${
                              isWorking 
                                ? 'bg-primary-50 text-primary-700 border-primary-200' 
                                : 'bg-stone-50 text-stone-300 border-stone-100'
                            }`}
                          >
                            {weekdaysGeo[dayNum]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission splits footer */}
              {!isClinicAdmin && (
                <div className="border-t border-stone-50 pt-3 mt-4 space-y-2.5 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold flex items-center gap-1">
                      <Percent className="w-4 h-4 text-primary-500" />
                      ძირითადი პროცენტი:
                    </span>
                    <span className="font-bold font-mono text-stone-800 text-sm">
                      {emp.commissionPercent}%
                    </span>
                  </div>

                  {/* Overriding specific procedure percents */}
                  {emp.procedureCommissions && Object.keys(emp.procedureCommissions).length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase block">სპეციალური განაკვეთები:</span>
                      <div className="divide-y divide-stone-100/50 text-[10px]">
                        {Object.entries(emp.procedureCommissions).map(([procId, percentage]) => {
                          const proc = procedures.find(p => p.id === procId);
                          return (
                            <div key={procId} className="flex justify-between py-1 text-stone-600">
                              <span>{proc?.name || procId}:</span>
                              <span className="font-bold text-primary-700">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Procedures mapped */}
                  <div className="pt-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">ასრულებს სერვისებს:</span>
                    <div className="flex flex-wrap gap-1">
                      {emp.procedures.map(procId => {
                        const proc = procedures.find(p => p.id === procId);
                        return (
                          <span key={procId} className="text-[9px] bg-white border border-stone-200/50 text-stone-600 px-1.5 py-0.5 rounded-md">
                            {proc?.name || 'სერვისი'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADMIN ADD/EDIT EMPLOYEE FORM MODAL */}
      {isFormOpen && currentUser.role === 'admin' && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-stone-100 animate-zoomIn flex flex-col max-h-[90vh]">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                {editingEmployee ? 'პროფილის რედაქტირება' : 'ახალი სპეციალისტის რეგისტრაცია'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-stone-200 rounded-full text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">სახელი და გვარი *</label>
                  <input
                    type="text"
                    required
                    placeholder="მაგ: თამარ მელიქიძე"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">პროფესია/სპეციალობა *</label>
                  <input
                    type="text"
                    required
                    placeholder="მაგ: ლაზეროთერაპევტი"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">მობილურის ნომერი *</label>
                  <input
                    type="text"
                    required
                    placeholder="მაგ: 555 223 344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">ელფოსტა</label>
                  <input
                    type="email"
                    placeholder="მაგ: tamar@glow.ge"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Login credentials */}
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-3">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Lock className="w-4 h-4 text-stone-400" />
                  ავტორიზაციის მონაცემები (სისტემაში შესასვლელად)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">იუზერნეიმი *</label>
                    <input
                      type="text"
                      required
                      placeholder="Username (მაგ: tamar)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">პაროლი *</label>
                    <input
                      type="text"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days scheduler */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">სამუშაო დღეები</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                    const isSelected = workingDays.includes(dayNum);
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleDayToggle(dayNum)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-primary-600 text-white border-primary-600 shadow-3xs' 
                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {weekdaysGeo[dayNum]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">მუშაობის დასაწყისი *</label>
                  <input
                    type="time"
                    required
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">მუშაობის დასასრული *</label>
                  <input
                    type="time"
                    required
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Owner toggle — salon owner gets the remaining (non-employee) share */}
              <label className="flex items-start gap-3 bg-yellow-50/60 border border-yellow-200/60 p-3.5 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-yellow-600 cursor-pointer"
                />
                <span className="text-xs text-stone-700">
                  <span className="font-bold flex items-center gap-1 text-yellow-800">
                    <Crown className="w-3.5 h-3.5" /> სალონის მფლობელი
                  </span>
                  <span className="text-stone-500 block mt-0.5">
                    მფლობელს ავტომატურად ერიცხება ყოველი ვიზიტის თანხის ის ნაწილი, რომელიც თანამშრომლის პროცენტის შემდეგ რჩება.
                  </span>
                </span>
              </label>

              {/* Default split percentage */}
              <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    ძირითადი პროცენტული წილი სერვისებიდან (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 border border-stone-200 rounded-xl text-sm text-center font-mono focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                    />
                    <span className="text-xs text-stone-400">
                      ეს პროცენტი გავრცელდება ყველა პროცედურაზე, სადაც არ არის სპეციალური განაკვეთი.
                    </span>
                  </div>
                </div>

                {/* Overrides of percentage */}
                {selectedProcedures.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-stone-200/50">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">სპეციალური პროცენტული განაკვეთის მინიჭება:</span>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto">
                      {selectedProcedures.map(procId => {
                        const proc = procedures.find(p => p.id === procId);
                        return (
                          <div key={procId} className="flex items-center justify-between text-xs py-1">
                            <span>{proc?.name || 'სერვისი'}:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                placeholder={`${commissionPercent}`}
                                value={procedureCommissions[procId] || ''}
                                onChange={(e) => handleCustomCommissionChange(procId, Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-stone-200 rounded-lg text-center font-mono text-xs"
                              />
                              <span className="text-stone-400 font-mono">%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Procedures Checkbox list */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ასრულებს შემდეგ პროცედურებს</label>
                <div className="grid grid-cols-2 gap-2 border border-stone-100 p-3 rounded-xl max-h-[150px] overflow-y-auto bg-stone-50/50">
                  {procedures.filter(p => p.isActive).map(proc => {
                    const isChecked = selectedProcedures.includes(proc.id);
                    return (
                      <label key={proc.id} className="flex items-start gap-2 text-xs text-stone-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleProcedureToggle(proc.id)}
                          className="mt-0.5 rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                        />
                        <span>{proc.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-stone-600">ანგარიში აქტიურია და მუშაობს</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
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
