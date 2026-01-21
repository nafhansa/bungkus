// PERBAIKAN DI BARIS INI: tambah 'type' sebelum CSSProperties
import { useState, useEffect, type CSSProperties } from 'react';
import { useBungkus } from '../hooks/useBungkus'; 
import { gudang } from '../core/storage';

interface DevToolsProps {
  formId: string;
  position?: 'bottom-right' | 'bottom-left';
  refreshInterval?: number;
}

export function BungkusDevTools({ formId, position = 'bottom-right', refreshInterval = 250 }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { buangBungkus } = useBungkus(formId);
  
  const [values, setValues] = useState<any>({});
  const [status, setStatus] = useState<'idle' | 'memulihkan' | 'siap'>('idle');
  const [size, setSize] = useState('0 B');
  const [displayJson, setDisplayJson] = useState('');

  // Real-time Polling: Fetch langsung dari IndexedDB
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setStatus('memulihkan');
        const data = await gudang.bongkar(formId, 24, true);
        if (isMounted) {
          setValues(data || {});
          setStatus('siap');
        }
      } catch (err) {
        console.error('DevTools fetch error:', err);
        if (isMounted) setStatus('siap');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [formId, refreshInterval]);

  // Effect: Auto Refresh Data & Size
  useEffect(() => {
    const jsonString = JSON.stringify({
       ...values,
       bukti: values?.bukti instanceof Blob 
         ? `[Blob Object: ${values.bukti.type} - ${(values.bukti.size / 1024).toFixed(2)} KB]` 
         : values?.bukti
    }, null, 2);
    
    setDisplayJson(jsonString);

    const bytes = new Blob([JSON.stringify(values)]).size;
    let blobSize = 0;
    if (values) {
        Object.values(values).forEach(val => {
        if (val instanceof Blob) blobSize += val.size;
        });
    }
    
    const total = bytes + blobSize;
    const k = 1024;
    if (total === 0) { setSize('0 B'); return; }
    const i = Math.floor(Math.log(total) / Math.log(k));
    const sizes = ['B', 'KB', 'MB', 'GB'];
    setSize(parseFloat((total / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]);
    
  }, [values]);

  // --- THEME SETTINGS ---
  const theme = {
    bg: 'rgba(255, 255, 255, 0.95)',
    border: '#E5E7EB',
    brandLight: '#ECFDF5', 
    brandPrimary: '#059669',
    textMain: '#1F2937',
    textMuted: '#6B7280',
    danger: '#DC2626',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
  };

  const baseStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    bottom: '24px',
    right: position === 'bottom-right' ? '24px' : 'auto',
    left: position === 'bottom-left' ? '24px' : 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  // --- TRIGGER BUTTON ---
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          width: '64px', height: '64px',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
          padding: 0
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Open Bungkus DevTools"
      >
        {/* LOGO CONTAINER (Background Hijau Muda) */}
        <div style={{ 
          width: '40px', height: '40px', 
          background: theme.brandLight, 
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <img src="/bungkus_square.png" alt="⚡" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </div>
        
        {/* Status Dot */}
        <div style={{
          position: 'absolute', top: -2, right: -2,
          width: '12px', height: '12px', borderRadius: '50%',
          backgroundColor: status === 'siap' ? '#10B981' : '#F59E0B',
          border: '2px solid white'
        }} />
      </button>
    );
  }

  // --- MAIN PANEL ---
  return (
    <div style={{
      ...baseStyle,
      width: '400px',
      background: theme.bg,
      borderRadius: '24px',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* HEADER */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: '32px', height: '32px', background: theme.brandLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/bungkus_square.png" alt="B" style={{ width: '20px', height: '20px' }} />
           </div>
           <div>
             <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: theme.textMain }}>Bungkus DevTools</h3>
             <span style={{ fontSize: '11px', color: theme.brandPrimary, fontWeight: '600' }}>Live Inspector</span>
           </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: theme.textMuted, padding: '4px' }}
        >✕</button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        
        {/* STATUS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <StatusCard label="Storage Status" value={status === 'siap' ? 'READY' : status.toUpperCase()} color={status === 'siap' ? theme.brandPrimary : '#D97706'} bg={theme.brandLight} />
          <StatusCard label="Est. Size" value={size} color={theme.textMain} bg="#F3F4F6" />
        </div>

        {/* FORM ID */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>FORM ID</label>
          <div style={{ background: '#F9FAFB', border: `1px solid ${theme.border}`, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: theme.textMain }}>
            {formId}
          </div>
        </div>

        {/* LIVE JSON */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
             <label style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted }}>LIVE DATA</label>
             <span style={{ fontSize: '10px', background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>JSON</span>
          </div>
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px', overflow: 'auto', maxHeight: '200px' }}>
            <pre style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {displayJson}
            </pre>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '16px', borderTop: `1px solid ${theme.border}`, background: '#F9FAFB' }}>
        <button 
          onClick={() => { if(confirm('Hapus semua data form ini?')) buangBungkus(); }}
          style={{ 
            width: '100%', padding: '10px', 
            background: '#FEF2F2', color: theme.danger, border: '1px solid #FECACA', 
            borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <IconTrash /> Force Clear Storage
        </button>
      </div>
    </div>
  );
}

// Sub-components
const StatusCard = ({ label, value, color, bg }: any) => (
  <div style={{ background: bg, padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600', marginBottom: '2px' }}>{label.toUpperCase()}</span>
    <span style={{ fontSize: '14px', fontWeight: '700', color: color }}>{value}</span>
  </div>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);