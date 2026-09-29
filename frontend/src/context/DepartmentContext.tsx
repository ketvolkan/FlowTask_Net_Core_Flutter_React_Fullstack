import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Department {
  id: string;
  name: string;
  isCustom?: boolean;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dev', name: 'Yazılım & Mühendislik' },
  { id: 'product', name: 'Ürün Yönetimi' },
  { id: 'design', name: 'UI/UX & Tasarım' },
  { id: 'devops', name: 'DevOps & Bulut Altyapı' },
  { id: 'qa', name: 'Kalite Güvence & Test (QA)' },
  { id: 'marketing', name: 'Pazarlama & Büyüme' },
  { id: 'sales', name: 'Satış & Müşteri Başarısı' },
  { id: 'hr', name: 'İnsan Kaynakları' },
  { id: 'finance', name: 'Finans & Operasyon' },
  { id: 'sysadmin', name: 'Sistem & Güvenlik Yönetimi' },
];

interface DepartmentContextType {
  departments: Department[];
  addDepartment: (name: string) => Department;
  removeDepartment: (id: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('flowtask_departments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved departments', e);
      }
    }
    return DEFAULT_DEPARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('flowtask_departments', JSON.stringify(departments));
  }, [departments]);

  const addDepartment = (name: string): Department => {
    const trimmed = name.trim();
    const existing = departments.find(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newDept: Department = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      isCustom: true,
    };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const removeDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        addDepartment,
        removeDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = (): DepartmentContextType => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};
