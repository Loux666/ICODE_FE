# OAuth Popup Flow - Backend & Frontend Contract

> **Mục đích**: Document chi tiết OAuth flow và data contract giữa Backend (Laravel) và Frontend (Vite)

---

## 🔄 COMPLETE OAUTH FLOW

### **Step-by-Step Flow:**

```
1. Frontend (localhost:5174)
   └─> User clicks "Login with Google"
   └─> Opens popup window
   └─> URL: http://localhost:8000/api/auth/google

2. Backend (localhost:8000)
   └─> Receives request at /api/auth/google
   └─> Redirects to Google OAuth
   └─> URL: https://accounts.google.com/o/oauth2/auth?client_id=...

3. Google OAuth
   └─> User logs in with Google account
   └─> Google redirects back to callback
   └─> URL: http://localhost:8000/api/auth/google/callback?code=xxx

4. Backend Callback Processing
   └─> Receives code from Google
   └─> Exchanges code for access token
   └─> Gets user info from Google (id, email, name, avatar)
   └─> Finds or creates user in database
   └─> Generates Laravel Sanctum token
   └─> Redirects to frontend callback page
   └─> URL: http://localhost:5174/oauth-callback.html?token=xxx&provider=google

5. Frontend Callback Page (oauth-callback.html)
   └─> Receives token from URL params
   └─> Sends postMessage to parent window
   └─> Closes popup after 500ms

6. Frontend Parent Window
   └─> Receives postMessage with token
   └─> Stores token in localStorage
   └─> Fetches user info from /api/me
   └─> Redirects to dashboard/home
```

---

## 📡 BACKEND API ENDPOINTS

### **1. Redirect to Google OAuth**

**Endpoint**: `GET /api/auth/google`

**Response**: HTTP Redirect (302)
```
Location: https://accounts.google.com/o/oauth2/auth?client_id=...
```

---

### **2. Google OAuth Callback**

**Endpoint**: `GET /api/auth/google/callback`

**Query Params**:
```
code: string (from Google)
scope: string
authuser: string
prompt: string
```

**Processing**:
1. Call `Socialite::driver('google')->stateless()->user()`
2. Get Google user info (id, email, name, avatar)
3. Find or create user in database
4. Generate Sanctum token
5. Redirect to frontend

**Response**: HTTP Redirect (302)
```
Location: http://localhost:5174/oauth-callback.html?token={token}&provider=google
```

**URL Parameters**:
- `token`: Laravel Sanctum API token (e.g., `27|a97w2rZ...`)
- `provider`: OAuth provider name (`google` or `facebook`)

**Error Response**: HTTP Redirect (302)
```
Location: http://localhost:5174/oauth-callback.html?error={error_message}
```

---

### **3. Get Current User Info**

**Endpoint**: `GET /api/me`

**Headers**:
```
Authorization: Bearer {token}
Accept: application/json
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 4,
      "name": "Quang Nguyen",
      "email": "quangdafrankie@gmail.com",
      "role": "user",
      "is_activated": 1,
      "avatar": "userImage/default-avatar.avif",
      "avatar_url": "http://localhost:8000/storage/userImage/default-avatar.avif",
      "created_at": "2026-01-03T03:01:59.000000Z",
      "updated_at": "2026-01-03T03:01:59.000000Z"
    }
  },
  "message": "Lấy thông tin user thành công"
}
```

---

## 🎨 FRONTEND REQUIREMENTS

### **1. Popup Utility (oauth-popup.ts)**

**Responsibilities**:
- Mở popup window với OAuth URL
- Lắng nghe postMessage từ popup
- Handle success/error messages
- Return Promise với token

**Example**:
```typescript
class OAuthPopup {
  open(url: string, provider: string): Promise<{token: string, provider: string}> {
    return new Promise((resolve, reject) => {
      const popup = window.open(url, provider, 'width=500,height=600');
      
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success') {
          resolve({
            token: event.data.token,
            provider: event.data.provider
          });
        } else if (event.data.type === 'oauth-error') {
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', messageHandler);
    });
  }
}
```

---

### **2. OAuth Callback Page (public/oauth-callback.html)**

**Location**: `public/oauth-callback.html` (trong frontend project)

