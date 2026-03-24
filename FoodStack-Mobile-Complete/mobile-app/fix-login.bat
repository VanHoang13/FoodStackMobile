@echo off
echo ========================================
echo    FIX LOGIN ABORT ERROR - AUTO SCRIPT
echo ========================================
echo.

echo 🧹 Clearing Metro cache...
call npx expo start --clear --reset-cache

echo.
echo ✅ Cache cleared! 
echo.
echo 📱 Next steps:
echo 1. Force close mobile app completely
echo 2. Open mobile app again  
echo 3. Try login with: owner@foodstack.test / password123
echo.
echo 🎯 Expected result: Login should work without AbortError
echo.
pause