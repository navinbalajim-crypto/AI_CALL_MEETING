import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, ai
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B16] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-5 py-3 gap-2.5",
  };

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-glow-sm hover:shadow-glow-md focus:ring-primary border border-primary-soft/30",
    secondary: "bg-surface-elevated hover:bg-surface-highlight text-white border border-white/10 hover:border-white/20 focus:ring-slate-400",
    outline: "bg-transparent hover:bg-white/5 text-slate-200 border border-white/15 hover:border-white/30 focus:ring-primary",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-transparent focus:ring-slate-500",
    danger: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 focus:ring-rose-500",
    ai: "bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white shadow-glow-ai focus:ring-accent border border-ai/30",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
