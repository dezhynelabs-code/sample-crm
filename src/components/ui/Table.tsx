import type { TableHTMLAttributes, ReactNode } from 'react';

// Wraps the existing .table class so every data table in the app shares
// one component instead of re-typing className="table" everywhere.
export function Table({ children, className = '', ...rest }: TableHTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
  return (
    <table className={`table ${className}`.trim()} {...rest}>
      {children}
    </table>
  );
}
