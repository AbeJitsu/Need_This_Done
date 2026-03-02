import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Device Preview - Admin | NeedThisDone',
  description: 'Preview the site across desktop, tablet, and phone breakpoints.',
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        // Negate admin layout padding so the dark bg goes edge-to-edge
        margin: '-1.5rem -1.5rem -1.5rem -1.5rem',
        padding: '48px 40px 60px',
        minHeight: '100vh',
        background: '#0a0c10',
        color: '#f0f0f2',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
