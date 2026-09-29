import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DepartmentSelect } from '../../components/common/DepartmentSelect';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Kanban, Lock, Mail, User, Briefcase, Building2, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        jobTitle: jobTitle.trim() || (companyName.trim() ? `${companyName.trim()} Yöneticisi` : undefined),
        department: companyName.trim() || department.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher compact />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {t('auth.registerTitle', 'Şirket & Hesap Kaydı')}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          {t('auth.registerSubtitle', 'Şirketiniz veya ekibiniz için Flowtask çalışma alanını hemen başlatın.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <Input
              label="Şirket / Organizasyon Adı"
              placeholder="Örn: Acme Teknoloji A.Ş."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building2 className="h-4 w-4" />}
            />

            <Input
              label={t('profile.fullName', 'Yetkili / Ad Soyad')}
              placeholder="Ahmet Tekin"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            <Input
              label={t('auth.email', 'Kurumsal E-Posta Adresi')}
              type="email"
              placeholder="ahmet@sirketiniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label={t('auth.password', 'Şifre (en az 6 karakter)')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('profile.jobTitle', 'Pozisyon / Rol')}
                placeholder="Örn: Kurucu & CEO"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                leftIcon={<Briefcase className="h-4 w-4" />}
              />

              <DepartmentSelect
                label={t('profile.department', 'Departman')}
                value={department}
                onChange={setDepartment}
                allowCreate={true}
              />
            </div>

            <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-100 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-indigo-900 leading-tight">
                Şirket yöneticisi olarak kaydolduğunuzda kendi projelerinizi, sprintlerinizi oluşturabilir ve ekip üyelerini davet edebilirsiniz.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {t('auth.signUp', 'Şirket Hesabını Oluştur')}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {t('auth.haveAccount', 'Zaten hesabınız var mı?')}{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              {t('auth.loginNow', 'Giriş Yapın')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
