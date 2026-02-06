# OAuth Login Implementation Guide

## Overview

This implementation provides Google and Facebook OAuth login functionality using popup windows and postMessage communication.

## Files Created

1. **`src/utils/oauth-popup.ts`** - OAuth popup utility with login functions
2. **`public/oauth-callback.html`** - OAuth callback page for handling redirects
3. **`src/store/auth.ts`** - Updated with OAuth login methods

## How It Works

### Flow Diagram

```
User clicks login button
    ↓
Frontend opens popup window → Backend OAuth URL (/auth/google or /auth/facebook)
    ↓
User authenticates with Google/Facebook
    ↓
Backend processes OAuth → Redirects to /oauth-callback.html?success=true&token=xxx&user=xxx
    ↓
Callback page sends postMessage to parent window
    ↓
Parent window receives message → Saves token to localStorage
    ↓
Popup closes → User redirected to home page
```

## Backend Requirements

### 1. OAuth Routes

Your Laravel backend should have these routes:

```php
// routes/web.php or routes/api.php
Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

Route::get('/auth/facebook', [OAuthController::class, 'redirectToFacebook']);
Route::get('/auth/facebook/callback', [OAuthController::class, 'handleFacebookCallback']);
```

### 2. OAuth Controller Example

```php
<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Find or create user
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'is_activated' => 1,
                ]
            );

            // Create token
            $token = $user->createToken('oauth-token')->plainTextToken;

            // Prepare user data for callback
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'is_activated' => $user->is_activated,
                'email_verified_at' => $user->email_verified_at,
            ];

            // Redirect to callback page with data
            $callbackUrl = config('app.frontend_url') . '/oauth-callback.html';
            $params = http_build_query([
                'success' => 'true',
                'token' => $token,
                'user' => json_encode($userData),
            ]);

            return redirect($callbackUrl . '?' . $params);
        } catch (\Exception $e) {
            $callbackUrl = config('app.frontend_url') . '/oauth-callback.html';
            $params = http_build_query([
                'success' => 'false',
                'error' => $e->getMessage(),
            ]);

            return redirect($callbackUrl . '?' . $params);
        }
    }

    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->redirect();
    }

    public function handleFacebookCallback()
    {
        try {
            $facebookUser = Socialite::driver('facebook')->user();
            
            // Similar implementation as Google
            $user = User::updateOrCreate(
                ['email' => $facebookUser->getEmail()],
                [
                    'name' => $facebookUser->getName(),
                    'avatar' => $facebookUser->getAvatar(),
                    'email_verified_at' => now(),
                    'is_activated' => 1,
                ]
            );

            $token = $user->createToken('oauth-token')->plainTextToken;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'is_activated' => $user->is_activated,
                'email_verified_at' => $user->email_verified_at,
            ];

            $callbackUrl = config('app.frontend_url') . '/oauth-callback.html';
            $params = http_build_query([
                'success' => 'true',
                'token' => $token,
                'user' => json_encode($userData),
            ]);

            return redirect($callbackUrl . '?' . $params);
        } catch (\Exception $e) {
            $callbackUrl = config('app.frontend_url') . '/oauth-callback.html';
            $params = http_build_query([
                'success' => 'false',
                'error' => $e->getMessage(),
            ]);

            return redirect($callbackUrl . '?' . $params);
        }
    }
}
```

### 3. Environment Configuration

Add to your Laravel `.env`:

```env
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback
```

Add to `config/services.php`:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],

'facebook' => [
    'client_id' => env('FACEBOOK_CLIENT_ID'),
    'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    'redirect' => env('FACEBOOK_REDIRECT_URI'),
],
```

## Frontend Usage

### In Vue Component

```vue
<template>
  <div class="login-page">
    <button @click="handleGoogleLogin" class="btn-google">
      <img src="/google-icon.svg" alt="Google" />
      Đăng nhập với Google
    </button>

    <button @click="handleFacebookLogin" class="btn-facebook">
      <img src="/facebook-icon.svg" alt="Facebook" />
      Đăng nhập với Facebook
    </button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const error = ref('');

const handleGoogleLogin = async () => {
  error.value = '';
  try {
    const success = await authStore.loginWithGoogle();
    if (!success) {
      error.value = 'Đăng nhập Google thất bại';
    }
    // User will be redirected automatically on success
  } catch (e) {
    error.value = 'Có lỗi xảy ra khi đăng nhập';
    console.error(e);
  }
};

const handleFacebookLogin = async () => {
  error.value = '';
  try {
    const success = await authStore.loginWithFacebook();
    if (!success) {
      error.value = 'Đăng nhập Facebook thất bại';
    }
    // User will be redirected automatically on success
  } catch (e) {
    error.value = 'Có lỗi xảy ra khi đăng nhập';
    console.error(e);
  }
};
</script>
```

### Direct Usage (without store)

```typescript
import { loginWithGoogle, loginWithFacebook } from '@/utils/oauth-popup';

// Google login
const result = await loginWithGoogle();
if (result.success) {
  console.log('Logged in:', result.user);
  // User will be redirected to home page automatically
} else {
  console.error(result.message);
}

// Facebook login
const result = await loginWithFacebook();
if (result.success) {
  console.log('Logged in:', result.user);
  // User will be redirected to home page automatically
} else {
  console.error(result.message);
}

// Custom popup size
const result = await loginWithGoogle({
  width: 500,
  height: 600,
  title: 'Google Login'
});
```

## Security Considerations

1. **Origin Verification**: The callback page verifies the message origin matches the API URL
2. **HTTPS Required**: Use HTTPS in production for secure OAuth
3. **Token Storage**: Tokens are stored in localStorage (consider using httpOnly cookies for production)
4. **Popup Blockers**: Users must allow popups for your site

## Troubleshooting

### Popup Blocked
- Ensure the login function is called directly from a user action (click event)
- Ask users to allow popups for your site

### postMessage Not Received
- Check that the callback URL is correct
- Verify the origin in the postMessage matches your frontend URL
- Check browser console for CORS errors

### OAuth Errors
- Verify OAuth credentials in backend `.env`
- Check redirect URIs match in OAuth provider settings
- Ensure callback URLs are whitelisted in Google/Facebook console

## Testing

1. Start your Laravel backend: `php artisan serve`
2. Start your Vue frontend: `npm run dev`
3. Click the Google/Facebook login button
4. Complete OAuth flow in popup
5. Verify token is saved in localStorage
6. Verify redirect to home page

## Environment Variables

Add to your Vue `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

This ensures the OAuth popup utility knows where to send requests.
