import crypto from 'crypto';

export interface UploadedImage {
  id: string;
  storageKey: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export const uploadService = {
  /**
   * Simulate image upload to object storage.
   * In production, this would stream to S3/GCS and return a real CDN URL.
   * For now, we accept a dataUrl (base64) and return a simulated storage result.
   */
  uploadImage(dataUrl?: string, filename?: string): UploadedImage {
    const key = `prop_img_${Date.now()}_${crypto.randomUUID().slice(0, 6)}.jpg`;
    const url = dataUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80';

    return {
      id: 'img_' + crypto.randomUUID().slice(0, 8),
      storageKey: key,
      url,
      thumbnailUrl: url,
      sortOrder: 0,
      isCover: false,
      createdAt: new Date().toISOString(),
    };
  },
};
