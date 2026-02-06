# OAuth Popup Implementation - Quick Reference

## ✅ What Was Implemented

### 1. Core Files Created
- **`src/utils/oauth-popup.ts`** - Main OAuth utility with popup handling
- **`public/oauth-callback.html`** - Callback page for OAuth redirects
- **`docs/oauth-implementation.md`** - Complete documentation

### 2. Updated Files
- **`src/store/auth.ts`** - Added `loginWithGoogle()` and `loginWithFacebook()` methods
- **`src/pages/auth/login/login.ts`** - Updated to use OAuth popup utility
- **`src/pages/auth/login/login.html`** - Added loading states and error display
- **`src/pages/auth/login/login.css`** - Added styles for OAuth UI elements

## 🚀 How to Use

### In Your Login Component (Already Implemented)

```vue
<template>
  <button @click="handleGoogleLogin" :disabled="isGoogleLoading">
    {{ isGoogleLoading ? 'Đang đăng nhập...' : 'Google' }}
  </button>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const isGoogleLoading = ref(false);

const handleGoogleLogin = async () => {
  isGoogleLoading.value = true;
  const success = await authStore.loginWithGoogle();
  isGoogleLoading.value = false;
  // User redirected automatically on success
};
</script>
```

### Direct Import (Alternative)

```typescript
import { loginWithGoogle, loginWithFacebook } from '@/utils/oauth-popup';

// Use directly
const result = await loginWithGoogle();
if (result.success) {
  console.log('User:', result.user);
}
```

## 🔧 Backend Setup Required

### 1. Install Laravel Socialite

```bash
composer require laravel/socialite
```

### 2. Configure `.env`

```env
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback
```

### 3. Add Routes (routes/web.php)

```php
Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);
Route::get('/auth/facebook', [OAuthController::class, 'redirectToFacebook']);
Route::get('/auth/facebook/callback', [OAuthController::class, 'handleFacebookCallback']);
```

### 4. Controller Implementation

The controller should:
1. Handle OAuth redirect
2. Create/update user
3. Generate token
4. Redirect to: `{FRONTEND_URL}/oauth-callback.html?success=true&token={token}&user={json_encoded_user}`

See `docs/oauth-implementation.md` for complete controller code.

## 📋 Flow Diagram

```
User clicks "Login with Google/Facebook"
    ↓
Frontend opens popup → /auth/google or /auth/facebook
    ↓
User authenticates with provider
    ↓
Backend processes OAuth
    ↓
Redirects to /oauth-callback.html?success=true&token=xxx&user=xxx
    ↓
Callback page sends postMessage to parent window
    ↓
Parent receives message → Saves token to localStorage
    ↓
Popup closes → User redirected to home page (/)
```

## 🔒 Security Features

1. **Origin Verification** - postMessage validates sender origin
2. **Timeout Protection** - 5-minute timeout for OAuth flow
3. **Popup Close Detection** - Detects if user closes popup
4. **Error Handling** - Comprehensive error messages

## 🎨 UI Features

- ✅ Loading spinners on OAuth buttons
- ✅ Disabled state during authentication
- ✅ Error message display
- ✅ Smooth animations
- ✅ Responsive design

## 🧪 Testing Checklist

- [ ] Configure OAuth credentials in backend
- [ ] Start Laravel backend: `php artisan serve`
- [ ] Start Vue frontend: `npm run dev`
- [ ] Click Google login button
- [ ] Verify popup opens
- [ ] Complete OAuth flow
- [ ] Verify token saved in localStorage
- [ ] Verify redirect to home page
- [ ] Test Facebook login
- [ ] Test error scenarios (cancel, network error)

## 🐛 Troubleshooting

### Popup Blocked
- Ensure function called from user click event
- Ask user to allow popups

### postMessage Not Received
- Check callback URL in backend
- Verify VITE_API_URL in frontend .env
- Check browser console for errors

### OAuth Provider Errors
- Verify credentials in .env
- Check redirect URIs in provider console
- Ensure URLs match exactly

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```env
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

## 📚 Additional Resources

- Full documentation: `docs/oauth-implementation.md`
- OAuth utility: `src/utils/oauth-popup.ts`
- Callback page: `public/oauth-callback.html`
- Auth store: `src/store/auth.ts`
