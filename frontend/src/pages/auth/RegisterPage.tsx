import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Kanban, Lock, Mail, User, Briefcase, Building, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        jobTitle: jobTitle.trim() || undefined,
        department: department.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Create Flowtask Account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Start collaborating on projects with your team
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
              label="Full Name"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Job Title"
                placeholder="e.g. Frontend Dev"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                leftIcon={<Briefcase className="h-4 w-4" />}
              />

              <Input
                label="Department"
                placeholder="e.g. Product"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                leftIcon={<Building className="h-4 w-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
