# 📦 Install New Dependencies

## Required Package Installation

To enable image upload functionality for menu items, you need to install the new dependency:

```bash
cd FoodStack-Mobile-Complete/mobile-app
npm install
```

This will install:
- `expo-image-picker@~16.0.0` - For selecting images from device gallery

## Verification

After installation, you can verify the package is installed:

```bash
npm list expo-image-picker
```

## Usage

The image picker is now integrated into:
- **AddMenuItemScreen**: Select images when creating new menu items
- **EditMenuItemScreen**: Update images for existing menu items

## Permissions

The app will automatically request media library permissions when users try to select images. No additional configuration needed for Expo managed workflow.