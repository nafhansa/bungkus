import { useEffect, useRef } from 'react';
import { useBungkus } from '../hooks/useBungkus';

export function useBungkusLive(formId: string) {
  const { values, setValues, daftarkan, status, buangBungkus } = useBungkus(formId);
  
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const channel = new BroadcastChannel(`bungkus-live-${formId}`);

    channel.onmessage = (event) => {
      if (JSON.stringify(event.data) !== JSON.stringify(values)) {
        console.log('📡 BungkusLive: Sinkronisasi data masuk...');
        
        isRemoteUpdate.current = true;
        setValues(event.data); 
      }
    };

    return () => channel.close();
  }, [formId, values, setValues]);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (Object.keys(values).length > 0) {
      const channel = new BroadcastChannel(`bungkus-live-${formId}`);
      channel.postMessage(values);
      channel.close();
    }
  }, [values, formId]);

  return { values, status, daftarkan, buangBungkus };
}

