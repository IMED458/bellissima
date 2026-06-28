import { Customer, Employee, Procedure, Appointment, MessageTemplate, CenterSettings } from '../types';

export const initialCenterSettings: CenterSettings = {
  centerName: "სილამაზისა და ესთეტიკის ცენტრი BELLISSIMA",
  address: "თბილისი, ჭავჭავაძის გამზირი 37",
  contactPhone: "+995 599 123 456",
  workingHoursStart: "09:00",
  workingHoursEnd: "20:00",
  currencySymbol: "₾",
};

export const initialProcedures: Procedure[] = [
  {
    id: "proc_1",
    name: "ლაზერული ეპილაცია",
    category: "ეპილაცია",
    description: "ალექსანდრიტის და დიოდური ლაზერების კომბინირებული აპარატით უმტკივნეულო ეპილაცია",
    price: 80,
    minPrice: 50,
    duration: 30,
    isActive: true,
    isRecurring: true,
    recurrenceDays: 21,
  },
  {
    id: "proc_2",
    name: "სახის ღრმა წმენდა",
    category: "კოსმეტოლოგია",
    description: "კანის ულტრაბგერითი და მექანიკური წმენდა პრემიუმ კლასის კოსმეტიკით",
    price: 120,
    minPrice: 90,
    duration: 60,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_3",
    name: "ტატუს მოშორება",
    category: "ლაზერი",
    description: "ტატუს უსაფრთხო პიგმენტური მოშორება უახლესი ლაზერული ტექნოლოგიით",
    price: 150,
    minPrice: 100,
    duration: 45,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_4",
    name: "ცივი პლაზმის პროცედურა",
    category: "კოსმეტოლოგია",
    description: "კანის გაახალგაზრდავება და კოლაგენის სტიმულირება ცივი პლაზმის ტექნოლოგიით",
    price: 200,
    minPrice: 150,
    duration: 40,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_5",
    name: "პაპილომების მოშორება",
    category: "დერმატოლოგია",
    description: "პაპილომების სწრაფი და უსაფრთხო მოშორება კოაგულატორით",
    price: 50,
    minPrice: 30,
    duration: 20,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_6",
    name: "ქსანთელაზმების მოშორება",
    category: "დერმატოლოგია",
    description: "ქოლესტერინული დაგროვებების მოშორება თვალის ირგვლივ არეში",
    price: 100,
    minPrice: 80,
    duration: 30,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_7",
    name: "ნემსით ეპილაცია",
    category: "ეპილაცია",
    description: "არასასურველი თმის სამუდამო მოშორება ელექტროეპილაციის მეთოდით",
    price: 60,
    minPrice: 40,
    duration: 60,
    isActive: true,
    isRecurring: false,
  },
  {
    id: "proc_8",
    name: "წამწამების დაგრძელება",
    category: "ვიზაჟი",
    description: "კლასიკური და მოცულობითი დაგრძელება უმაღლესი ხარისხის ჰიპოალერგიული წებოთი",
    price: 90,
    minPrice: 70,
    duration: 90,
    isActive: true,
    isRecurring: false,
  },
];

