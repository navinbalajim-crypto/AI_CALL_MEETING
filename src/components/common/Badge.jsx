import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default, emerald, indigo, purple, sky, amber, rose, ai
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 gap-1",
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-sm px-3 py-1 gap-1.5",
  };

  const variantStyles = {
    default: "bg-surface-elevated text-slate-300 border border-white/10",
    emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    indigo: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    sky: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
    amber: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    ai: "bg-ai/15 text-ai border border-ai/30",
  };

  const dotColors = {
    default: "bg-slate-400",
    emerald: "bg-emerald-400",
    indigo: "bg-indigo-400",
    purple: "bg-purple-400",
    sky: "bg-sky-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    ai: "bg-ai",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-current'}`} />}
      {children}
    </span>
  );
};

export default Badge;
