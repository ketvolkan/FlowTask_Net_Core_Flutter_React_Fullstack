import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import {
  Kanban,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Building2,
  Users,
  Code2,
  Palette,
  Sparkles,
  Layers,
} from 'lucide-react';

interface DemoPersona {
  roleTitle: string;
  name: string;
  email: string;
  pass: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    roleTitle: 'Sistem Yöneticisi (Yazılımcı / Super Admin)',
    name: 'Sistem Yöneticisi',
    email: 'admin@flowtask.com',
    pass: 'Admin123*',
    badge: 'Platform Sahibi',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Shield,
    description: 'Tüm şirketleri, global kullanıcıları ve sistem loglarını yönetir.',
  },
  {
    roleTitle: 'Şirket Yöneticisi (TechFlow)',
    name: 'Ahmet Tekin',
    email: 'manager@techflow.com',
    pass: 'Manager123*',
    badge: 'TechFlow Admin',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Building2,
    description: 'TechFlow projelerini (FLOW, FIN) ve şirket çalışanlarını yönetir.',
  },
  {
    roleTitle: 'Şirket Yöneticisi (Acme Global)',
    name: 'Burak Demir',
    email: 'admin@acmeglobal.com',
    pass: 'Manager123*',
    badge: 'Acme Global Admin',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Building2,
    description: 'Acme Global projelerini (SHOP, HLTH) ve ekiplerini yönetir.',
  },
  {
    roleTitle: 'Proje Yöneticisi (Lead PM)',
    name: 'Demo Project Manager',
    email: 'demo@flowtask.com',
    pass: 'Demo123*',
    badge: 'PM / Scrum Master',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Layers,
    description: 'Sprintleri başlatır, backlog önceliklendirir ve görev atar.',
  },
  {
    roleTitle: 'Çoklu Şirket Üyesi (Multi-Tenant)',
    name: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz@flowtask.com',
    pass: 'User123*',
    badge: 'Çoklu Şirket',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Users,
    description: 'Hem TechFlow hem Acme Global şirketlerinde aktif projeleri vardır.',
  },
  {
    roleTitle: 'Principal Backend Developer',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@flowtask.com',
    pass: 'User123*',
    badge: 'Backend Dev',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: Code2,
    description: 'JWT, API entegrasyonu ve backend görevleri üzerinde çalışır.',
  },
  {
    roleTitle: 'Senior UI/UX Designer',
    name: 'Zeynep Özkan',
    email: 'zeynep.ozkan@flowtask.com',
    pass: 'User123*',
    badge: 'Designer',
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: Palette,
    description: 'Figma tasarım sistemleri ve UI görevlerini yürütür.',
  },
];

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('admin@flowtask.com');
  const [password, setPassword] = useState('Admin123*');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await login({ email: loginEmail.trim(), password: loginPass });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Geçersiz e-posta veya şifre');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleSelectPersona = (persona: DemoPersona, autoLogin = false) => {
    setEmail(persona.email);
    setPassword(persona.pass);
    if (autoLogin) {
      performLogin(persona.email, persona.pass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher compact />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {t('auth.loginTitle', 'Flowtask Giriş Portalı')}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          {t('auth.loginSubtitle', 'Kurumsal proje ve görev yönetim platformunda oturum açın.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Standard Login Form */}
        <div className="lg:col-span-5 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Hesap Girişi</h3>
              <p className="text-[11px] text-slate-500">E-posta ve şifrenizi girerek veya sağdan hızlı seçim yaparak giriş yapın.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}

              <Input
                label={t('auth.email', 'E-Posta Adresi')}
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label={t('auth.password', 'Şifre')}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {t('auth.signIn', 'Giriş Yap')}
              </Button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {t('auth.noAccount', 'Yeni şirket veya hesap oluşturmak mı istiyorsunuz?')}{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              {t('auth.registerNow', 'Kayıt Olun')}
            </Link>
          </div>
        </div>

        {/* Right Side: One-Click Demo Personas */}
        <div className="lg:col-span-7 bg-white py-6 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Hazır Demo Hesapları (Tek Tıkla Giriş)</h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">7 Farklı Rol</span>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 mb-3">
            Sistem yöneticisi, şirket yöneticisi, çoklu şirket üyesi veya uzman rolleriyle sistemi hemen deneyin:
          </p>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {DEMO_PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = email === p.email;
              return (
                <div
                  key={p.email}
                  onClick={() => handleSelectPersona(p, false)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-slate-150 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 text-slate-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate">{p.roleTitle}</span>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold border ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.description}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPersona(p, true);
                    }}
                    disabled={isLoading}
                    className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    Giriş Yap
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
