import { useState, useEffect, useCallback } from 'react';
import { gudang, type BungkusanData } from '../core/storage';

interface BungkusConfig {
  kadaluarsa?: number;
  rahasia?: boolean;
}

export function useBungkus(formId: string, config: BungkusConfig = {}) {
  const { kadaluarsa = 24, rahasia = true } = config;

  const [values, setValues] = useState<BungkusanData>({});
  const [status, setStatus] = useState<'idle' | 'memulihkan' | 'siap'>('idle');

  useEffect(() => {
    let isMounted = true;

    const cekGudang = async () => {
      setStatus('memulihkan');
      try {
        const dataLama = await gudang.bongkar(formId, kadaluarsa, rahasia);
        
        if (isMounted && dataLama) {
          setValues(dataLama);
          console.log("✨ Data dipulihkan dari brankas!");
        }
      } catch (e) {
        console.error("Gagal restore:", e);
      } finally {
        if (isMounted) setStatus('siap');
      }
    };

    cekGudang();
    return () => { isMounted = false; };
  }, [formId, kadaluarsa, rahasia]);

  const bungkus = useCallback((key: string, value: any) => {
    setValues((prev) => {
      const newData = { ...prev, [key]: value };
      
      gudang.simpan(formId, newData, rahasia);
      
      return newData;
    });
  }, [formId, rahasia]);

  const daftarkan = (key: string) => {
    return {
      name: key,
      value: values[key] instanceof File ? undefined : (values[key] as string) || '',
      
      onChange: (e: any) => {
        const file = e.target.files ? e.target.files[0] : null;
        const isi = file || e.target.value;
        bungkus(key, isi);
      }
    };
  };

  const buangBungkus = () => {
    setValues({});
    gudang.buang(formId);
  };

  return { values, status, daftarkan, buangBungkus };
}