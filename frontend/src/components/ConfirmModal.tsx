import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-graphite border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted hover:text-pure transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDestructive ? 'bg-error/10 text-error' : 'bg-cobalt/10 text-cobalt'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-pure">{title}</h3>
        </div>

        <p className="text-sm text-muted mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-pure hover:bg-white/5 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-md ${
              isDestructive
                ? 'bg-error hover:bg-error/90 text-pure shadow-error/20'
                : 'bg-cobalt hover:bg-cobalt/90 text-pure shadow-cobalt/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