export const initialEmployees: Employee[] = [
  {
    id: "emp_1",
    name: "მარიამ კაპანაძე",
    profession: "კლინიკის მენეჯერი / ადმინი",
    phone: "599 112 233",
    email: "mariam.admin@glow.ge",
    username: "admin",
    password: "password123",
    isActive: true,
    role: "admin",
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: "09:00",
    workingHoursEnd: "20:00",
    procedures: ["proc_1", "proc_2", "proc_3", "proc_4", "proc_5", "proc_6", "proc_7", "proc_8"],
    commissionPercent: 10,
    color: "#db2777", // Deep Rose/Pink
  },
  {
    id: "emp_2",
    name: "თამარ მელიქიძე",
    profession: "ლაზეროთერაპევტი",
    phone: "555 223 344",
    email: "tamar.laser@glow.ge",
    username: "tamar",
    password: "user123",
    isActive: true,
    role: "employee",
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHoursStart: "09:00",
    workingHoursEnd: "19:00",
    procedures: ["proc_1", "proc_7"], // Laser & Needle
    commissionPercent: 40,
    procedureCommissions: {
      "proc_1": 40,
      "proc_7": 50, // Needle Epilation 50%
    },
    color: "#ca8a04", // Gold/Dark Yellow
  },
  {
    id: "emp_3",
    name: "ნინო შენგელია",
    profession: "კოსმეტოლოგი / დერმატოლოგი",
    phone: "577 334 455",
    email: "nino.cosm@glow.ge",
    username: "nino",
    password: "user123",
    isActive: true,
    role: "employee",
    workingDays: [2, 4, 6], // Tue, Thu, Sat
    workingHoursStart: "10:00",
    workingHoursEnd: "20:00",
    procedures: ["proc_2", "proc_4", "proc_5", "proc_6"], // Skincare procedures
    commissionPercent: 35,
    procedureCommissions: {
      "proc_2": 40, // deep clean override 40%
      "proc_4": 35,
    },
    color: "#be185d", // Magenta/Dark Pink
  },
  {
    id: "emp_4",
    name: "ელენე ბერიძე",
    profession: "წამწამების სპეციალისტი",
    phone: "591 445 566",
    email: "elene.lashes@glow.ge",
    username: "elene",
    password: "user123",
    isActive: true,
    role: "employee",
    workingDays: [3, 5, 0], // Wed, Fri, Sun
    workingHoursStart: "09:30",
    workingHoursEnd: "18:30",
    procedures: ["proc_8"], // Lashes extension
    commissionPercent: 50,
    procedureCommissions: {
      "proc_8": 50,
    },
    color: "#b45309", // Warm Amber/Gold
  },
];

export const initialCustomers: Customer[] = [
  {
    id: "cust_1",
    firstName: "გიორგი",
    lastName: "იმედაშვილი",
    phone: "599123456",
    email: "imedashviligio27@gmail.com",
    birthDate: "1994-05-15",
    notes: "მგრძნობიარე კანი, საჭიროებს დამამშვიდებელ გელს ლაზერის შემდეგ",
    status: "vip",
    createdAt: "2026-01-10T12:00:00Z",
    updatedAt: "2026-06-25T15:30:00Z",
  },
  {
    id: "cust_2",
    firstName: "მარიამ",
    lastName: "ალავიძე",
    phone: "555987654",
    email: "mari.alavidze@mail.ge",
    birthDate: "1998-09-22",
    notes: "რეგულარული მომხმარებელი, კეთდება სტანდარტული ფასდაკლება",
    status: "active",
    nextRecommendedDate: "2026-07-16", // 21 days from last session
    createdAt: "2026-02-14T10:00:00Z",
    updatedAt: "2026-06-25T17:00:00Z",
  },
  {
    id: "cust_3",
    firstName: "ლია",
    lastName: "კოპაძე",
    phone: "577223344",
    status: "new",
    createdAt: "2026-06-24T11:00:00Z",
    updatedAt: "2026-06-24T11:00:00Z",
  },
  {
    id: "cust_4",
    firstName: "ანი",
    lastName: "კალანდაძე",
    phone: "593445566",
    email: "ani.k@gmail.com",
    status: "active",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "cust_5",
    firstName: "სალომე",
    lastName: "კვარაცხელია",
    phone: "551556677",
    birthDate: "1991-11-03",
    notes: "გამოტოვა ბოლო 2 ჩაწერა უთქმელად",
    status: "problematic",
    createdAt: "2026-01-20T14:00:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "cust_6",
    firstName: "ნათია",
    lastName: "ხერგიანი",
    phone: "598443322",
    status: "passive",
    createdAt: "2025-11-12T10:00:00Z",
    updatedAt: "2026-04-10T14:00:00Z",
  },
];

