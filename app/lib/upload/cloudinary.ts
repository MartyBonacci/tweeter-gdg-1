import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or data URL
 * @param folder - Cloudinary folder (default: 'avatars')
 * @returns Cloudinary URL
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder = 'avatars'
): Promise<string> {
  try {
    // Convert Buffer to base64 data URL if needed
    let dataUrl: string;
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64');
      dataUrl = `data:image/jpeg;base64,${base64}`;
    } else {
      dataUrl = file;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failure shouldn't block the operation
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
