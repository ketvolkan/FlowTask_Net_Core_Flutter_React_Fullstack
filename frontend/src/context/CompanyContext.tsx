import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { useAuth } from './AuthContext';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  color: string;
}

export const ALL_COMPANIES: Company[] = [
  {
    id: 'all',
    name: 'Tüm Şirketler / Genel Görünüm',
    shortName: 'Tüm Şirketler',
    code: 'ALL',
    description: 'Bütün şirket projeleri',
    color: 'indigo',
  },
  {
    id: 'techflow',
    name: 'TechFlow Solutions',
    shortName: 'TechFlow',
    code: 'FLOW',
    description: 'FLOW & FIN Kurumsal Projeleri',
    color: 'blue',
  },
  {
    id: 'acmeglobal',
    name: 'Acme Global Corp',
    shortName: 'Acme Global',
    code: 'ACME',
    description: 'SHOP & HLTH Mobil ve E-Ticaret',
    color: 'emerald',
  },
];

interface CompanyContextType {
  selectedCompanyId: string;
  selectedCompany: Company;
  availableCompanies: Company[];
  hasMultipleCompanies: boolean;
  userCompanyName: string;
  setSelectedCompanyId: (id: string) => void;
  filterProjectsByCompany: (projects: Project[]) => Project[];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Determine user's company membership
  const userEvaluation = useMemo(() => {
    if (!user) {
      return { hasMultiple: false, defaultCompanyId: 'all', companyName: '' };
    }

    const email = user.email.toLowerCase();
    const dept = (user.department || '').toLowerCase();
    const title = (user.jobTitle || '').toLowerCase();

    // Multi-company users (SuperAdmin, Multi-tenant Architect, Lead PM)
    if (
      user.isSystemAdmin ||
      email === 'admin@flowtask.com' ||
      email === 'ayse.yilmaz@flowtask.com' ||
      email === 'demo@flowtask.com'
    ) {
      return { hasMultiple: true, defaultCompanyId: 'all', companyName: 'Çoklu Şirket Üyesi' };
    }

    // Single company - TechFlow
    if (
      email.includes('techflow') ||
      email === 'manager@techflow.com' ||
      email === 'mehmet.kaya@flowtask.com' ||
      email === 'caner.erdogan@flowtask.com' ||
      dept.includes('techflow') ||
      title.includes('techflow')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'techflow', companyName: 'TechFlow Solutions' };
    }

    // Single company - Acme Global
    if (
      email.includes('acme') ||
      email === 'admin@acmeglobal.com' ||
      email === 'zeynep.ozkan@flowtask.com' ||
      dept.includes('acme') ||
      title.includes('acme')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'acmeglobal', companyName: 'Acme Global Corp' };
    }

    // Default registered company if user entered one
    if (user.department) {
      return { hasMultiple: false, defaultCompanyId: 'all', companyName: user.department };
    }

    return { hasMultiple: false, defaultCompanyId: 'all', companyName: 'Varsayılan Şirket' };
  }, [user]);

  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string>(() => {
    const saved = localStorage.getItem('flowtask_selected_company');
    return saved || 'all';
  });

  // When user changes, enforce their default company if single company
  useEffect(() => {
    if (!userEvaluation.hasMultiple && userEvaluation.defaultCompanyId !== 'all') {
      setSelectedCompanyIdState(userEvaluation.defaultCompanyId);
      localStorage.setItem('flowtask_selected_company', userEvaluation.defaultCompanyId);
    }
  }, [userEvaluation]);

  const setSelectedCompanyId = (id: string) => {
    setSelectedCompanyIdState(id);
    localStorage.setItem('flowtask_selected_company', id);
  };

  const selectedCompany = useMemo(() => {
    return ALL_COMPANIES.find((c) => c.id === selectedCompanyId) || ALL_COMPANIES[0];
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
        availableCompanies: ALL_COMPANIES,
        hasMultipleCompanies: userEvaluation.hasMultiple,
        userCompanyName: userEvaluation.companyName,
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
