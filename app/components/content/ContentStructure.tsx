import type { ReactNode } from 'react';

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function ContentSection({ children, className }: ContentWrapperProps) {
  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

export function ContentItem({ children, className }: ContentWrapperProps) {
  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

export function ContentCollection({ children, className }: ContentWrapperProps) {
  return <div className={className}>{children}</div>;
}

export function ContentValue({ children }: ContentWrapperProps) {
  return <>{children}</>;
}
