import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { useAuth } from './AuthContext';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  color: 'indigo' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
}

export const ALL_COMPANIES: Company[] = [
  {
    id: 'all',
    name: 'Tüm Şirketler / Genel Görünüm',
    shortName: 'Tüm Şirketler',
    code: 'ALL',
    description: 'Bütün şirket projeleri ve çalışma alanları',
    color: 'indigo',
  },
  {
    id: 'techflow',
    name: 'TechFlow Solutions',
    shortName: 'TechFlow',
    code: 'FLOW',
    description: 'Bulut Yazılım & Kurumsal SaaS Çözümleri',
    color: 'blue',
  },
  {
    id: 'acmeglobal',
    name: 'Acme Global Corp',
    shortName: 'Acme Global',
    code: 'ACME',
    description: 'E-Ticaret & Perakende Teknolojileri',
    color: 'emerald',
  },
  {
    id: 'nexusfintech',
    name: 'Nexus FinTech Systems',
    shortName: 'Nexus FinTech',
    code: 'FIN',
    description: 'Dijital Bankacılık & Yeni Nesil Ödeme Altyapıları',
    color: 'purple',
  },
  {
    id: 'pulsehealth',
    name: 'Pulse HealthTech AI',
    shortName: 'Pulse Health',
    code: 'HLTH',
    description: 'Yapay Zeka Destekli Teşhis & Sağlık Platformu',
    color: 'rose',
  },
  {
    id: 'vortexlogistics',
    name: 'Vortex Logistics Global',
    shortName: 'Vortex Logistics',
    code: 'LOG',
    description: 'Akıllı Rota Optimizasyonu & Otonom Filo Takibi',
    color: 'amber',
  },
];

export interface UserCompanyInfo {
  name: string;
  code: string;
  color: 'indigo' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber' | 'slate';
  isMultiCompany?: boolean;
}

