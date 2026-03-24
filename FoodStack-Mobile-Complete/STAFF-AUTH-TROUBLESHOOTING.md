# Staff Management Authentication Troubleshooting

## Issue: "Invalid or expired access token" Error

If you're seeing this error when trying to access staff management features, it means there's an authentication problem.

## Solution

### Step 1: Check Current User
The staff management features require an **OWNER** or **MANAGER** account. Customer accounts cannot access these features.

### Step 2: Login with Owner Account
Use these credentials to login:
- **Email**: `owner@foodstack.test`
- **Password**: `password123`

### Step 3: Verify Login
After logging in, check the console logs to see:
```
✅ User authenticated with role: OWNER
```

### Step 4: If Still Having Issues

1. **Clear App Data**: 
   - Close the mobile app completely
   - Clear the app's cache/data
   - Restart the app

2. **Check Backend Connection**:
   - Ensure backend is running on port 3000
   - Check IP address in `mobile-app/config.js` matches your computer's IP
   - Current IP should be: `192.168.1.231`

3. **Manual Token Test**:
   You can test the API directly using PowerShell:
   ```powershell
   # Login and get token
   $loginBody = @{email="owner@foodstack.test"; password="password123"} | ConvertTo-Json
   $loginResponse = Invoke-RestMethod -Uri "http://192.168.1.231:3000/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
   $token = $loginResponse.data.accessToken
   
   # Test staff API
   $headers = @{Authorization="Bearer $token"}
   Invoke-RestMethod -Uri "http://192.168.1.231:3000/api/v1/staff?page=1&limit=10" -Method GET -Headers $headers
   ```

## Available Test Accounts

### Owner Account (Full Access)
- Email: `owner@foodstack.test`
- Password: `password123`
- Role: `OWNER`
- Access: All features including staff management

### Manager Account (Staff Access)
- Email: `manager@phoco.com`
- Password: `password123`
- Role: `MANAGER`
- Access: Staff management features

### Customer Account (No Staff Access)
- Email: `customer@mobile.test`
- Password: `password123`
- Role: `CUSTOMER`
- Access: Only customer features (ordering, etc.)

## Console Log Messages

### Success Messages
```
🔄 Attempting to fetch staff from API...
✅ User authenticated with role: OWNER
✅ Staff data loaded from API: {...}
```

### Error Messages
```
⚠️ User not authenticated, falling back to mock data
⚠️ User does not have permission to access staff data. Current role: CUSTOMER
🔐 Authentication failed - user needs to login again
💡 Please login with owner@foodstack.test / password123 to access staff management
```

## Fallback Behavior

When authentication fails, the app will automatically fall back to mock data so you can still test the UI. However, any changes made will not be saved to the backend.

To use real data and save changes, you must be logged in with an OWNER or MANAGER account.