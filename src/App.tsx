import { useEffect, useState } from 'react';
import { useBungkus } from './hooks/useBungkus';
import { useBungkusSync } from './toolkit/useBungkusSync';

const mockApiSubmit = async (data: any) => {
  console.log("📦 Data diterima Server:", data); 

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.1 
        ? resolve({ status: 200, message: "Data received!" }) 
        : reject("Internal Server Error");
    }, 2500);
  });
};

const IconRefresh = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconImage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;

function App() {
  const [isCompressEnabled, setCompressEnabled] = useState(true);
  const { daftarkan, buangBungkus, status, values } = useBungkus('showcase-form-v1', {
    rahasia: true,
    kadaluarsa: 24,
    compress: isCompressEnabled
  });

  const { networkStatus, triggerSync, hasPendingData } = useBungkusSync(
    'showcase-form-v1',
    mockApiSubmit,
    {
      autoSync: true,
      onSuccess: (res) => {
        alert(`✅ Data Terkirim ke Server!\nRespon: ${res}`);
        setPreviewUrl(null);
      },
      onError: () => alert("❌ Gagal upload, coba lagi nanti.")
    }
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (values?.bukti instanceof Blob) {
      const url = URL.createObjectURL(values.bukti);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [values?.bukti]);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const registerBukti = daftarkan('bukti');

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Inter', sans-serif", padding: '40px 20px', color: '#1f2937' }}>
      
      {/* 📦 CONTAINER UTAMA */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* HEADER: LOGO & BRANDING */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
            <img src="/bungkus.png" alt="Bungkus Toolkit" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em' }}>Bungkus Toolkit</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Offline-first storage with Auto-Compression.</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{ 
              background: status === 'siap' ? '#ecfdf5' : '#fffbeb', 
              color: status === 'siap' ? '#047857' : '#b45309',
              padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', border: status === 'siap' ? '1px solid #a7f3d0' : '1px solid #fcd34d'
            }}>
              ● {status.toUpperCase()}
            </span>
            <span style={{ 
              background: networkStatus === 'online' ? '#dbeafe' : 
                         networkStatus === 'offline' ? '#fee2e2' : 
                         networkStatus === 'syncing' ? '#fef3c7' : '#fecaca',
              color: networkStatus === 'online' ? '#1e40af' : 
                     networkStatus === 'offline' ? '#991b1b' : 
                     networkStatus === 'syncing' ? '#92400e' : '#991b1b',
              padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', 
              border: networkStatus === 'online' ? '1px solid #93c5fd' : 
                      networkStatus === 'offline' ? '1px solid #fca5a5' : 
                      networkStatus === 'syncing' ? '1px solid #fde047' : '1px solid #fca5a5'
            }}>
              {networkStatus === 'online' ? 'ONLINE' : 
               networkStatus === 'offline' ? 'OFFLINE' : 
               networkStatus === 'syncing' ? 'SYNCING' : 'ERROR'}
            </span>
          </div>
        </div>
        {/* 🛠️ MAIN CARD */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
          
          {/* TOOLBAR */}
          <div style={{ padding: '15px 25px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuration</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <div style={{ position: 'relative', width: '40px', height: '22px', background: isCompressEnabled ? '#10b981' : '#d1d5db', borderRadius: '99px', transition: '0.3s' }}>
                <div style={{ position: 'absolute', top: '2px', left: isCompressEnabled ? '20px' : '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
              <input type="checkbox" checked={isCompressEnabled} onChange={(e) => setCompressEnabled(e.target.checked)} style={{ display: 'none' }} />
              <span>Smart Compress</span>
            </label>
          </div>

          <div style={{ padding: '30px' }}>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if(confirm('Nuke storage?')) { buangBungkus(); setPreviewUrl(null); }
            }}>
              
              {/* INPUT FIELDS */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    {...daftarkan('nama')} 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '15px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Biography</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell us about yourself..."
                    {...daftarkan('bio')}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* FILE UPLOAD AREA */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Proof of ID</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      {...registerBukti}
                      value={undefined} // 👈 THE FIX
                      onChange={(e) => {
                        registerBukti.onChange(e); 
                        if (e.target.files?.[0]) setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px dashed #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
                    />
                    <div style={{ position: 'absolute', right: '15px', top: '12px', pointerEvents: 'none', color: '#9ca3af' }}>
                      <IconImage />
                    </div>
                  </div>
                </div>

                {/* PREVIEW CARD (THE KILLER FEATURE) */}
                {previewUrl && values.bukti instanceof Blob && (
                  <div style={{ marginTop: '10px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#065f46' }}>Successfully Bungkus-ed!</h4>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#047857' }}>
                        <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          📉 {formatSize(values.bukti.size)}
                        </span>
                        <span style={{ opacity: 0.8 }}>{values.bukti.type}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '30px' }}>
                <button 
                  type="button" 
                  onClick={() => window.location.reload()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: '0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <IconRefresh /> Refresh Page
                </button>
                
                <button 
                  type="button"
                  onClick={triggerSync}
                  disabled={networkStatus === 'syncing' || !hasPendingData}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: networkStatus === 'syncing' || !hasPendingData ? '#9ca3af' : '#10b981', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: networkStatus === 'syncing' || !hasPendingData ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)', transition: '0.2s', opacity: networkStatus === 'syncing' || !hasPendingData ? 0.6 : 1 }}
                  onMouseOver={(e) => { if (networkStatus !== 'syncing' && hasPendingData) e.currentTarget.style.filter = 'brightness(110%)' }}
                  onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(100%)'}
                >
                  {networkStatus === 'syncing' ? '☁️ Mengirim ke Server Cloud...' : 
                   networkStatus === 'offline' ? '💾 Simpan Offline (Menunggu WiFi)' : 
                   '🚀 Submit ke Server'}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* 🕵️ DARK MODE DEBUGGER */}
        <div style={{ marginTop: '40px', background: '#111827', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ background: '#1f2937', padding: '10px 20px', display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>gudang-inspector.json</span>
          </div>
          <div style={{ padding: '20px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '12px', color: '#a5b4fc', lineHeight: '1.5' }}>
{`// Data yang tersimpan di IndexedDB (locally)
{
  "status": "${status}",
  "form_id": "showcase-form-v1",
  "data": ${JSON.stringify({
    ...values,
    bukti: values.bukti ? `[Blob: ${formatSize((values.bukti as Blob).size)}]` : null
  }, null, 2)}
}`}
            </pre>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '30px', color: '#9ca3af', fontSize: '12px' }}>
          Built with 🥡 <strong>Bungkus Toolkit</strong> • Offline First • Auto Compression
        </p>

      </div>
    </div>
  )
}

export default App