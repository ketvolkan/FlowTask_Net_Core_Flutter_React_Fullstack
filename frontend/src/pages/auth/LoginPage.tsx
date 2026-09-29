import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Kanban, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
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
      setError(e.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Welcome to Flowtask
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enterprise project management and team collaboration
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
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Password"
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
              Sign In
            </Button>
          </form>

          {/* Quick seeded demo credentials note */}
          <div className="mt-6 rounded-xl bg-indigo-50/60 p-3 border border-indigo-100/80 text-[11px] text-indigo-900 space-y-1">
            <p className="font-semibold text-indigo-700">Seeded Demo Account:</p>
            <p>Admin: <span className="font-mono font-medium">admin@flowtask.com</span> / <span className="font-mono font-medium">Admin123*</span></p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