**Responsibilities**:
- Parse URL parameters (`token`, `provider`, `error`)
- Send postMessage to parent window
- Close popup window

**Expected URL Parameters**:
- `token` (string): Laravel Sanctum token
- `provider` (string): `google` or `facebook`
- `error` (string, optional): Error message nếu OAuth failed

**PostMessage Format**:

**Success**:
```javascript
{
  type: 'oauth-success',
  token: '27|a97w2rZ...',
  provider: 'google'
}
```

**Error**:
```javascript
{
  type: 'oauth-error',
  error: 'Error message'
}
```

**Implementation**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OAuth Callback</title>
</head>
<body>
    <h2>Đang xử lý đăng nhập...</h2>
    
    <script>
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const provider = params.get('provider');
        const error = params.get('error');

        if (window.opener) {
            if (token) {
                window.opener.postMessage({
                    type: 'oauth-success',
                    token: token,
                    provider: provider
                }, '*');
            } else if (error) {
                window.opener.postMessage({
                    type: 'oauth-error',
                    error: error
                }, '*');
            }

            setTimeout(() => window.close(), 500);
        }
    </script>
</body>
</html>
```

---

### **3. Login Component**

**Responsibilities**:
- Render "Login with Google" button
- Open OAuth popup
- Receive token from postMessage
- Fetch user info with token
- Store token and user in localStorage
- Redirect to home/dashboard

**Example**:
```typescript
const loginWithGoogle = async () => {
  const popup = new OAuthPopup();
  
  try {
    // 1. Mở popup và nhận token
    const result = await popup.open('http://localhost:8000/api/auth/google', 'google');
    
    // 2. Lưu token
    localStorage.setItem('auth_token', result.token);
    
    // 3. Fetch user info
    const response = await fetch('http://localhost:8000/api/me', {
      headers: {
        'Authorization': `Bearer ${result.token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 4. Lưu user info
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // 5. Redirect về trang chủ
      window.location.href = '/';
    }
    
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

## ⚙️ BACKEND CONFIGURATION

### **Environment Variables (.env)**

```env
# Frontend URL
FRONTEND_URL=http://localhost:5174

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URL=http://localhost:8000/api/auth/facebook/callback
```

### **Config (config/services.php)**

```php
return [
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URL'),
    ],
];
```

---

## 🔍 DEBUGGING

### **Backend Logs**

Check `storage/logs/laravel.log`:

```
[OAuth] Google callback received
[SocialAuth] Starting Google login
[SocialAuth] Got Google user
[SocialAuth] User ready
[SocialAuth] Token created
[OAuth] Redirecting to callback page
```

### **Frontend Console (Popup)**

```
[OAuth Callback] Page loaded
[OAuth Callback] Token: present
[OAuth Callback] Sending message to parent
[OAuth Callback] Closing popup
```

### **Frontend Console (Parent)**

```
Received message: {type: 'oauth-success', token: '27|...', provider: 'google'}
```

---

## ❌ COMMON ISSUES

### **1. Popup blocked**
- User needs to allow popups for localhost:5174

### **2. CORS errors**
- Backend headers already configured
- Frontend should use `'*'` origin for postMessage during development

### **3. Token not received**
- Check backend logs for errors
- Verify redirect URL is correct: `http://localhost:5174/oauth-callback.html`
- Check URL parameters in popup

### **4. "Đăng nhập thất bại"**
- Backend is redirecting with `error` parameter
- Check backend logs for exception details
- Verify Google OAuth credentials in `.env`

---

## ✅ CHECKLIST

### Backend:
- [x] Socialite installed
- [x] Google OAuth credentials configured
- [x] Routes created (`/api/auth/google`, `/api/auth/google/callback`)
- [x] Controller redirects to `FRONTEND_URL/oauth-callback.html`
- [x] `/api/me` endpoint returns user info with avatar_url

### Frontend:
- [ ] `oauth-callback.html` created in `public/` folder
- [ ] OAuth popup utility implemented
- [ ] Login button opens popup with correct URL
- [ ] PostMessage listener implemented
- [ ] Token stored in localStorage
- [ ] User info fetched from `/api/me`

---

**Version**: 1.0  
**Last Updated**: 2026-01-03  
**Status**: Backend Ready, Frontend Integration Pending
