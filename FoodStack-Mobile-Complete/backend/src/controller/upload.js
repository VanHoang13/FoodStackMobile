/**
 * Upload Controller
 * Handles file uploads to Cloudinary
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { promisify } = require('util');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

class UploadController {
  /**
   * Upload single image to Cloudinary
   * POST /api/v1/upload/image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      const { folder = 'foodstack' } = req.body;

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `foodstack/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * POST /api/v1/upload/images
   */
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided',
        });
      }

      const { folder = 'foodstack' } = req.body;
      const uploadPromises = [];

      for (const file of req.files) {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `foodstack/${folder}`,
              resource_type: 'image',
              transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' },
                { format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes,
                });
              }
            }
          );

          uploadStream.end(file.buffer);
        });

        uploadPromises.push(uploadPromise);
      }

      const uploadResults = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: uploadResults,
          count: uploadResults.length,
        },
      });

    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Delete image from Cloudinary
   * DELETE /api/v1/upload/image/:publicId
   */
  async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required',
        });
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        res.status(200).json({
          success: true,
          message: 'Image deleted successfully',
          data: result,
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found or already deleted',
          data: result,
        });
      }

    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Get Cloudinary upload signature (for direct uploads)
   * POST /api/v1/upload/signature
   */
  async getUploadSignature(req, res) {
    try {
      const { folder = 'foodstack' } = req.body;
      const timestamp = Math.round(new Date().getTime() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: `foodstack/${folder}`,
        },
        process.env.CLOUDINARY_API_SECRET
      );

      res.status(200).json({
        success: true,
        data: {
          signature,
          timestamp,
          api_key: process.env.CLOUDINARY_API_KEY,
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          folder: `foodstack/${folder}`,
        },
      });

    } catch (error) {
      console.error('Signature error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload signature',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

// Middleware for single file upload
const uploadSingle = upload.single('image');

// Middleware for multiple files upload
const uploadMultiple = upload.array('images', 10); // Max 10 files

module.exports = {
  UploadController: new UploadController(),
  uploadSingle,
  uploadMultiple,
};