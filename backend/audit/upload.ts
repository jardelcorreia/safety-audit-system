import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";

const photosBucket = new Bucket("audit-photos", {
  public: true
});

interface UploadUrlRequest {
  filename: string;
  contentType: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

// Generates a signed upload URL for audit photos.
export const getUploadUrl = api<UploadUrlRequest, UploadUrlResponse>(
  { expose: true, method: "POST", path: "/audits/upload-url" },
  async (req) => {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const extension = req.filename.split('.').pop() || 'jpg';
    const uniqueFilename = `audit-${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Generate signed upload URL
    const { url: uploadUrl } = await photosBucket.signedUploadUrl(uniqueFilename, {
      ttl: 3600 // 1 hour
    });

    // Generate public URL for the file
    const fileUrl = photosBucket.publicUrl(uniqueFilename);

    return {
      uploadUrl,
      fileUrl
    };
  }
);

interface DeletePhotoRequest {
  filename: string;
}

// Deletes an audit photo from storage.
export const deletePhoto = api<DeletePhotoRequest, void>(
  { expose: true, method: "DELETE", path: "/audits/photos/:filename" },
  async ({ filename }) => {
    await photosBucket.remove(filename);
  }
);
