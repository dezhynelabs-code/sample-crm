import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  span?: 4 | 6 | 8 | 12;
  children: ReactNode;
}

// Wraps the existing .card / .span-N grid classes.
export function Card({ span, className = '', children, ...rest }: CardProps) {
  const spanClass = span ? `span-${span}` : '';
  return (
    <div className={`card ${spanClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-header ${className}`.trim()}>{children}</div>;
}
