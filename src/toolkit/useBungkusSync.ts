import { useEffect, useState, useCallback } from 'react';
import { useBungkus } from '../hooks/useBungkus'; // Sesuaikan path

type SyncStatus = 'offline' | 'online' | 'syncing' | 'error';

interface SyncConfig {
  autoSync?: boolean; // Otomatis upload pas online?
  onSuccess?: (response: any) => void;
  onError?: (err: any) => void;
}

export function useBungkusSync(
  formId: string, 
  apiCall: (data: any) => Promise<any>, // Fungsi fetch ke API backend
  config: SyncConfig = {}
) {
  const { autoSync = true } = config;
  const { values, buangBungkus } = useBungkus(formId);
  
  // Deteksi status network browser saat ini
  const [networkStatus, setNetworkStatus] = useState<SyncStatus>(
    navigator.onLine ? 'online' : 'offline'
  );

  // Fungsi Inti: Upload Data
  const triggerSync = useCallback(async () => {
    // Cek apakah ada data buat di-sync?
    const hasData = Object.keys(values).length > 0;
    
    if (!hasData) return;
    if (!navigator.onLine) {
      alert("⚠️ Masih Offline! Tunggu internet nyala.");
      return;
    }

    setNetworkStatus('syncing');
    console.log("🔄 BungkusSync: Mencoba upload data...");

    try {
      // 1. Panggil API user
      const response = await apiCall(values);
      
      // 2. Kalau sukses, panggil callback user
      if (config.onSuccess) config.onSuccess(response);
      
      // 3. Hapus data dari IndexedDB (Gudang bersih)
      buangBungkus();
      
      console.log("✅ BungkusSync: Upload sukses & Gudang dibersihkan!");
      setNetworkStatus('online');
      
    } catch (err) {
      console.error("❌ BungkusSync Gagal:", err);
      setNetworkStatus('error');
      if (config.onError) config.onError(err);
    }
  }, [values, apiCall, buangBungkus, config]);

  // Listener: Pantau status internet (Mati/Nyala)
  useEffect(() => {
    const updateNetworkStatus = () => {
      const currentlyOnline = navigator.onLine;
      setNetworkStatus(prev => {
        // Jangan override kalau lagi syncing
        if (prev === 'syncing') return prev;
        // Kalau error, bisa dikembalikan ke status normal
        return currentlyOnline ? 'online' : 'offline';
      });
    };

    const handleOnline = () => {
      console.log("🌐 Koneksi Kembali! (Online)");
      setNetworkStatus('online');
      if (autoSync) triggerSync(); 
    };

    const handleOffline = () => {
      console.log("🔌 Koneksi Terputus! (Offline)");
      setNetworkStatus('offline');
    };

    // Initial check
    updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling untuk memastikan status selalu akurat
    const interval = setInterval(updateNetworkStatus, 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync, autoSync]);

  return { 
    networkStatus, 
    triggerSync, // Bisa dipanggil manual via tombol
    hasPendingData: Object.keys(values).length > 0 
  };
}