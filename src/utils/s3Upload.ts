import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION,
});

const s3 = new AWS.S3();

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadFileToS3 = async (
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const uploadParams = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read' as const,
    };

    const upload = s3.upload(uploadParams);

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress({
          loaded: progress.loaded,
          total: progress.total,
          percentage,
        });
      });
    }

    upload.send((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const deleteParams = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};