export const initialMessageTemplates: MessageTemplate[] = [
  {
    id: "tmpl_1",
    name: "ვიზიტის დადასტურება",
    type: "booking_confirmation",
    channel: "whatsapp",
    text: "გამარჯობა [მომხმარებლის სახელი], თქვენ წარმატებით ჩაეწერეთ [თარიღი]-ს [საათი]-ზე პროცედურაზე: [პროცედურა]. სპეციალისტი: [თანამშრომელი]. მისამართი: [მისამართი]. ტელეფონი: [ტელეფონი]. გელოდებით, [ცენტრის სახელი]!",
    body: "გამარჯობა [მომხმარებლის სახელი], თქვენ წარმატებით ჩაეწერეთ [თარიღი]-ს [საათი]-ზე პროცედურაზე: [პროცედურა]. სპეციალისტი: [თანამშრომელი]. მისამართი: [მისამართი]. ტელეფონი: [ტელეფონი]. გელოდებით, [ცენტრის სახელი]!",
    description: "იგზავნება ვიზიტზე ჩაწერისთანავე",
  },
  {
    id: "tmpl_2",
    name: "ვიზიტის შეხსენება",
    type: "reminder",
    channel: "whatsapp",
    text: "გამარჯობა [მომხმარებლის სახელი], შეგახსენებთ, რომ ხვალ [საათი]-ზე დაგეგმილი გაქვთ ვიზიტი პროცედურაზე: [პროცედურა], სპეციალისტი: [თანამშრომელი]. გთხოვთ, მოსვლამდე 15 წუთით ადრე მობრძანდეთ. თუ გეგმები შეგეცვალათ, შეგვატყობინეთ.",
    body: "გამარჯობა [მომხმარებლის სახელი], შეგახსენებთ, რომ ხვალ [საათი]-ზე დაგეგმილი გაქვთ ვიზიტი პროცედურაზე: [პროცედურა], სპეციალისტი: [თანამშრომელი]. გთხოვთ, მოსვლამდე 15 წუთით ადრე მობრძანდეთ. თუ გეგმები შეგეცვალათ, შეგვატყობინეთ.",
    description: "იგზავნება ვიზიტის წინა დღეს",
  },
  {
    id: "tmpl_3",
    name: "ვიზიტის გაუქმება",
    type: "cancellation",
    channel: "sms",
    text: "გამარჯობა [მომხმარებლის სახელი], გაცნობებთ, რომ თქვენი ჩაწერა [თარიღი] [საათი]-ზე პროცედურაზე: [პროცედურა] გაუქმებულია. [ცენტრის სახელი].",
    body: "გამარჯობა [მომხმარებლის სახელი], გაცნობებთ, რომ თქვენი ჩაწერა [თარიღი] [საათი]-ზე პროცედურაზე: [პროცედურა] გაუქმებულია. [ცენტრის სახელი].",
    description: "იგზავნება ჩაწერის გაუქმებისას",
  },
  {
    id: "tmpl_4",
    name: "ვიზიტის გადატანა",
    type: "reschedule",
    channel: "sms",
    text: "გამარჯობა [მომხმარებლის სახელი], თქვენი ჩაწერა პროცედურაზე [პროცედურა] გადატანილია ახალ დროზე: [თარიღი] [საათი]. სპეციალისტი: [თანამშრომელი]. გელოდებით, [ცენტრის სახელი].",
    body: "გამარჯობა [მომხმარებლის სახელი], თქვენი ჩაწერა პროცედურაზე [პროცედურა] გადატანილია ახალ დროზე: [თარიღი] [საათი]. სპეციალისტი: [თანამშრომელი]. გელოდებით, [ცენტრის სახელი].",
    description: "იგზავნება ვიზიტის გადაგეგმვისას",
  },
  {
    id: "tmpl_5",
    name: "ლაზერის 21-დღიანი შეხსენება",
    type: "laser_followup",
    channel: "whatsapp",
    text: "გამარჯობა [მომხმარებლის სახელი], შეგახსენებთ, რომ ლაზერული ეპილაციის შემდეგი რეკომენდებული ვიზიტის დრო ([თარიღი]) ახლოვდება. გთხოვთ, დაგვიკავშირდეთ სასურველი საათის შესათანხმებლად. [ცენტრის სახელი].",
    body: "გამარჯობა [მომხმარებლის სახელი], შეგახსენებთ, რომ ლაზერული ეპილაციის შემდეგი რეკომენდებული ვიზიტის დრო ([თარიღი]) ახლოვდება. გთხოვთ, დაგვიკავშირდეთ სასურველი საათის შესათანხმებლად. [ცენტრის სახელი].",
    description: "ავტომატური შეხსენება ლაზერიდან 21 დღეში",
  },
  {
    id: "tmpl_6",
    name: "დაბადების დღის მილოცვა",
    type: "birthday",
    channel: "email",
    text: "ძვირფასო [მომხმარებლის სახელი], [ცენტრის სახელი] გილოცავთ დაბადების დღეს! გისურვებთ სილამაზეს, ჯანმრთელობას და ბედნიერებას. საჩუქრად გადმოგცემთ 20%-იან ერთჯერად ფასდაკლებას ნებისმიერ პროცედურაზე!",
    body: "ძვირფასო [მომხმარებლის სახელი], [ცენტრის სახელი] გილოცავთ დაბადების დღეს! გისურვებთ სილამაზეს, ჯანმრთელობას და ბედნიერებას. საჩუქრად გადმოგცემთ 20%-იან ერთჯერად ფასდაკლებას ნებისმიერ პროცედურაზე!",
    description: "იგზავნება მომხმარებლის დაბადების დღეს",
  },
  {
    id: "tmpl_7",
    name: "აქცია / ფასდაკლება",
    type: "promo",
    channel: "whatsapp",
    text: "გამარჯობა [მომხმარებლის სახელი]! გვაქვს საოცარი სიახლე: Bellissima-ში დაიწყო ზაფხულის აქცია სახის ღრმა წმენდაზე - მხოლოდ [პროცედურის ფასი] ლარად ნაცვლად სტანდარტული ფასისა. ჩაწერისთვის მოგვწერეთ ან დაგვიკავშირდით: [ტელეფონი].",
    body: "გამარჯობა [მომხმარებლის სახელი]! გვაქვს საოცარი სიახლე: Bellissima-ში დაიწყო ზაფხულის აქცია სახის ღრმა წმენდაზე - მხოლოდ [პროცედურის ფასი] ლარად ნაცვლად სტანდარტული ფასისა. ჩაწერისთვის მოგვწერეთ ან დაგვიკავშირდით: [ტელეფონი].",
    description: "იგზავნება სარეკლამო აქციებისას",
  },
];

