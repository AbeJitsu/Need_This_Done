// ============================================================================
// TabletFrame — iPad-style edge-to-edge frame
// ============================================================================
// What: Wraps children (ScaledIframe) in a slim iPad bezel
// Why: Simplest device frame — uniform slim bezel, no chrome
// How: Aluminum gradient body with 7px padding, rounded corners

interface TabletFrameProps {
  children: React.ReactNode;
}

export default function TabletFrame({ children }: TabletFrameProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #2c2c2e 0%, #3a3a3c 2%, #2c2c2e 100%)',
        borderRadius: 14,
        padding: 7,
        boxShadow:
          '0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          background: '#000',
          borderRadius: 6,
          overflow: 'hidden',
          aspectRatio: '820 / 1180',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}
