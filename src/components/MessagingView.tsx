import React, { useState, useMemo } from 'react';
import { Customer, Appointment, Employee, MessageLog, MessageTemplate } from '../types';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Smartphone, 
  Sparkles, 
  Plus, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Edit2, 
  Trash2,
  X 
} from 'lucide-react';

interface MessagingViewProps {
  messageLogs: MessageLog[];
  customers: Customer[];
  appointments: Appointment[];
  employees: Employee[];
  templates: MessageTemplate[];
  onAddMessageLog: (log: MessageLog) => void;
  onAddTemplate: (tpl: MessageTemplate) => void;
  onUpdateTemplate: (tpl: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function MessagingView({
  messageLogs,
  customers,
  appointments,
  employees,
  templates,
  onAddMessageLog,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onLogAction
}: MessagingViewProps) {
  // Navigation
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New Message Composer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');
  const [messageBody, setMessageBody] = useState<string>('');

  // Add Template state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');

  // Get active selected customer profile
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Quick select dynamic replacements
  const replacePlaceholders = (text: string, cust?: Customer) => {
    if (!cust) return text;
    
    // Find closest booking for this customer to fetch time/procedure details
    const custAppts = appointments.filter(a => a.customerId === cust.id);
    const lastAppt = custAppts[0]; // assuming sorted or closest

    let result = text
      .replace(/{სახელი}/g, cust.firstName)
      .replace(/{გვარი}/g, cust.lastName)
      .replace(/{მობილური}/g, cust.phone);

    if (lastAppt) {
      const [d, t] = lastAppt.dateTime.split('T');
      result = result
        .replace(/{თარიღი}/g, d)
        .replace(/{საათი}/g, t?.substring(0, 5) || '12:00')
        .replace(/{პროცედურა}/g, lastAppt.customerName); // fallback or procedure name
    } else {
      result = result
        .replace(/{თარიღი}/g, '2026-06-29')
        .replace(/{საათი}/g, '14:00')
        .replace(/{პროცედურა}/g, 'ლაზერული ეპილაცია');
    }
    
    return result;
  };

  // When customer selection changes, auto prefill phone / email details
  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setCustomPhone(cust.phone);
      setCustomEmail(cust.email || '');
      
      // If a template is already selected, re-generate text
      if (selectedTemplateId !== 'custom') {
        const tpl = templates.find(t => t.id === selectedTemplateId);
        if (tpl) {
          setMessageBody(replacePlaceholders(tpl.body, cust));
        }
      }
    } else {
      setCustomPhone('');
      setCustomEmail('');
    }
  };

