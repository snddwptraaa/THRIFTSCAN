/**
 * Compresses and resizes an image File on the client side using HTML5 <canvas>.
 * Ensures max width/height of 1024px (configurable) and 0.7 JPEG quality
 * so payloads stay well under 1MB for /api/scan.
 */
export async function compressImageToBase64(
  file: File,
  maxDimension = 1024,
  quality = 0.7
): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();

  reader.onerror = () => {
    reject(new Error('Gagal membaca file gambar.'));
  };

  reader.onload = (event) => {
    const img = new Image();
    img.onerror = () => {
      reject(new Error('Format gambar tidak valid atau rusak.'));
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal menginisialisasi konteks kompresi kanvas.'));
        return;
      }

      // Fill warm cream background for transparent PNGs
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.src = event.target?.result as string;
  };

  reader.readAsDataURL(file);
  return promise;
}

/**
 * Generates a lightweight thumbnail (max 360px, quality 0.6) from an existing base64 data URL
 * so localStorage archive history stays fast and well within browser storage quotas.
 */
export async function createArchiveThumbnail(
  dataUrl: string,
  maxDimension = 360,
  quality = 0.6
): Promise<string> {
  const { promise, resolve } = Promise.withResolvers<string>();
  const img = new Image();

  img.onerror = () => resolve(dataUrl);
  img.onload = () => {
    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(dataUrl);
      return;
    }
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', quality));
  };

  img.src = dataUrl;
  return promise;
}
