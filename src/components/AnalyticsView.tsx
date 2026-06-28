import React, { useState, useMemo } from 'react';
import { Appointment, Customer, Employee, Procedure, PaymentStatus, PaymentMethod } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity, 
  Sparkles, 
  Calendar, 
  Filter, 
  User, 
  Scissors,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface AnalyticsViewProps {
  appointments: Appointment[];
  customers: Customer[];
  procedures: Procedure[];
  employees: Employee[];
  currentUser: Employee;
}

export default function AnalyticsView({
  appointments,
  customers,
  procedures,
  employees,
  currentUser
}: AnalyticsViewProps) {
  // Preset filters
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [filterProcedureId, setFilterProcedureId] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  const todayStr = "2026-06-28";
  
  // Format GEL Currency helper
  const fmtGEL = (amount: number) => `${amount.toLocaleString()} ₾`;

  // Calculate Date bounds based on preset
  const dateBounds = useMemo(() => {
    const today = new Date("2026-06-28T12:00:00");
    let start = new Date("2026-01-01T00:00:00"); // default to start of year
    
    if (dateRange === 'day') {
      start = new Date("2026-06-28T00:00:00");
    } else if (dateRange === 'week') {
      start = new Date(today);
      start.setDate(today.getDate() - 7);
    } else if (dateRange === 'month') {
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
    } else if (dateRange === 'year') {
      start = new Date("2026-01-01T00:00:00");
    } else {
      start = new Date("2025-01-01T00:00:00"); // all time
    }
    return { start, end: today };
  }, [dateRange]);

  // Filtered Appointments based on ALL criteria
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.dateTime);
      
      // 1. Date Range Filter
      if (dateRange !== 'all') {
        if (apptDate < dateBounds.start) return false;
      }

      // 2. Employee filter (if specialist is logged, they can ONLY see their own files)
      if (currentUser.role === 'employee') {
        if (appt.employeeId !== currentUser.id) return false;
      } else if (filterEmployeeId !== 'all' && appt.employeeId !== filterEmployeeId) {
        return false;
      }

      // 3. Procedure Filter
      if (filterProcedureId !== 'all' && appt.procedureId !== filterProcedureId) return false;

      // 4. Payment status
      if (filterPaymentStatus !== 'all' && appt.paymentStatus !== filterPaymentStatus) return false;

      // 5. Payment method
      if (filterPaymentMethod !== 'all' && appt.paymentMethod !== filterPaymentMethod) return false;

      return true;
    });
  }, [appointments, dateRange, dateBounds, filterEmployeeId, filterProcedureId, filterPaymentStatus, filterPaymentMethod, currentUser]);

  // General Top KPI calculations
  const kpis = useMemo(() => {
    const completed = filteredAppointments.filter(a => a.appointmentStatus === 'completed');
    
    const totalRev = completed.reduce((sum, a) => sum + a.finalPrice, 0);
    const totalDiscounts = completed.reduce((sum, a) => {
      if (a.discountType === 'none') return sum;
      if (a.discountType === 'amount') return sum + a.discountValue;
      // standard percentage discount calculation
      return sum + Math.round((a.price * a.discountValue) / 100);
    }, 0);

    // Dues (money outstanding)
    const activeUncompleted = filteredAppointments.filter(a => a.appointmentStatus !== 'cancelled' && a.appointmentStatus !== 'completed');
    const unpaidDues = activeUncompleted.reduce((sum, a) => sum + (a.finalPrice - a.paidAmount), 0);
    // partially completed dues
    const partialDues = completed.filter(a => a.paymentStatus === 'partial').reduce((sum, a) => sum + (a.finalPrice - a.paidAmount), 0);
    
    // Potential loss from cancelled
    const cancelled = filteredAppointments.filter(a => a.appointmentStatus === 'cancelled');
    const cancelledLoss = cancelled.reduce((sum, a) => sum + a.finalPrice, 0);

    return {
      totalRev,
      totalDiscounts,
      outstandingDues: unpaidDues + partialDues,
      cancelledLoss,
      sessionsCount: completed.length
    };
  }, [filteredAppointments]);

  // Cumulative client growth stats
  const clientStats = useMemo(() => {
    const registeredCount = customers.length;
    // Calculate new customers in filtered range
    const newInPeriod = customers.filter(c => {
      const created = new Date(c.createdAt);
      if (dateRange !== 'all') {
        return created >= dateBounds.start;
      }
      return true;
    }).length;

    return { registeredCount, newInPeriod };
  }, [customers, dateRange, dateBounds]);

  // Breakdowns: 1. MONTH-BY-MONTH REVENUE
  const monthlyData = useMemo(() => {
    const monthsGeo = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ];
    
    // Group completed appointments by month index of 2026
    const monthlySummary: Record<number, { monthName: string, revenue: number, count: number }> = {};
    for (let i = 0; i < 12; i++) {
      monthlySummary[i] = { monthName: monthsGeo[i], revenue: 0, count: 0 };
    }

    appointments
      .filter(a => a.appointmentStatus === 'completed' && a.dateTime.startsWith('2026'))
      .forEach(appt => {
        const monthIdx = new Date(appt.dateTime).getMonth();
        monthlySummary[monthIdx].revenue += appt.finalPrice;
        monthlySummary[monthIdx].count += 1;
      });

    const list = Object.values(monthlySummary);
    
    // Add MoM change percentage
    return list.map((m, idx) => {
      let changePercent = 0;
      if (idx > 0 && list[idx - 1].revenue > 0) {
        changePercent = Math.round(((m.revenue - list[idx - 1].revenue) / list[idx - 1].revenue) * 100);
      }
      return {
        ...m,
        MoMChange: changePercent
      };
    });
  }, [appointments]);

  // Breakdowns: 2. BY PROCEDURE PERFORMANCE
  const procedureSummaryList = useMemo(() => {
    const summary: Record<string, { id: string, name: string, category: string, count: number, revenue: number }> = {};
    
    procedures.forEach(p => {
      summary[p.id] = { id: p.id, name: p.name, category: p.category, count: 0, revenue: 0 };
    });

    // Populate from completed appointments
    filteredAppointments
      .filter(a => a.appointmentStatus === 'completed')
      .forEach(appt => {
        if (!summary[appt.procedureId]) {
          summary[appt.procedureId] = { id: appt.procedureId, name: appt.customerName, category: 'სხვა', count: 0, revenue: 0 };
        }
        summary[appt.procedureId].count += 1;
        summary[appt.procedureId].revenue += appt.finalPrice;
      });

    return Object.values(summary).sort((a, b) => b.revenue - a.revenue);
  }, [procedures, filteredAppointments]);

  // Breakdowns: 3. BY EMPLOYEE (SALARIES & SPLITS)
  const employeeEarningsList = useMemo(() => {
    return employees
      .filter(emp => emp.id !== 'emp_1') // skip admin
      .map(emp => {
        // Find completed appointments assigned to this employee
        const empAppts = filteredAppointments.filter(a => a.appointmentStatus === 'completed' && a.employeeId === emp.id);
        const totalRevenueGenerated = empAppts.reduce((sum, a) => sum + a.finalPrice, 0);
        
        // Calculate splits based on custom overrides or default percentage
        let totalEmployeeShare = 0;
        empAppts.forEach(appt => {
          const customPercent = emp.procedureCommissions?.[appt.procedureId];
          const actualPercent = customPercent !== undefined ? customPercent : emp.commissionPercent;
          
          const share = Math.round((appt.finalPrice * actualPercent) / 100);
          totalEmployeeShare += share;
        });

        const totalCenterShare = totalRevenueGenerated - totalEmployeeShare;

        return {
          id: emp.id,
          name: emp.name,
          profession: emp.profession,
          sessionCount: empAppts.length,
          revenue: totalRevenueGenerated,
          employeeShare: totalEmployeeShare,
          centerShare: totalCenterShare,
          averageRate: empAppts.length > 0 ? Math.round((totalEmployeeShare / totalRevenueGenerated) * 100) : emp.commissionPercent
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [employees, filteredAppointments]);

  // Split distribution charts (Center vs Employees total share)
  const splitPieData = useMemo(() => {
    const totalEmpShare = employeeEarningsList.reduce((sum, e) => sum + e.employeeShare, 0);
    const totalCenterShare = employeeEarningsList.reduce((sum, e) => sum + e.centerShare, 0);
    
    return [
      { name: 'თანამშრომლების წილი', value: totalEmpShare },
      { name: 'კლინიკის წმინდა წილი', value: totalCenterShare }
    ];
  }, [employeeEarningsList]);

  const COLORS = ['#b97a7a', '#2a2827', '#eddcdc', '#3b82f6'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Analytics Date Selector Toolbar */}
      <div className="bg-white p-4 border border-stone-100 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-stone-800 text-base font-display">ფინანსური ანგარიშები და ანალიტიკა</h2>
          <p className="text-xs text-stone-400">საერთო შემოსავლები, ფასდაკლებები და სახელფასო უწყისი</p>
        </div>

        {/* Range Buttons */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setDateRange('day')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${dateRange === 'day' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            დღეს
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${dateRange === 'week' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            კვირა
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${dateRange === 'month' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            თვე
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${dateRange === 'year' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            წელი
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${dateRange === 'all' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
          >
            სრული დრო
          </button>
        </div>
      </div>

      {/* Advanced Filter drawer */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-4 border border-stone-100 rounded-2xl flex flex-wrap gap-4 text-xs shadow-xs items-center">
          <span className="font-bold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-primary-500" />
            გაფართოებული ფილტრები:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">სპეციალისტი:</span>
            <select
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 font-semibold text-stone-700"
            >
              <option value="all">ყველა</option>
              {employees.filter(emp => emp.id !== 'emp_1').map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">პროცედურა:</span>
            <select
              value={filterProcedureId}
              onChange={(e) => setFilterProcedureId(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 font-semibold text-stone-700"
            >
              <option value="all">ყველა</option>
              {procedures.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">გადახდის სტატუსი:</span>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 font-semibold text-stone-700"
            >
              <option value="all">ყველა</option>
              <option value="paid">გადახდილი</option>
              <option value="partial">ნაწილობრივ</option>
              <option value="unpaid">გადასახდელი</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">გადახდის ტიპი:</span>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 font-semibold text-stone-700"
            >
              <option value="all">ყველა</option>
              <option value="cash">ნაღდი</option>
              <option value="card">ბარათი</option>
              <option value="transfer">გადმორიცხვა</option>
            </select>
          </div>
        </div>
      )}

      {/* KPI Stats widgets row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-stone-100 rounded-2xl">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">ჯამური შემოსავალი</span>
          <h4 className="text-xl font-bold text-stone-800 font-display mt-1">{fmtGEL(kpis.totalRev)}</h4>
          <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            შესრულებული: {kpis.sessionsCount} სესია
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">გაკეთებული ფასდაკლებები</span>
          <h4 className="text-xl font-bold text-stone-800 font-display mt-1">{fmtGEL(kpis.totalDiscounts)}</h4>
          <span className="text-[10px] text-stone-400">მომხმარებელთა წასახალისებლად</span>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">მისაღები დავალიანება</span>
          <h4 className="text-xl font-bold text-red-600 font-display mt-1">{fmtGEL(kpis.outstandingDues)}</h4>
          <span className="text-[10px] text-stone-400">ნაწილობრივი ან გადაუხდელი</span>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">გაუქმებული ზარალი</span>
          <h4 className="text-xl font-bold text-stone-500 font-display mt-1 font-mono">{fmtGEL(kpis.cancelledLoss)}</h4>
          <span className="text-[10px] text-stone-400">გაუქმებული ვიზიტების გამო</span>
        </div>

        <div className="bg-white p-4 border border-stone-100 rounded-2xl col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">კლიენტების ზრდა</span>
          <h4 className="text-xl font-bold text-stone-800 font-display mt-1">+{clientStats.newInPeriod} ახალი</h4>
          <span className="text-[10px] text-stone-500 font-medium">სულ რეგისტრირებული: {clientStats.registeredCount}</span>
        </div>
      </div>

      {/* Charts section */}
      {currentUser.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly line/bar chart */}
          <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-5 shadow-3xs space-y-4">
            <h3 className="font-bold text-stone-800 font-display text-sm">2026 წლის ყოველთვიური შემოსავლების დინამიკა (ლარი)</h3>
            
            <div className="h-64 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} ₾`, 'შემოსავალი']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#b97a7a" strokeWidth={3} activeDot={{ r: 8 }} name="შემოსავალი ₾" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Share Breakdown Pie chart */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
            <h3 className="font-bold text-stone-800 font-display text-sm">შემოსავლების განაწილება</h3>
            
            <div className="h-48 text-xs relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={splitPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {splitPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} ₾`, 'წილი']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-stone-500 font-medium">
                  <span className="w-3 h-3 rounded bg-[#b97a7a]"></span>
                  სპეციალისტების ხელფასები:
                </span>
                <span className="font-bold text-stone-800">
                  {fmtGEL(splitPieData[0].value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-stone-500 font-medium">
                  <span className="w-3 h-3 rounded bg-[#2a2827]"></span>
                  ცენტრის წმინდა წილი:
                </span>
                <span className="font-bold text-stone-800">
                  {fmtGEL(splitPieData[1].value)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Commission Split Sheet (სახელფასო უწყისი) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <h3 className="font-bold text-stone-800 font-display text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary-500" />
              სპეციალისტების გამომუშავება და კლინიკის წილები
            </h3>
            <span className="text-xs text-stone-400 font-mono">2026-06-28</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-400 font-bold border-b border-stone-100 uppercase tracking-wider text-[10px]">
                  <th className="p-4">სპეციალისტი</th>
                  <th className="p-4 text-center">ვიზიტები</th>
                  <th className="p-4 text-right">საერთო შემოსავალი</th>
                  <th className="p-4 text-right text-primary-700">სპეციალისტის წილი (გამომუშავება)</th>
                  <th className="p-4 text-right text-stone-800">ცენტრის წილი (მფლობელის)</th>
                  <th className="p-4 text-center">საშუალო %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {employeeEarningsList.map(emp => (
                  <tr key={emp.id} className="hover:bg-stone-50/40 transition-all text-stone-700">
                    <td className="p-4">
                      <div className="font-bold text-stone-800 text-sm">{emp.name}</div>
                      <div className="text-[10px] text-stone-400 font-semibold">{emp.profession}</div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{emp.sessionCount} სესია</td>
                    <td className="p-4 text-right font-mono font-bold text-stone-600">{fmtGEL(emp.revenue)}</td>
                    <td className="p-4 text-right font-mono font-extrabold text-primary-600 bg-primary-50/10">{fmtGEL(emp.employeeShare)}</td>
                    <td className="p-4 text-right font-mono font-extrabold text-stone-800">{fmtGEL(emp.centerShare)}</td>
                    <td className="p-4 text-center font-mono font-bold text-stone-400">{emp.averageRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Procedures Popularity / Profits breakdown table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Procedures Leaderboard - spans 2 columns */}
        <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-bold text-stone-800 font-display text-sm flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-primary-500" />
              პროცედურების პოპულარობა და მოთხოვნა
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-400 font-bold border-b border-stone-100 uppercase tracking-wider text-[10px]">
                  <th className="p-4">პროცედურა</th>
                  <th className="p-4">კატეგორია</th>
                  <th className="p-4 text-center">ჩატარდა</th>
                  <th className="p-4 text-right">შემოსული თანხა</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {procedureSummaryList.map(proc => (
                  <tr key={proc.id} className="hover:bg-stone-50/30 transition-all">
                    <td className="p-4 font-bold text-stone-800">{proc.name}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200/40">
                        {proc.category}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{proc.count} ჯერ</td>
                    <td className="p-4 text-right font-mono font-extrabold text-stone-800">{fmtGEL(proc.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick analytics insights */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-800 font-display text-sm flex items-center gap-1 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              ცენტრის მიგნებები
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-amber-950 space-y-1">
                <h4 className="font-bold">⭐ ყველაზე შემოსავლიანი</h4>
                <p className="text-amber-900">
                  {procedureSummaryList[0]?.name || 'ლაზერული ეპილაცია'} არის თქვენი ლიდერი პროცედურა, რომლის წილი შემოსავალში არის ყველაზე მაღალი.
                </p>
              </div>

              <div className="bg-green-50/50 p-3 rounded-xl border border-green-100 text-green-950 space-y-1">
                <h4 className="font-bold">📈 თვიური ზრდა</h4>
                <p className="text-green-900">
                  ივნისის თვის შემოსავალმა მიაღწია პიკს წინა თვეებთან შედარებით, რაც ძირითადად განპირობებულია ახალი კლიენტების აქტივობით.
                </p>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-blue-950 space-y-1">
                <h4 className="font-bold">💼 პროცენტული წილი</h4>
                <p className="text-blue-900">
                  ცენტრის საშუალო წმინდა მოგების მარჟა სერვისებიდან შეადგენს დაახლოებით 60%-ს, რაც იდეალურია ოპერაციული ხარჯების დასაფარად.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-[11px] text-stone-500">
            * ანგარიშები ეყრდნობა კლიენტის მიერ დასრულებულ და გადახდილ ვიზიტებს. გაუქმებული ვიზიტები არ შედის აქტიურ ფინანსურ შემოსავალში.
          </div>
        </div>
      </div>
    </div>
  );
}
