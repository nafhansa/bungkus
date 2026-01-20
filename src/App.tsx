import React from 'react';
import { useBungkus } from './hooks/useBungkus';

function App() {
  const { values, status, daftarkan, buangBungkus } = useBungkus('form-rahasia-v2', {
    kadaluarsa: 1, 
    rahasia: true 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('✅ Terkirim! Cek Application > Storage > IndexedDB untuk lihat data yang terenkripsi.');
    buangBungkus();
  };

  if (status === 'memulihkan') return <div style={{padding:'50px', textAlign:'center'}}>🔐 Membuka Brankas...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>📦 Bungkus <span style={{fontSize:'0.6em', background:'red', color:'white', padding:'2px 8px', borderRadius:'10px'}}>PRO</span></h1>
      <p>Data form ini <strong>Terenkripsi</strong> & <strong>Auto-Hapus</strong> dalam 1 jam.</p>
      
      {Object.keys(values).length > 0 && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          ✨ Data dipulihkan! (Coba inspect Element, di DB isinya acak-acakan lho)
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Secret Agent Name:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '10px' }}
            {...daftarkan('codename')} 
            placeholder="Ketik rahasia disini..."
          />
        </div>

        <div>
          <label>Misi Rahasia (Dokumen):</label>
          <input type="file" {...daftarkan('dokumen_misi')} />
          
          {values['dokumen_misi'] && values['dokumen_misi'] instanceof File && (
            <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
              📄 File Ready: <strong>{(values['dokumen_misi'] as File).name}</strong>
            </div>
          )}
        </div>

        <button type="submit" style={{ padding: '12px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>
          🔒 Kirim Data Aman
        </button>
      </form>

      <div style={{ marginTop: '50px', fontSize: '0.8em', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <strong>Cara Buktikan Enkripsi:</strong><br/>
        Inspect &gt; Application &gt; IndexedDB &gt; keyval-store &gt; bungkus-form-rahasia-v2.<br/>
        Lihat value <code>codename</code>, pasti isinya aneh (contoh: <code>🔒=02bj5SZwl...</code>)
      </div>
    </div>
  );
}

export default App;