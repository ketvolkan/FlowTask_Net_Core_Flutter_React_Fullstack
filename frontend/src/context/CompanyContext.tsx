import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Project } from '../types';

export interface Company {
  id: string;
  name: string;
  code: string;
  color: string;
}

const DEFAULT_COMPANIES: Company[] = [
  { id: 'all', name: 'Tüm Şirketler / Genel Görünüm', code: 'ALL', color: 'indigo' },
  { id: 'techflow', name: 'TechFlow Solutions', code: 'FLOW', color: 'blue' },
  { id: 'acmeglobal', name: 'Acme Global Corp', code: 'ACME', color: 'emerald' },
];

interface CompanyContextType {
  selectedCompanyId: string;
  selectedCompany: Company;
  availableCompanies: Company[];
  setSelectedCompanyId: (id: string) => void;
  filterProjectsByCompany: (projects: Project[]) => Project[];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string>(() => {
    return localStorage.getItem('flowtask_selected_company') || 'all';
  });

  const setSelectedCompanyId = (id: string) => {
    setSelectedCompanyIdState(id);
    localStorage.setItem('flowtask_selected_company', id);
  };

  const selectedCompany = useMemo(() => {
    return DEFAULT_COMPANIES.find((c) => c.id === selectedCompanyId) || DEFAULT_COMPANIES[0];
  }, [selectedCompanyId]);

  const filterProjectsByCompany = (projects: Project[]): Project[] => {
    if (!projects || projects.length === 0) return [];
    if (selectedCompanyId === 'all') return projects;

    if (selectedCompanyId === 'techflow') {
      return projects.filter(
        (p) =>
          p.key === 'FLOW' ||
          p.key === 'FIN' ||
          p.name.toLowerCase().includes('techflow')
      );
    }

    if (selectedCompanyId === 'acmeglobal') {
      return projects.filter(
        (p) =>
          p.key === 'SHOP' ||
          p.key === 'HLTH' ||
          p.name.toLowerCase().includes('acme')
      );
    }

    return projects;
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompanyId,
        selectedCompany,
        availableCompanies: DEFAULT_COMPANIES,
        setSelectedCompanyId,
        filterProjectsByCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