// Helper to generate date relative to today (e.g. -2 months, +3 days, etc.)
// Keeping dates relative to current date (e.g. 2026-06-28) makes sure they fit the charts nicely
function getDateRelative(daysOffset: number, hours: string): string {
  const baseDate = new Date("2026-06-28T12:00:00");
  baseDate.setDate(baseDate.getDate() + daysOffset);
  const dateStr = baseDate.toISOString().split('T')[0];
  return `${dateStr}T${hours}`;
}

export const initialAppointments: Appointment[] = [
  // Completed in the past
  {
    id: "appt_1",
    customerId: "cust_1",
    customerName: "გიორგი იმედაშვილი",
    phone: "599123456",
    procedureId: "proc_1", // Laser Epilation
    employeeId: "emp_2", // Tamar
    dateTime: getDateRelative(-25, "11:00"),
    duration: 30,
    price: 80,
    discountType: "percent",
    discountValue: 10,
    finalPrice: 72,
    paidAmount: 72,
    paymentStatus: "paid",
    paymentMethod: "card",
    appointmentStatus: "completed",
    note: "ყველაფერმა კარგად ჩაიარა, კანი მშვიდია",
    createdAt: getDateRelative(-25, "10:15"),
    updatedAt: getDateRelative(-25, "11:35"),
    createdBy: "მარიამ კაპანაძე",
  },
  {
    id: "appt_2",
    customerId: "cust_2",
    customerName: "მარიამ ალავიძე",
    phone: "555987654",
    procedureId: "proc_1", // Laser Epilation
    employeeId: "emp_2", // Tamar
    dateTime: getDateRelative(-21, "14:00"),
    duration: 30,
    price: 80,
    discountType: "none",
    discountValue: 0,
    finalPrice: 80,
    paidAmount: 80,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    appointmentStatus: "completed",
    note: "ლაზერი სახეზე და ფეხებზე",
    createdAt: getDateRelative(-22, "12:00"),
    updatedAt: getDateRelative(-21, "14:35"),
    createdBy: "თამარ მელიქიძე",
  },
  {
    id: "appt_3",
    customerId: "cust_4",
    customerName: "ანი კალანდაძე",
    phone: "593445566",
    procedureId: "proc_2", // Facial Deep Clean
    employeeId: "emp_3", // Nino
    dateTime: getDateRelative(-15, "12:00"),
    duration: 60,
    price: 120,
    discountType: "amount",
    discountValue: 20,
    finalPrice: 100,
    paidAmount: 100,
    paymentStatus: "paid",
    paymentMethod: "cash",
    appointmentStatus: "completed",
    note: "კანი ძალიან კარგ მდგომარეობაშია",
    createdAt: getDateRelative(-18, "16:00"),
    updatedAt: getDateRelative(-15, "13:05"),
    createdBy: "მარიამ კაპანაძე",
  },
  {
    id: "appt_4",
    customerId: "cust_5",
    customerName: "სალომე კვარაცხელია",
    phone: "551556677",
    procedureId: "proc_4", // Cold Plasma
    employeeId: "emp_3", // Nino
    dateTime: getDateRelative(-8, "16:00"),
    duration: 40,
    price: 200,
    discountType: "none",
    discountValue: 0,
    finalPrice: 200,
    paidAmount: 100,
    paymentStatus: "partial",
    paymentMethod: "card",
    appointmentStatus: "completed",
    note: "დარჩა 100 ლარი გადასახდელი",
    createdAt: getDateRelative(-10, "11:00"),
    updatedAt: getDateRelative(-8, "16:45"),
    createdBy: "მარიამ კაპანაძე",
  },
  // Today's Appointments (June 28, 2026)
  {
    id: "appt_5",
    customerId: "cust_1",
    customerName: "გიორგი იმედაშვილი",
    phone: "599123456",
    procedureId: "proc_2", // Deep Clean
    employeeId: "emp_3", // Nino
    dateTime: getDateRelative(0, "10:00"), // Today 10:00
    duration: 60,
    price: 120,
    discountType: "percent",
    discountValue: 15,
    finalPrice: 102,
    paidAmount: 102,
    paymentStatus: "paid",
    paymentMethod: "card",
    appointmentStatus: "completed",
    note: "VIP კლიენტი, 15% ფასდაკლებით",
    createdAt: getDateRelative(-2, "11:30"),
    updatedAt: getDateRelative(0, "11:15"),
    createdBy: "მარიამ კაპანაძე",
  },
  {
    id: "appt_6",
    customerId: "cust_3",
    customerName: "ლია კოპაძე",
    phone: "577223344",
    procedureId: "proc_8", // Lashes
    employeeId: "emp_4", // Elene
    dateTime: getDateRelative(0, "12:30"), // Today 12:30
    duration: 90,
    price: 90,
    discountType: "none",
    discountValue: 0,
    finalPrice: 90,
    paidAmount: 0,
    paymentStatus: "unpaid",
    paymentMethod: "cash",
    appointmentStatus: "confirmed",
    createdAt: getDateRelative(-4, "15:00"),
    updatedAt: getDateRelative(0, "09:30"),
    createdBy: "მარიამ კაპანაძე",
  },
  {
    id: "appt_7",
    customerId: "cust_2",
    customerName: "მარიამ ალავიძე",
    phone: "555987654",
    procedureId: "proc_1", // Laser
    employeeId: "emp_2", // Tamar
    dateTime: getDateRelative(0, "15:00"), // Today 15:00
    duration: 30,
    price: 80,
    discountType: "none",
    discountValue: 0,
    finalPrice: 80,
    paidAmount: 80,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    appointmentStatus: "completed",
    note: "21-დღიანი გეგმიური ლაზერი",
    createdAt: getDateRelative(-3, "17:40"),
    updatedAt: getDateRelative(0, "15:35"),
    createdBy: "თამარ მელიქიძე",
  },
  // Upcoming
  {
    id: "appt_8",
    customerId: "cust_4",
    customerName: "ანი კალანდაძე",
    phone: "593445566",
    procedureId: "proc_3", // Tattoo Removal
    employeeId: "emp_3", // Nino (or can handle other things)
    dateTime: getDateRelative(2, "14:00"), // in 2 days
    duration: 45,
    price: 150,
    discountType: "none",
    discountValue: 0,
    finalPrice: 150,
    paidAmount: 0,
    paymentStatus: "unpaid",
    paymentMethod: "card",
    appointmentStatus: "booked",
    createdAt: getDateRelative(-1, "12:00"),
    updatedAt: getDateRelative(-1, "12:00"),
    createdBy: "მარიამ კაპანაძე",
  },
  // Waiting for date confirmation (status: pending_confirmation) - 21-day laser follow-up
  {
    id: "appt_9",
    customerId: "cust_2",
    customerName: "მარიამ ალავიძე",
    phone: "555987654",
    procedureId: "proc_1", // Laser (recommends 21 days from Today)
    employeeId: "emp_2", // Tamar
    dateTime: getDateRelative(21, "12:00"), // Today + 21 days
    duration: 30,
    price: 80,
    discountType: "none",
    discountValue: 0,
    finalPrice: 80,
    paidAmount: 0,
    paymentStatus: "unpaid",
    paymentMethod: "card",
    appointmentStatus: "pending_confirmation",
    note: "ავტომატური სისტემური რეკომენდაცია (21 დღე)",
    isLaserFollowUp: true,
    createdAt: getDateRelative(0, "15:35"), // created on today's session finish
    updatedAt: getDateRelative(0, "15:35"),
    createdBy: "სისტემა",
  },
];