  // When template selection changes
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    if (id === 'custom') {
      setMessageBody('');
    } else {
      const tpl = templates.find(t => t.id === id);
      if (tpl) {
        setMessageBody(replacePlaceholders(tpl.body, selectedCustomer));
      }
    }
  };

  // Dispatch simulated message (with logging)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customPhone && selectedChannel !== 'email') {
      alert('გთხოვთ მიუთითოთ მობილურის ნომერი');
      return;
    }
    if (!messageBody) {
      alert('შეტყობინების ტექსტი ცარიელია');
      return;
    }

    const matchedCust = customers.find(c => c.id === selectedCustomerId);
    const recipientName = matchedCust ? `${matchedCust.firstName} ${matchedCust.lastName}` : 'ხელით შეყვანილი კლიენტი';

    // Form simulated message log
    const statuses: MessageLog['status'][] = ['sent', 'delivered', 'read'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const newLog: MessageLog = {
      id: `msg_${Date.now()}`,
      customerId: selectedCustomerId || 'manual',
      customerName: recipientName,
      channel: selectedChannel,
      templateName: selectedTemplateId === 'custom' ? 'ინდივიდუალური' : templates.find(t => t.id === selectedTemplateId)?.name || 'შაბლონი',
      content: messageBody,
      sentAt: new Date().toISOString(),
      status: randomStatus
    };

    onAddMessageLog(newLog);
    onLogAction('შეტყობინების გაგზავნა', `გაიგზავნა ${selectedChannel.toUpperCase()} კლიენტთან: ${recipientName} (${selectedChannel === 'email' ? customEmail : customPhone})`);
    
    // Clear Composer Form
    setSelectedCustomerId('');
    setCustomPhone('');
    setCustomEmail('');
    setSelectedTemplateId('custom');
    setMessageBody('');

    alert('შეტყობინება წარმატებით გაიგზავნა და აისახა ისტორიაში!');
  };

  // Template CRUD Handlers
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplSubject('ვიზიტის დადასტურება');
    setTplBody('მოგესალმებით {სახელი}, შეგახსენებთ რომ თქვენ ჩაწერილი ხართ პროცედურაზე...');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: MessageTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(tpl);
    setTplName(tpl.name);
    setTplSubject(tpl.subject || '');
    setTplBody(tpl.body);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName || !tplBody) {
      alert('შეავსეთ სავალდებულო ველები');
      return;
    }

    const payload: MessageTemplate = {
      id: editingTemplate ? editingTemplate.id : `tpl_${Date.now()}`,
      name: tplName,
      subject: tplSubject || undefined,
      body: tplBody,
      isActive: true,
      description: editingTemplate ? editingTemplate.description : 'მომხმარებლის მიერ შექმნილი შაბლონი'
    };

    if (editingTemplate) {
      onUpdateTemplate(payload);
      onLogAction('შაბლონის რედაქტირება', `ადმინისტრატორმა განაახლა შეტყობინების შაბლონი: ${payload.name}`);
    } else {
      onAddTemplate(payload);
      onLogAction('შაბლონის დამატება', `სისტემას დაემატა შეტყობინების ახალი შაბლონი: ${payload.name}`);
    }

    setIsTemplateModalOpen(false);
  };

  // Filter messages history log
  const filteredMessageLogs = useMemo(() => {
    return messageLogs.filter(log => {
      if (filterChannel !== 'all' && log.channel !== filterChannel) return false;
      if (filterStatus !== 'all' && log.status !== filterStatus) return false;
      return true;
    }).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }, [messageLogs, filterChannel, filterStatus]);

  const getChannelIcon = (channel: MessageLog['channel']) => {
    switch (channel) {
      case 'sms': return <Smartphone className="w-4 h-4 text-amber-500" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: MessageLog['status']) => {
    const base = "px-1.5 py-0.2 rounded text-[10px] font-bold";
    switch (status) {
      case 'read': return <span className={`${base} bg-green-50 text-green-700`}>წაკითხულია</span>;
      case 'delivered': return <span className={`${base} bg-blue-50 text-blue-700`}>მიღებულია</span>;
      case 'sent': return <span className={`${base} bg-amber-50 text-amber-700`}>გაგზავნილია</span>;
      case 'failed': return <span className={`${base} bg-red-50 text-red-700`}>შეცდომა</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* 1. LEFT PANEL: COMPOSER & TEMPLATE MANAGEMENT (spans 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Composer Form card */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 font-display flex items-center gap-1.5 text-sm">
              <Send className="w-4 h-4 text-primary-500 animate-pulse" />
              ახალი შეტყობინების გაგზავნა
            </h3>
          </div>

          <form onSubmit={handleSendMessage} className="p-5 space-y-4">
            {/* Customer Dropdown search */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                აირჩიეთ კლიენტი ბაზიდან
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden text-stone-700 font-semibold"
              >
                <option value="">-- აირჩიეთ კლიენტი (ან ხელით შეიყვანეთ ქვემოთ) --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.phone})</option>
                ))}
              </select>
            </div>

            {/* Target Channel */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">გაგზავნის არხი</label>
              <div className="grid grid-cols-3 gap-2">
                {(['whatsapp', 'sms', 'email'] as const).map(channel => {
                  const isSelected = selectedChannel === channel;
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setSelectedChannel(channel)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected 
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs' 
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {getChannelIcon(channel)}
                      <span>{channel.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Fields if not selected */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ტელეფონის ნომერი</label>
                <input
                  type="text"
                  placeholder="599123456"
                  disabled={selectedCustomerId !== ''}
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ელფოსტა</label>
                <input
                  type="email"
                  placeholder="mail@client.ge"
                  disabled={selectedCustomerId !== '' || selectedChannel !== 'email'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono disabled:bg-stone-50"
                />
              </div>
            </div>

            {/* Templates Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                აირჩიეთ შეტყობინების შაბლონი
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
              >
                <option value="custom">-- ინდივიდუალური ტექსტი (შაბლონის გარეშე) --</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
            </div>

            {/* Message Text area */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-stone-600">შეტყობინების ტექსტი *</label>
                <span className="text-[10px] text-stone-400 font-mono">სიმბოლოები: {messageBody.length}</span>
              </div>
              <textarea
                rows={5}
                required
                placeholder="ჩაწერეთ ტექსტი..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="text-[9px] text-stone-400 mt-0.5">
                შეგიძლიათ გამოიყენოთ დინამიური ცვლადები: <code className="bg-stone-50 p-0.5 rounded font-bold font-mono text-stone-700">{`{სახელი}`}</code>, <code className="bg-stone-50 p-0.5 rounded font-bold font-mono text-stone-700">{`{პროცედურა}`}</code>, <code className="bg-stone-50 p-0.5 rounded font-bold font-mono text-stone-700">{`{თარიღი}`}</code>, <code className="bg-stone-50 p-0.5 rounded font-bold font-mono text-stone-700">{`{საათი}`}</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>გაგზავნა</span>
            </button>
          </form>
        </div>

        {/* Templates Directory Management List */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-xs p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-stone-50 pb-2">
            <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-400" />
              შაბლონების ბაზა ({templates.length})
            </span>
            <button
              onClick={handleOpenAddTemplate}
              className="p-1 hover:bg-stone-100 rounded text-primary-600"
              title="ახალი შაბლონის დამატება"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplateId(tpl.id);
                  handleTemplateChange(tpl.id);
                }}
                className="p-2 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all text-xs cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <h4 className="font-bold text-stone-800">{tpl.name}</h4>
                  <p className="text-[10px] text-stone-400 truncate max-w-[200px]">{tpl.body}</p>
                </div>
                
                <button
                  onClick={(e) => handleOpenEditTemplate(tpl, e)}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT PANEL: MESSAGE DISPATCH LOG HISTORY (spans 7 cols) */}
      <div className="lg:col-span-7 bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Logs Toolbar Header */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="font-bold text-stone-800 font-display text-sm flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-primary-500" />
            გაგზავნილი შეტყობინებების ისტორია
          </span>

          {/* Quick logs filters */}
          <div className="flex gap-1.5 text-[10px] font-bold">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg p-1 text-stone-600"
            >
              <option value="all">ყველა არხი</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg p-1 text-stone-600"
            >
              <option value="all">ყველა სტატუსი</option>
              <option value="read">წაკითხული</option>
              <option value="delivered">მიღებული</option>
              <option value="sent">გაგზავნილი</option>
              <option value="failed">შეცდომა</option>
            </select>
          </div>
        </div>

        {/* Message Logs timeline */}
        <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-3.5 divide-y divide-stone-50">
          {filteredMessageLogs.length > 0 ? (
            filteredMessageLogs.map((log, idx) => (
              <div key={log.id} className={`pt-3.5 ${idx === 0 ? 'pt-0' : ''} space-y-1 text-xs`}>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(log.channel)}
                    <span className="font-bold text-stone-800 text-sm">
                      {log.customerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400">
                    <span>{log.sentAt.replace('T', ' ').substring(0, 16)}</span>
                    {getStatusBadge(log.status)}
                  </div>
                </div>

                <div className="bg-stone-50/50 p-2.5 rounded-xl border border-stone-100/50 text-stone-600 leading-relaxed font-sans text-xs italic">
                  "{log.content}"
                </div>

                <div className="flex justify-between items-center text-[10px] text-stone-400">
                  <span>შაბლონი: <strong>{log.templateName}</strong></span>
                  
                  {/* Resend button */}
                  <button
                    onClick={() => {
                      setSelectedCustomerId(log.customerId);
                      setSelectedChannel(log.channel);
                      setMessageBody(log.content);
                      alert('მონაცემები ჩაიტვირთა გამგზავნის პანელში!');
                    }}
                    className="text-primary-600 hover:underline font-bold"
                  >
                    ხელახლა გაგზავნა
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-stone-400">
              <MessageSquare className="w-12 h-12 mx-auto text-stone-200 mb-2" />
              <p className="text-sm">შეტყობინებების ლოგი ცარიელია.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT TEMPLATE MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-stone-100 animate-zoomIn">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800 font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                {editingTemplate ? 'შაბლონის რედაქტირება' : 'ახალი შაბლონის დამატება'}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 hover:bg-stone-200 rounded-full text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">შაბლონის დასახელება *</label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: ლაზერის შეხსენება (21 დღე)"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">სათაური / თემატიკა</label>
                <input
                  type="text"
                  placeholder="მაგ: ვიზიტის დადასტურება"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">შეტყობინების სრული ტექსტი *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="მოგესალმებით {სახელი}..."
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2"
                />
                <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                  ავტომატური ჩანაცვლებისთვის გამოიყენეთ ფრჩხილები: <br />
                  <code className="bg-stone-100 px-1 py-0.2 rounded font-bold font-mono text-stone-700">{`{სახელი}`}</code>, 
                  <code className="bg-stone-100 px-1 py-0.2 rounded font-bold font-mono text-stone-700">{`{პროცედურა}`}</code>, 
                  <code className="bg-stone-100 px-1 py-0.2 rounded font-bold font-mono text-stone-700">{`{თარიღი}`}</code>, 
                  <code className="bg-stone-100 px-1 py-0.2 rounded font-bold font-mono text-stone-700">{`{საათი}`}</code>
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      if(confirm("ნამდვილად გსურთ ამ შაბლონის წაშლა?")) {
                        onDeleteTemplate(editingTemplate.id);
                        onLogAction('შაბლონის წაშლა', `წაიშალა შაბლონი: "${editingTemplate.name}"`);
                        setIsTemplateModalOpen(false);
                      }
                    }}
                    className="mr-auto px-3.5 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold border border-transparent transition-all cursor-pointer"
                  >
                    წაშლა
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
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
