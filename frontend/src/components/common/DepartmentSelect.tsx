import React, { useState, useRef, useEffect } from 'react';
import { useDepartments } from '../../context/DepartmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, ChevronDown, Check, Plus, Search, Sparkles } from 'lucide-react';

interface DepartmentSelectProps {
  label?: string;
  value: string;
  onChange: (deptName: string) => void;
  allowCreate?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  label = 'Departman',
  value,
  onChange,
  allowCreate = true,
  required = false,
  className = '',
  placeholder = 'Departman seçiniz...',
}) => {
  const { departments, addDepartment } = useDepartments();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const created = addDepartment(newDeptName.trim());
    onChange(created.name);
    setNewDeptName('');
    setIsCreating(false);
    setIsOpen(false);
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition-all cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            value ? 'border-slate-300' : 'border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span className={value ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-full min-w-[260px] rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 border border-slate-200 py-1.5 animate-scale-in flex flex-col max-h-72">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Departman ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Department List */}
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5 max-h-44">
              {filteredDepts.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400">
                  Eşleşen departman bulunamadı.
                </div>
              ) : (
                filteredDepts.map((d) => {
                  const isSelected = value === d.name;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        onChange(d.name);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors text-left ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{d.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Inline Department Creation for Managers */}
            {allowCreate && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                {!isCreating ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(true);
                      setTimeout(() => createInputRef.current?.focus(), 50);
                    }}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Yeni Departman Oluştur</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateNew} className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        ref={createInputRef}
                        type="text"
                        placeholder="Örn: Mobil Geliştirme..."
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer shadow-2xs"
                      >
                        Ekle
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