export const initialActionLogs = [
  {
    id: "log_1",
    userId: "emp_1",
    userName: "მარიამ კაპანაძე",
    userRole: "admin",
    action: "სისტემის ინიციალიზაცია",
    timestamp: "2026-06-28T09:00:00Z",
    details: "მონაცემთა ბაზა წარმატებით ჩაიტვირთა",
  },
  {
    id: "log_2",
    userId: "emp_1",
    userName: "მარიამ კაპანაძე",
    userRole: "admin",
    action: "ახალი კლიენტის დამატება",
    timestamp: "2026-06-28T10:15:00Z",
    details: "დაემატა კლიენტი: ლია კოპაძე (+995 577 223 344)",
  },
  {
    id: "log_3",
    userId: "emp_3",
    userName: "ნინო შენგელია",
    userRole: "employee",
    action: "ვიზიტის დასრულება",
    timestamp: "2026-06-28T11:15:00Z",
    details: "დასრულდა ვიზიტი #appt_5 კლიენტისთვის გიორგი იმედაშვილი. თანხა: 102 ₾",
  },
];

export interface LaserZone {
  name: string;
  price: number;
}

export const laserZones: LaserZone[] = [
  { name: "მთლიანი სახე", price: 30 },
  { name: "ყელი", price: 15 },
  { name: "კისერი", price: 20 },
  { name: "დვრილის არე", price: 20 },
  { name: "მკერდის შუა ზოლი", price: 15 },
  { name: "მუცლის თეთრი ზოლი", price: 15 },
  { name: "მუცელი", price: 25 },
  { name: "იღლია", price: 25 },
  { name: "მხრები", price: 30 },
  { name: "მთლიანი ხელები", price: 30 },
  { name: "ხელი იდაყვამდე", price: 15 },
  { name: "ზურგი", price: 30 },
  { name: "წელი", price: 20 },
  { name: "დუნდულა", price: 30 },
  { name: "ღრმა ბიკინი ანუსით", price: 35 },
  { name: "ზედაპირული ბიკინი", price: 20 },
  { name: "ფეხები", price: 50 },
  { name: "წვივი", price: 30 },
  { name: "ბარძაყი", price: 30 },
  { name: "მთლიანი სხეული", price: 120 }
];

