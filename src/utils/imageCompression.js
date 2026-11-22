const loadImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error(`Failed to read image: ${file.name}`));
  };
  image.src = objectUrl;
});

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Unable to compress image.'));
      return;
    }
    resolve(blob);
  }, type, quality);
});

export const compressImage = async (file, {
  maxDimension = 1600,
  targetBytes = 900 * 1024,
} = {}) => {
  if (!file.type.startsWith('image/')) return file;

  const image = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  while (blob.size > targetBytes && quality > 0.55) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (blob.size >= file.size) return file;
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

export const prepareImagesForUpload = async (files, options) => {
  const compressed = await Promise.all(files.map((file) => compressImage(file, options)));
  const totalBytes = compressed.reduce((sum, file) => sum + file.size, 0);
  return { files: compressed, totalBytes };
};
