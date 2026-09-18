import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  showClose = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#04060C]/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} glass-panel-elevated rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 z-10 animate-scale-in text-slate-100 my-auto`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-white/8">
            <div>
              {title && <h3 className="text-xl font-bold text-white font-display tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
