export async function compressImage(file: File, quality = 0.7, maxWidth = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error("BungkusCompressor: Bukan file gambar woy!"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const elem = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        
        elem.width = maxWidth;
        elem.height = img.height * scaleFactor;

        const ctx = elem.getContext('2d');
        ctx?.drawImage(img, 0, 0, elem.width, elem.height);

        ctx?.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Gagal compress"));
          }
        }, 'image/jpeg', quality);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}