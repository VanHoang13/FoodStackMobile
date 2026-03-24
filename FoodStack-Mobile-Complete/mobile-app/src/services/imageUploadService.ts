import * as ImagePicker from 'expo-image-picker';
import { getApiBaseUrl } from './api-config';
import AuthService from './authService';

const API_BASE_URL = getApiBaseUrl();

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ImageUploadService {
  private static instance: ImageUploadService;

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  // Request camera and media library permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraStatus === 'granted' && mediaStatus === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Pick image from gallery
  async pickImageFromGallery(): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Cần cấp quyền truy cập thư viện ảnh');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Aspect ratio for branch images
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      return null;
    }
  }

  // Take photo with camera
  async takePhoto(): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Cần cấp quyền truy cập camera');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9], // Aspect ratio for branch images
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  // Upload image to Cloudinary via backend
  async uploadImage(imageUri: string, folder: string = 'branches'): Promise<ImageUploadResult> {
    try {
      console.log('🔍 Checking authentication for image upload...');
      
      // Check if user is authenticated
      const isAuth = await AuthService.isAuthenticated();
      console.log('🔐 Is authenticated:', isAuth);
      
      const token = await AuthService.getAccessToken();
      console.log('🎫 Token found:', !!token);
      
      if (!token) {
        console.error('❌ No access token found');
        return {
          success: false,
          error: 'Vui lòng đăng nhập lại để upload ảnh'
        };
      }
      
      console.log('✅ Token available, proceeding with upload...');

      // Create FormData
      const formData = new FormData();
      
      // Get file extension
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `branch_${Date.now()}.${fileExtension}`;
      
      // Add image to FormData
      formData.append('image', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);
      
      formData.append('folder', folder);

      const response = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      if (result.success && result.data?.url) {
        return {
          success: true,
          url: result.data.url
        };
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload directly to Cloudinary (fallback method)
  async uploadToCloudinaryDirect(imageUri: string): Promise<ImageUploadResult> {
    try {
      // This would require Cloudinary credentials on the client side
      // For security, it's better to use the backend upload endpoint
      // But keeping this as a fallback option
      
      const cloudName = 'dsqym4qpr'; // From your .env
      const uploadPreset = 'foodstack_branches'; // You need to create this preset in Cloudinary
      
      const formData = new FormData();
      
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `branch_${Date.now()}.${fileExtension}`;
      
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);
      
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'branches');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      return {
        success: true,
        url: result.secure_url
      };

    } catch (error) {
      console.error('Error uploading to Cloudinary direct:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Show image picker options
  async showImagePickerOptions(): Promise<string | null> {
    return new Promise((resolve) => {
      // This will be handled by the UI component
      // Return null for now, actual implementation in the component
      resolve(null);
    });
  }
}

export default ImageUploadService.getInstance();