import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export function exportAllData() {
  const keys = ['dental_patients', 'dental_doctors', 'dental_appointments', 'dental_treatments', 'dental_invoices'];
  const data: Record<string, unknown> = {};
  
  keys.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      data[key.replace('dental_', '')] = JSON.parse(item);
    }
  });

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dental_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(file: File, callbacks: {
  setPatients: (data: unknown[]) => void;
  setDoctors: (data: unknown[]) => void;
  setAppointments: (data: unknown[]) => void;
  setTreatments: (data: unknown[]) => void;
  setInvoices: (data: unknown[]) => void;
}) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target?.result as string);
      if (imported.patients) callbacks.setPatients(imported.patients);
      if (imported.doctors) callbacks.setDoctors(imported.doctors);
      if (imported.appointments) callbacks.setAppointments(imported.appointments);
      if (imported.treatments) callbacks.setTreatments(imported.treatments);
      if (imported.invoices) callbacks.setInvoices(imported.invoices);
      alert('تم استيراد البيانات بنجاح!');
    } catch {
      alert('خطأ في قراءة الملف');
    }
  };
  reader.readAsText(file);
}

export function clearAllData(callbacks: {
  setPatients: (data: unknown[]) => void;
  setDoctors: (data: unknown[]) => void;
  setAppointments: (data: unknown[]) => void;
  setTreatments: (data: unknown[]) => void;
  setInvoices: (data: unknown[]) => void;
}) {
  callbacks.setPatients([]);
  callbacks.setDoctors([]);
  callbacks.setAppointments([]);
  callbacks.setTreatments([]);
  callbacks.setInvoices([]);
}
