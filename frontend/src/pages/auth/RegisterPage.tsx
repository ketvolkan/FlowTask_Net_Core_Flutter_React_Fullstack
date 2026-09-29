import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import {
  Kanban,
  Lock,
  Mail,
  User,
  Briefcase,
  Building2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';

type AccountType = 'company' | 'individual';

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();
  const [accountType, setAccountType] = useState<AccountType>('company');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (accountType === 'company' && !companyName.trim()) {
      setError('Lütfen şirket veya organizasyon adını giriniz.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);

    try {
      if (accountType === 'company') {
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          jobTitle: jobTitle.trim() || `${companyName.trim()} Yöneticisi`,
          department: companyName.trim() || undefined,
        });
      } else {
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          jobTitle: jobTitle.trim() || 'Ekip Üyesi',
          department: undefined, // Departman seçimi kayıt alanında olmayacak; şirket yetkilisi tarafından atanacak
        });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Kayıt işlemi gerçekleştirilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher compact />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {t('auth.registerTitle', 'Kayıt Ol & Çalışma Alanı Seç')}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          {t('auth.registerSubtitle', 'Şirketiniz için yeni bir alan açın veya mevcut bir ekibe katılın.')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200/80">
          
          {/* Account Type Selector / Segmented Control */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Kayıt Türü Seçin
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
              
              {/* Company / Admin Option */}
              <button
                type="button"
                onClick={() => {
                  setAccountType('company');
                  setError(null);
                }}
                className={`relative flex flex-col items-center sm:items-start p-3 rounded-lg text-left transition-all duration-200 ${
                  accountType === 'company'
                    ? 'bg-white shadow-sm border border-indigo-200 text-indigo-950 font-semibold ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-md ${accountType === 'company' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-600'}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">
                    {t('auth.accountTypeCompany', 'Şirket Olarak')}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {t('auth.accountTypeCompanyBadge', 'Yetkili / Kurumsal')}
                  </span>
                </div>
              </button>

              {/* Individual / User Option */}
              <button
                type="button"
                onClick={() => {
                  setAccountType('individual');
                  setError(null);
                }}
                className={`relative flex flex-col items-center sm:items-start p-3 rounded-lg text-left transition-all duration-200 ${
                  accountType === 'individual'
                    ? 'bg-white shadow-sm border border-emerald-200 text-emerald-950 font-semibold ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-md ${accountType === 'individual' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/70 text-slate-600'}`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">
                    {t('auth.accountTypeIndividual', 'Kullanıcı Olarak')}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    {t('auth.accountTypeIndividualBadge', 'Ekip Üyesi / Bireysel')}
                  </span>
                </div>
              </button>

            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            {/* Mode-specific Header Hint */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              accountType === 'company'
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}>
              {accountType === 'company' ? (
                <ShieldCheck className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              )}
              <div className="text-[11px] leading-relaxed">
                {accountType === 'company' ? (
                  <span>
                    <strong>Şirket Yetkilisi Kaydı:</strong> Şirketiniz için ana çalışma alanını açar, proje oluşturabilir, sprint başlatabilir, duyuru gönderebilir ve ekibinizi davet edebilirsiniz.
                  </span>
                ) : (
                  <span>
                    <strong>Ekip Üyesi Kaydı:</strong> Bireysel hesabınızı oluşturarak şirketinizin projelerine katılabilir ve atanan görevlerinizi yönetebilirsiniz. Departman ataması şirket yöneticiniz tarafından yapılır.
                  </span>
                )}
              </div>
            </div>

            {/* Company Name Field (Only in Company Mode) */}
            {accountType === 'company' && (
              <Input
                label={t('auth.companyNameLabel', 'Şirket / Organizasyon Adı')}
                placeholder={t('auth.companyNamePlaceholder', 'Örn: Acme Teknoloji A.Ş.')}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftIcon={<Building2 className="h-4 w-4 text-indigo-500" />}
                required
              />
            )}

            {/* Full Name */}
            <Input
              label={accountType === 'company' ? 'Yetkili Ad Soyad' : 'Ad Soyad'}
              placeholder={accountType === 'company' ? 'Örn: Ahmet Tekin' : 'Örn: Caner Erdoğan'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            {/* Email */}
            <Input
              label={accountType === 'company' ? 'Kurumsal E-Posta Adresi' : 'E-Posta Adresi'}
              type="email"
              placeholder={accountType === 'company' ? 'yonetici@sirketiniz.com' : 'ad.soyad@flowtask.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            {/* Password */}
            <Input
              label={t('auth.password', 'Şifre (en az 6 karakter)')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            {/* Job Title / Role */}
            <Input
              label={accountType === 'company' ? t('auth.jobTitleCompany', 'Yetkili Pozisyonu / Ünvanı') : t('auth.jobTitleUser', 'Meslek / Pozisyon')}
              placeholder={accountType === 'company' ? t('auth.jobTitleCompanyPlaceholder', 'Örn: Kurucu & CTO, Genel Müdür') : t('auth.jobTitleUserPlaceholder', 'Örn: Frontend Geliştirici, UI/UX Tasarımcı')}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              leftIcon={<Briefcase className="h-4 w-4" />}
            />

            <Button
              type="submit"
              className={`w-full mt-2 ${
                accountType === 'company'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {accountType === 'company'
                ? t('auth.createCompanyAccount', 'Şirket Çalışma Alanını Başlat')
                : t('auth.createUserAccount', 'Kullanıcı Hesabını Oluştur')}
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
