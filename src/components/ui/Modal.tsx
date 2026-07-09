import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Ported from the .modal-overlay / .modal show/hide pattern in the
// original app.js (initModal(), initCampaigns()), generalized into one
// reusable component instead of one bespoke implementation per form.
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <div className={`modal ${isOpen ? 'show' : ''}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
