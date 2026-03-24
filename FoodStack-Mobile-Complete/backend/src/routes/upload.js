/**
 * Upload Routes
 * Handles file upload endpoints
 */

const express = require('express');
const { UploadController, uploadSingle, uploadMultiple } = require('../controller/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private
 */
router.post('/image', authenticateToken, uploadSingle, UploadController.uploadImage);

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private
 */
router.post('/images', authenticateToken, uploadMultiple, UploadController.uploadMultipleImages);

/**
 * @route   DELETE /api/v1/upload/image/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image/:publicId', authenticateToken, UploadController.deleteImage);

/**
 * @route   POST /api/v1/upload/signature
 * @desc    Get Cloudinary upload signature for direct uploads
 * @access  Private
 */
router.post('/signature', authenticateToken, UploadController.getUploadSignature);

module.exports = router;