import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Ported from the .drawer-overlay / .drawer show/hide pattern used for
// the Lead Details drawer in the original app.js.
export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
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
      <div className={`drawer-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'show' : ''}`}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="close-drawer-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="drawer-content">{children}</div>
      </div>
    </>
  );
}
