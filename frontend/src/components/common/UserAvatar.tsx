import React from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeMap = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
    xl: 'h-14 w-14 text-lg',
  };

  const getBackgroundColor = (str: string) => {
    const colors = [
      'bg-indigo-500',
      'bg-blue-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-purple-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 shadow-sm ${sizeMap[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm ring-1 ring-white ${getBackgroundColor(
        name
      )} ${sizeMap[size]} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
