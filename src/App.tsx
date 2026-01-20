import { useBungkus } from './hooks/useBungkus';
import { useEffect, useState } from 'react';

function App() {
  // Ambil 'values' juga dari hook buat ngecek data mentahnya
  const { daftarkan, buangBungkus, status, values } = useBungkus('test-form-dev', {
    rahasia: true,
    kadaluarsa: 24
  });

  // State buat preview gambar
  const [preview, setPreview] = useState<string | null>(null);

  // Efek: Kalau 'values.bukti' ada isinya (dari IndexedDB), bikin URL preview
  useEffect(() => {
    if (values?.bukti instanceof Blob) {
      const url = URL.createObjectURL(values.bukti);
      setPreview(url);
      
      // Bersihin memori pas component unmount
      return () => URL.revokeObjectURL(url);
    }
  }, [values?.bukti]);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>📦 Bungkus Playground</h2>
      
      {/* Indikator Status */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        background: status === 'siap' ? '#d4edda' : '#fff3cd',
        borderRadius: '5px',
        color: status === 'siap' ? '#155724' : '#856404'
      }}>
        Status Engine: <strong>{status.toUpperCase()}</strong>
      </div>
      
      <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
        <form onSubmit={(e) => { e.preventDefault(); alert('Tersimpan & Dibuang!'); buangBungkus(); setPreview(null); }}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              {...daftarkan('username')} 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Catatan Rahasia</label>
            <textarea 
              rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              {...daftarkan('notes')} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Upload KTP / Bukti</label>
            
            {/* INPUT FILE ASLI */}
            <input 
              type="file" 
              accept="image/*"
              {...daftarkan('bukti')} 
              // Tambahan: Pas user pilih file baru, update preview langsung
              onChange={(e) => {
                daftarkan('bukti').onChange(e); // Panggil handler bawaan bungkus
                if (e.target.files?.[0]) {
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />

            {/* AREA PREVIEW: Ini kuncinya! */}
            {preview && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '8px', border: '1px dashed #aaa', textAlign: 'center' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'green' }}>✓ File Tersimpan Aman</p>
                <img 
                  src={preview} 
                  alt="Preview Bukti" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} 
                />
              </div>
            )}
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Submit & Clear Storage
          </button>
        </form>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '20px', lineHeight: '1.5' }}>
        <strong>Cara Tes:</strong><br/>
        1. Isi Username & Upload Gambar.<br/>
        2. Refresh Browser.<br/>
        3. Input file emang bakal kosong (itu security browser), tapi lihat <strong>Preview Gambar</strong> di bawahnya. Kalau muncul, berarti <strong>SUKSES!</strong>
      </p>
    </div>
  )
}

export default App