export const getUserCompany = (u: {
  email?: string;
  department?: string;
  jobTitle?: string;
  isSystemAdmin?: boolean;
}): UserCompanyInfo => {
  const email = (u.email || '').toLowerCase();
  const dept = (u.department || '').toLowerCase();
  const title = (u.jobTitle || '').toLowerCase();

  // Multi-company users assigned across all 5 companies
  if (
    email === 'ayse.yilmaz@flowtask.com' ||
    email === 'demo@flowtask.com' ||
    email.includes('multicompany')
  ) {
    return { name: 'Çoklu Şirket (5 Şirket)', code: 'MULTI', color: 'indigo', isMultiCompany: true };
  }

  if (u.isSystemAdmin || email === 'admin@flowtask.com') {
    return { name: 'Flowtask Core (Sistem)', code: 'SYS', color: 'purple', isMultiCompany: true };
  }

  // 1. TechFlow Solutions
  if (
    email.includes('techflow') ||
    email === 'manager@techflow.com' ||
    email === 'mehmet.kaya@flowtask.com' ||
    email === 'caner.erdogan@flowtask.com' ||
    email === 'selin.arslan@techflow.com' ||
    email === 'emre.celik@techflow.com' ||
    email === 'merve.aydin@techflow.com' ||
    email === 'tolga.yilmaz@techflow.com' ||
    dept.includes('techflow') ||
    title.includes('techflow')
  ) {
    return { name: 'TechFlow Solutions', code: 'FLOW', color: 'blue' };
  }

  // 2. Acme Global Corp
  if (
    email.includes('acme') ||
    email === 'admin@acmeglobal.com' ||
    email === 'zeynep.ozkan@flowtask.com' ||
    email === 'deniz.kurt@acmeglobal.com' ||
    email === 'onur.sahin@acmeglobal.com' ||
    email === 'ece.yildirim@acmeglobal.com' ||
    email === 'hakan.celik@acmeglobal.com' ||
    email === 'pinar.koc@acmeglobal.com' ||
    dept.includes('acme') ||
    title.includes('acme')
  ) {
    return { name: 'Acme Global Corp', code: 'ACME', color: 'emerald' };
  }

  // 3. Nexus FinTech Systems
  if (
    email.includes('nexus') ||
    email.includes('fintech') ||
    dept.includes('fintech') ||
    dept.includes('ödeme') ||
    title.includes('fintech') ||
    title.includes('nexus')
  ) {
    return { name: 'Nexus FinTech Systems', code: 'FIN', color: 'purple' };
  }

  // 4. Pulse HealthTech AI
  if (
    email.includes('pulse') ||
    email.includes('health') ||
    dept.includes('sağlık') ||
    dept.includes('medikal') ||
    title.includes('health') ||
    title.includes('medikal') ||
    title.includes('pulse')
  ) {
    return { name: 'Pulse HealthTech AI', code: 'HLTH', color: 'rose' };
  }

  // 5. Vortex Logistics Global
  if (
    email.includes('vortex') ||
    email.includes('logistics') ||
    dept.includes('lojistik') ||
    dept.includes('tedarik') ||
    title.includes('logistics') ||
    title.includes('vortex')
  ) {
    return { name: 'Vortex Logistics Global', code: 'LOG', color: 'amber' };
  }

  if (u.department) {
    return { name: u.department, code: u.department.slice(0, 4).toUpperCase(), color: 'indigo' };
  }

  return { name: 'Genel Şirket', code: 'GEN', color: 'slate' };
};

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

    // Multi-company users (SuperAdmin, Lead Consultant / Architect Ayşe Yılmaz, Demo Director)
    if (
      user.isSystemAdmin ||
      email === 'admin@flowtask.com' ||
      email === 'ayse.yilmaz@flowtask.com' ||
      email === 'demo@flowtask.com'
    ) {
      return {
        hasMultiple: true,
        defaultCompanyId: 'all',
        companyName: '5 Şirket Yetkilisi (Tüm Şirketler)',
      };
    }

    // 1. TechFlow Solutions
    if (
      email.includes('techflow') ||
      email === 'manager@techflow.com' ||
      email === 'mehmet.kaya@flowtask.com' ||
      email === 'caner.erdogan@flowtask.com' ||
      email === 'selin.arslan@techflow.com' ||
      email === 'emre.celik@techflow.com' ||
      email === 'merve.aydin@techflow.com' ||
      email === 'tolga.yilmaz@techflow.com' ||
      dept.includes('techflow') ||
      title.includes('techflow')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'techflow', companyName: 'TechFlow Solutions' };
    }

    // 2. Acme Global Corp
    if (
      email.includes('acme') ||
      email === 'admin@acmeglobal.com' ||
      email === 'zeynep.ozkan@flowtask.com' ||
      email === 'deniz.kurt@acmeglobal.com' ||
      email === 'onur.sahin@acmeglobal.com' ||
      email === 'ece.yildirim@acmeglobal.com' ||
      email === 'hakan.celik@acmeglobal.com' ||
      email === 'pinar.koc@acmeglobal.com' ||
      dept.includes('acme') ||
      title.includes('acme')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'acmeglobal', companyName: 'Acme Global Corp' };
    }

    // 3. Nexus FinTech Systems
    if (
      email.includes('nexus') ||
      email.includes('fintech') ||
      dept.includes('fintech') ||
      title.includes('fintech')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'nexusfintech', companyName: 'Nexus FinTech Systems' };
    }

    // 4. Pulse HealthTech AI
    if (
      email.includes('pulse') ||
      email.includes('health') ||
      dept.includes('sağlık') ||
      title.includes('health')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'pulsehealth', companyName: 'Pulse HealthTech AI' };
    }

    // 5. Vortex Logistics Global
    if (
      email.includes('vortex') ||
      email.includes('logistics') ||
      dept.includes('lojistik') ||
      title.includes('logistics')
    ) {
      return { hasMultiple: false, defaultCompanyId: 'vortexlogistics', companyName: 'Vortex Logistics Global' };
    }

    // Default registered company if user entered one
    if (user.department) {
      return { hasMultiple: false, defaultCompanyId: 'all', companyName: user.department };
    }

    return { hasMultiple: false, defaultCompanyId: 'all', companyName: 'Varsayılan Şirket' };
  }, [user]);

  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string>(() => {
    const saved = localStorage.getItem('flowtask_selected_company_v2');
    return saved || 'all';
  });

  // When user changes, enforce their default company if single company
  useEffect(() => {
    if (!userEvaluation.hasMultiple && userEvaluation.defaultCompanyId !== 'all') {
      setSelectedCompanyIdState(userEvaluation.defaultCompanyId);
      localStorage.setItem('flowtask_selected_company_v2', userEvaluation.defaultCompanyId);
    }
  }, [userEvaluation]);

  const setSelectedCompanyId = (id: string) => {
    setSelectedCompanyIdState(id);
    localStorage.setItem('flowtask_selected_company_v2', id);
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
          p.name.toLowerCase().includes('techflow')
      );
    }

    if (selectedCompanyId === 'acmeglobal') {
      return projects.filter(
        (p) =>
          p.key === 'SHOP' ||
          p.key === 'ACME' ||
          p.name.toLowerCase().includes('acme')
      );
    }

    if (selectedCompanyId === 'nexusfintech') {
      return projects.filter(
        (p) =>
          p.key === 'FIN' ||
          p.key === 'NEXUS' ||
          p.name.toLowerCase().includes('nexus') ||
          p.name.toLowerCase().includes('fintech')
      );
    }

    if (selectedCompanyId === 'pulsehealth') {
      return projects.filter(
        (p) =>
          p.key === 'HLTH' ||
          p.key === 'PULSE' ||
          p.name.toLowerCase().includes('pulse') ||
          p.name.toLowerCase().includes('health')
      );
    }

    if (selectedCompanyId === 'vortexlogistics') {
      return projects.filter(
        (p) =>
          p.key === 'LOG' ||
          p.key === 'VORTEX' ||
          p.name.toLowerCase().includes('vortex') ||
          p.name.toLowerCase().includes('logistics')
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
