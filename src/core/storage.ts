import { set, get, del } from 'idb-keyval';

export interface BungkusanData {
  [key: string]: string | number | boolean | Blob | File | null | undefined;
}

const acak = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str)).split('').reverse().join('');
  } catch (e) { return str; }
};

const susun = (str: string): string => {
  try {
    return decodeURIComponent(atob(str.split('').reverse().join('')));
  } catch (e) { return str; }
};

export const gudang = {
  simpan: async (formId: string, data: BungkusanData, encrypt: boolean = true) => {
    try {
      const dataAman: BungkusanData = { ...data };
      
      dataAman['_timestamp'] = Date.now();

      if (encrypt) {
        for (const key in dataAman) {
          const val = dataAman[key];
          if (typeof val === 'string' && key !== '_timestamp') {
            dataAman[key] = `🔒${acak(val)}`;
          }
        }
      }

      await set(`bungkus-${formId}`, dataAman);
    } catch (err) {
      console.error("Gagal membungkus:", err);
    }
  },

  bongkar: async (formId: string, expiryHours: number, decrypt: boolean = true): Promise<BungkusanData | null> => {
    const rawData = await get<BungkusanData>(`bungkus-${formId}`);
    if (!rawData) return null;

    const timestamp = rawData['_timestamp'] as number;
    const umurData = Date.now() - timestamp;
    const batasUmur = expiryHours * 60 * 60 * 1000;

    if (umurData > batasUmur) {
      console.warn(`🗑️ [Bungkus] Data '${formId}' sudah basi (${Math.floor(umurData/60000)} menit). Dibuang.`);
      await del(`bungkus-${formId}`);
      return null;
    }

    const dataBersih: BungkusanData = { ...rawData };
    delete dataBersih['_timestamp'];

    if (decrypt) {
      for (const key in dataBersih) {
        const val = dataBersih[key];
        if (typeof val === 'string' && val.startsWith('🔒')) {
          dataBersih[key] = susun(val.substring(2));
        }
      }
    }

    return dataBersih;
  },

  buang: async (formId: string) => {
    await del(`bungkus-${formId}`);
  }
};