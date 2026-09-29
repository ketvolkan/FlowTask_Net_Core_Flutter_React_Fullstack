import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Kanban, Lock, Mail, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Geçersiz e-posta veya şifre');
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
        {/* Brand Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {t('auth.loginTitle', 'Hesabınıza Giriş Yapın')}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          {t('auth.loginSubtitle', 'Görevlerinizi ve projelerinizi yönetmek için oturum açın.')}
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

          {/* Quick seeded demo credentials note */}
          <div className="mt-6 rounded-xl bg-indigo-50/60 p-3 border border-indigo-100/80 text-[11px] text-indigo-900 space-y-1">
            <p className="font-semibold text-indigo-700">Hazır Demo Hesapları:</p>
            <p>Admin: <span className="font-mono font-medium">admin@flowtask.com</span> / <span className="font-mono font-medium">Admin123*</span></p>
            <p>Demo: <span className="font-mono font-medium">demo@flowtask.com</span> / <span className="font-mono font-medium">Demo123*</span></p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            {t('auth.noAccount', 'Hesabınız yok mu?')}{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              {t('auth.registerNow', 'Hemen Kayıt Olun')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
