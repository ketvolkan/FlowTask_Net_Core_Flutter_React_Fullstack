import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useCompany } from './CompanyContext';

export interface Department {
  id: string;
  name: string;
  companyId: string; // 'all' | 'techflow' | 'acmeglobal' | 'nexusfintech' | 'pulsehealth' | 'vortexlogistics'
  isCustom?: boolean;
}

const INITIAL_COMPANY_DEPARTMENTS: Department[] = [
  // 1. TechFlow Solutions
  { id: 'tf_backend', name: 'Yazılım & Backend Mühendisliği', companyId: 'techflow' },
  { id: 'tf_frontend', name: 'Frontend & Mobil Geliştirme', companyId: 'techflow' },
  { id: 'tf_devops', name: 'Bulut Altyapı & DevOps', companyId: 'techflow' },
  { id: 'tf_qa', name: 'QA & Test Otomasyonu', companyId: 'techflow' },
  { id: 'tf_product', name: 'Ürün & Çözüm Yönetimi', companyId: 'techflow' },
  { id: 'tf_hr', name: 'İnsan Kaynakları & Operasyon', companyId: 'techflow' },

  // 2. Acme Global Corp
  { id: 'acme_ecom', name: 'E-Ticaret & Mobil Çözümler', companyId: 'acmeglobal' },
  { id: 'acme_design', name: 'UI/UX & Tasarım Stüdyosu', companyId: 'acmeglobal' },
  { id: 'acme_growth', name: 'Satış & Büyüme (Growth)', companyId: 'acmeglobal' },
  { id: 'acme_marketing', name: 'Dijital Pazarlama & İletişim', companyId: 'acmeglobal' },
  { id: 'acme_cs', name: 'Müşteri Başarısı & Destek', companyId: 'acmeglobal' },
  { id: 'acme_ops', name: 'Lojistik & Perakende Operasyonu', companyId: 'acmeglobal' },

  // 3. Nexus FinTech Systems
  { id: 'nx_core', name: 'Çekirdek Bankacılık & FinTech', companyId: 'nexusfintech' },
  { id: 'nx_payment', name: 'Ödeme Altyapıları & POS', companyId: 'nexusfintech' },
  { id: 'nx_sec', name: 'Finansal Güvenlik & Kriptografi', companyId: 'nexusfintech' },
  { id: 'nx_compliance', name: 'Risk, Uyum & Regülasyon (AML)', companyId: 'nexusfintech' },
  { id: 'nx_product', name: 'FinTech Ürün Yönetimi', companyId: 'nexusfintech' },

  // 4. Pulse HealthTech AI
  { id: 'pulse_ai', name: 'Medikal Yapay Zeka & Teşhis', companyId: 'pulsehealth' },
  { id: 'pulse_cv', name: 'Görüntü İşleme & Biyomedikal AI', companyId: 'pulsehealth' },
  { id: 'pulse_bio', name: 'Biyoinformatik & Genomik Veri', companyId: 'pulsehealth' },
  { id: 'pulse_clinical', name: 'Klinik Operasyonlar & Denemeler', companyId: 'pulsehealth' },
  { id: 'pulse_tele', name: 'Tele-Sağlık & Mobil Uygulamalar', companyId: 'pulsehealth' },

  // 5. Vortex Logistics Global
  { id: 'vort_fleet', name: 'Filo Yönetimi & Rota Optimizasyonu', companyId: 'vortexlogistics' },
  { id: 'vort_warehouse', name: 'Akıllı Depo & Robotik Otomasyon', companyId: 'vortexlogistics' },
  { id: 'vort_freight', name: 'Uluslararası Taşımacılık & Kargo', companyId: 'vortexlogistics' },
  { id: 'vort_iot', name: 'IoT Takip Cihazları & Telemetri', companyId: 'vortexlogistics' },
  { id: 'vort_supply', name: 'Tedarik Zinciri Planlama', companyId: 'vortexlogistics' },

  // Ortak / Sistem Departmanları
  { id: 'sys_sec', name: 'Sistem & Güvenlik Yönetimi', companyId: 'all' },
  { id: 'gen_mgmt', name: 'Üst Yönetim & Strateji', companyId: 'all' },
];

interface DepartmentContextType {
  departments: Department[]; // Departments for the active selected company
  allDepartments: Department[]; // All departments across all companies
  addDepartment: (name: string, targetCompanyId?: string) => Department;
  removeDepartment: (id: string) => void;
  getCompanyDepartments: (companyId?: string) => Department[];
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedCompanyId } = useCompany();

  const [allDepartments, setAllDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('flowtask_company_departments_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved departments', e);
      }
    }
    return INITIAL_COMPANY_DEPARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('flowtask_company_departments_v3', JSON.stringify(allDepartments));
  }, [allDepartments]);

  const getCompanyDepartments = (targetCompanyId?: string): Department[] => {
    const compId = targetCompanyId || selectedCompanyId;
    if (!compId || compId === 'all') {
      return allDepartments;
    }
    return allDepartments.filter(
      (d) => d.companyId === compId || d.companyId === 'all'
    );
  };

  const departments = useMemo(() => {
    return getCompanyDepartments(selectedCompanyId);
  }, [allDepartments, selectedCompanyId]);

  const addDepartment = (name: string, targetCompanyId?: string): Department => {
    const trimmed = name.trim();
    const compId =
      targetCompanyId ||
      (selectedCompanyId !== 'all' ? selectedCompanyId : 'techflow');

    const existing = allDepartments.find(
      (d) =>
        d.name.toLowerCase() === trimmed.toLowerCase() &&
        (d.companyId === compId || d.companyId === 'all')
    );
    if (existing) return existing;

    const newDept: Department = {
      id: `custom_${compId}_${Date.now()}`,
      name: trimmed,
      companyId: compId,
      isCustom: true,
    };

    setAllDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const removeDepartment = (id: string) => {
    setAllDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        allDepartments,
        addDepartment,
        removeDepartment,
        getCompanyDepartments,
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
