import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Appointment,
  AuditLog,
  Customer,
  Employee,
  MessageTemplate,
  Procedure,
  SystemSettings,
} from './types';
import {
  initialAppointments,
  initialCustomers,
  initialEmployees,
  initialMessageTemplates,
  initialProcedures,
  initialActionLogs,
} from './data/initialData';

// კოლექციების სახელები
export const COLLECTIONS = {
  procedures: 'procedures',
  employees: 'employees',
  customers: 'customers',
  templates: 'templates',
  appointments: 'appointments',
  auditLogs: 'auditLogs',
  messageLogs: 'messageLogs',
} as const;

export const SETTINGS_DOC = doc(db, 'settings', 'config');

export const defaultSettings: SystemSettings = {
  businessName: 'სილამაზისა და ესთეტიკის ცენტრი BELLISSIMA',
  workingHoursStart: '09:00',
  workingHoursEnd: '20:00',
  currency: 'GEL',
  whatsappGatewayStatus: true,
  enforceMinPriceLimit: true,
};

// ცოცხალი გამოწერა კოლექციაზე — ცვლილება აისახება წამიერად (onSnapshot)
export function subscribeCollection<T>(
  name: string,
  cb: (items: T[]) => void,
  onError?: (e: Error) => void
): () => void {
  return onSnapshot(
    collection(db, name),
    (snap) => cb(snap.docs.map((d) => d.data() as T)),
    (err) => {
      console.error(`Firestore subscribe error (${name})`, err);
      onError?.(err);
    }
  );
}

// ცოცხალი გამოწერა პარამეტრების ერთ დოკუმენტზე
export function subscribeSettings(
  cb: (s: SystemSettings) => void,
  onError?: (e: Error) => void
): () => void {
  return onSnapshot(
    SETTINGS_DOC,
    (snap) => {
      if (snap.exists()) cb(snap.data() as SystemSettings);
    },
    (err) => {
      console.error('Firestore settings subscribe error', err);
      onError?.(err);
    }
  );
}

// ჩაწერა/განახლება — ID ცნობილია ენტითის id ველიდან
export function upsert<T extends { id: string }>(name: string, item: T) {
  return setDoc(doc(db, name, item.id), item);
}

export function remove(name: string, id: string) {
  return deleteDoc(doc(db, name, id));
}

export function saveSettings(s: SystemSettings) {
  return setDoc(SETTINGS_DOC, s);
}

export async function clearCollection(name: string) {
  const snap = await getDocs(collection(db, name));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// პირველი გაშვებისას — თუ ბაზა ცარიელია, ჩაიტვირთება საწყისი მონაცემები.
// ეს უზრუნველყოფს, რომ აპლიკაცია არასდროს იყოს ცარიელი/ბლენქი.
export async function seedIfEmpty(): Promise<void> {
  const empSnap = await getDocs(collection(db, COLLECTIONS.employees));
  if (!empSnap.empty) return;

  const batch = writeBatch(db);

  initialProcedures.forEach((p: Procedure) =>
    batch.set(doc(db, COLLECTIONS.procedures, p.id), p)
  );
  initialEmployees.forEach((e: Employee) =>
    batch.set(doc(db, COLLECTIONS.employees, e.id), e)
  );
  initialCustomers.forEach((c: Customer) =>
    batch.set(doc(db, COLLECTIONS.customers, c.id), c)
  );
  initialMessageTemplates.forEach((t: MessageTemplate) =>
    batch.set(doc(db, COLLECTIONS.templates, t.id), {
      ...t,
      body: t.body ?? t.text ?? '',
    })
  );
  initialAppointments.forEach((a: Appointment) =>
    batch.set(doc(db, COLLECTIONS.appointments, a.id), a)
  );
  initialActionLogs.forEach((l) => {
    const log: AuditLog = {
      id: l.id,
      timestamp: l.timestamp,
      user: l.userName,
      action: l.action,
      details: l.details,
    };
    batch.set(doc(db, COLLECTIONS.auditLogs, log.id), log);
  });

  batch.set(SETTINGS_DOC, defaultSettings);

  await batch.commit();
}
