import React, { useState } from 'react';
import { Procedure, Employee } from '../types';
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Scissors, 
  Activity, 
  Eye, 
  EyeOff, 
  RefreshCcw,
  X 
} from 'lucide-react';

interface ProceduresViewProps {
  procedures: Procedure[];
  employees: Employee[];
  currentUser: Employee;
  onAddProcedure: (proc: Procedure) => void;
  onUpdateProcedure: (proc: Procedure) => void;
  onDeleteProcedure: (id: string) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function ProceduresView({
  procedures,
  employees,
  currentUser,
  onAddProcedure,
  onUpdateProcedure,
  onDeleteProcedure,
  onLogAction
}: ProceduresViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [isActive, setIsActive] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<number>(21);

  const handleOpenAdd = () => {
    setEditingProcedure(null);
    setName('');
    setCategory('კოსმეტოლოგია');
    setDescription('');
    setPrice(100);
    setMinPrice(80);
    setDuration(30);
    setIsActive(true);
    setIsRecurring(false);
    setRecurrenceDays(21);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proc: Procedure) => {
    setEditingProcedure(proc);
    setName(proc.name);
    setCategory(proc.category);
    setDescription(proc.description || '');
    setPrice(proc.price);
    setMinPrice(proc.minPrice || proc.price);
    setDuration(proc.duration);
    setIsActive(proc.isActive);
    setIsRecurring(proc.isRecurring);
    setRecurrenceDays(proc.recurrenceDays || 21);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ვალიდაცია მოხსნილია — ვერცერთი ველი არ არის სავალდებულო; ცარიელ ველებს ენიჭება ნაგულისხმევი მნიშვნელობა.
    const payload: Procedure = {
      id: editingProcedure ? editingProcedure.id : `proc_${Date.now()}`,
      name: name.trim() || 'უსახელო პროცედურა',
      category: category.trim() || 'ზოგადი',
      description: description.trim() || undefined,
      price: Number(price) || 0,
      minPrice: minPrice ? Number(minPrice) : undefined,
      duration: Number(duration) || 0,
      isActive: isActive,
      isRecurring: isRecurring,
      recurrenceDays: isRecurring ? Number(recurrenceDays) : undefined,
    };

    if (editingProcedure) {
      onUpdateProcedure(payload);
      onLogAction('პროცედურის განახლება', `განახლდა პროცედურის მონაცემები: ${payload.name}`);
    } else {
      onAddProcedure(payload);
      onLogAction('პროცედურის დამატება', `დაემატა ახალი პროცედურა: ${payload.name} (ფასი: ${payload.price} ₾)`);
    }

    setIsFormOpen(false);
  };

  const handleToggleActive = (proc: Procedure, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...proc, isActive: !proc.isActive };
    onUpdateProcedure(updated);
    onLogAction('პროცედურის სტატუსის შეცვლა', `პროცედურა: "${proc.name}" სტატუსი გახდა: ${updated.isActive ? 'აქტიური' : 'დამალული'}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-stone-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary-500" />
          <div>
            <h2 className="font-bold text-stone-800 font-display">პროცედურების მართვა ({procedures.length})</h2>
            <p className="text-xs text-stone-400">ესთეტიკური ცენტრის სერვისების სია და ფასები</p>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>სერვისის დამატება</span>
          </button>
        )}
      </div>

      {/* Procedures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {procedures.map(proc => {
          // Find specialists who perform this procedure
          const specialists = employees.filter(emp => emp.procedures.includes(proc.id) && emp.id !== 'emp_1');

          return (
            <div
              key={proc.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-3xs transition-all relative ${proc.isActive ? 'border-stone-100 hover:border-primary-200' : 'border-stone-200 bg-stone-50/50'}`}
            >
              {/* Category tag */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-primary-600 bg-primary-100/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {proc.category}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => handleToggleActive(proc, e)}
                    className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-lg transition-all"
                    title={proc.isActive ? "დამალვა" : "გამოჩენა"}
                  >
                    {proc.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-500" />}
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => handleOpenEdit(proc)}
                      className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-lg transition-all"
                      title="რედაქტირება"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 mb-4 flex-1">
                <h3 className="font-bold text-stone-800 text-base font-display">
                  {proc.name}
                </h3>
                {proc.description && (
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {proc.description}
                  </p>
                )}
              </div>

              {/* Specs & Pricing footer */}
              <div className="border-t border-stone-50 pt-3 mt-auto space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-stone-300" />
                    {proc.duration} წუთი
                  </span>
                  
                  <span className="text-stone-800 font-extrabold font-mono text-base">
                    {proc.price} ₾
                  </span>
                </div>

                {proc.minPrice && (
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>დასაშვები მინიმალური ფასი:</span>
                    <span className="font-bold font-mono text-stone-600">{proc.minPrice} ₾</span>
                  </div>
                )}

                {proc.isRecurring && (
                  <div className="bg-purple-50/50 p-2 border border-purple-100/30 rounded-xl flex items-center justify-between text-[10px] text-purple-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <RefreshCcw className="w-3.5 h-3.5" />
                      განმეორებითი ვიზიტი:
                    </span>
                    <span className="font-bold font-mono">{proc.recurrenceDays} დღეში</span>
                  </div>
                )}

                {/* Staff performed by */}
                <div className="pt-2">
                  <span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">სპეციალისტები:</span>
                  <div className="flex flex-wrap gap-1">
                    {specialists.length > 0 ? (
                      specialists.map(sp => (
                        <span key={sp.id} className="text-[9px] font-semibold bg-stone-50 text-stone-600 px-2 py-0.5 rounded-md border border-stone-100">
                          {sp.name.split(' ')[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-stone-400 italic">არ არის მიბმული</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-stone-100 animate-zoomIn">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary-500" />
                {editingProcedure ? 'პროცედურის რედაქტირება' : 'ახალი პროცედურის დამატება'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-stone-200 rounded-full text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">პროცედურის დასახელება</label>
                <input
                  type="text"
                  placeholder="მაგ: ლაზერული ეპილაცია"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">კატეგორია</label>
                  <input
                    type="text"
                    placeholder="მაგ: ეპილაცია"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">ხანგრძლივობა (წუთებში)</label>
                  <input
                    type="number"
                    min={0}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">სტანდარტული ფასი</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">მინიმალური ფასი (სურვილისამებრ)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Recurrence automatic setup */}
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">საჭიროებს რეკომენდებულ განმეორებით ვიზიტს?</span>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                </div>
                
                {isRecurring && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">რეკომენდებული პერიოდულობა დღეებში:</span>
                    <input
                      type="number"
                      min={1}
                      value={recurrenceDays}
                      onChange={(e) => setRecurrenceDays(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">სერვისის აღწერა</label>
                <textarea
                  rows={2}
                  placeholder="სერვისის დეტალები..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-stone-600">აქტიურია (ხელმისაწვდომია ჩასაწერად)</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                {editingProcedure && (
                  <button
                    type="button"
                    onClick={() => {
                      if(confirm("ნამდვილად გსურთ ამ პროცედურის წაშლა?")) {
                        onDeleteProcedure(editingProcedure.id);
                        onLogAction('პროცედურის წაშლა', `წაიშალა პროცედურა: "${editingProcedure.name}"`);
                        setIsFormOpen(false);
                      }
                    }}
                    className="mr-auto px-3.5 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer"
                  >
                    წაშლა
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
