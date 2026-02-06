# Backend OAuth Requirements - URGENT FIX NEEDED

## ❌ Vấn đề hiện tại

Backend OAuth **KHÔNG redirect về frontend callback page** sau khi authentication thành công.

Frontend đang chờ postMessage từ callback page nhưng không bao giờ nhận được vì backend không redirect đúng.

## ✅ Giải pháp

Backend phải redirect về URL này sau khi OAuth thành công:

```
http://localhost:5173/oauth-callback.html?success=true&token={TOKEN}&user={ENCODED_USER_JSON}
```

## 📝 Code Backend cần implement

### 1. Controller Method (OAuthController.php)

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

            // Create token (using Laravel Sanctum)
            $token = $user->createToken('oauth-token')->plainTextToken;

            // Prepare user data
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url ?? $user->avatar,
                'is_activated' => $user->is_activated,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            // ⚠️ CRITICAL: Redirect to frontend callback page
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $callbackUrl = $frontendUrl . '/oauth-callback.html';
            
            $params = http_build_query([
                'success' => 'true',
                'token' => $token,
                'user' => urlencode(json_encode($userData)), // MUST encode JSON
            ]);

            return redirect($callbackUrl . '?' . $params);
            
        } catch (\Exception $e) {
            // Redirect with error
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $callbackUrl = $frontendUrl . '/oauth-callback.html';
            
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
                'role' => $user->role ?? 'user',
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url ?? $user->avatar,
                'is_activated' => $user->is_activated,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $callbackUrl = $frontendUrl . '/oauth-callback.html';
            
            $params = http_build_query([
                'success' => 'true',
                'token' => $token,
                'user' => urlencode(json_encode($userData)),
            ]);

            return redirect($callbackUrl . '?' . $params);
            
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $callbackUrl = $frontendUrl . '/oauth-callback.html';
            
            $params = http_build_query([
                'success' => 'false',
                'error' => $e->getMessage(),
            ]);

            return redirect($callbackUrl . '?' . $params);
        }
    }
}
```

### 2. Routes (routes/web.php hoặc routes/api.php)

```php
use App\Http\Controllers\OAuthController;

// OAuth routes (phải là web routes, không phải api routes)
Route::get('/api/auth/google', [OAuthController::class, 'redirectToGoogle']);
Route::get('/api/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

Route::get('/api/auth/facebook', [OAuthController::class, 'redirectToFacebook']);
Route::get('/api/auth/facebook/callback', [OAuthController::class, 'handleFacebookCallback']);
```

### 3. Environment Variables (.env)

```env
# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
```

### 4. Config (config/app.php)

```php
'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
```

### 5. Config (config/services.php)

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

## 🔍 Debug Backend

Để kiểm tra backend có hoạt động không:

1. Mở popup manually: `http://localhost:8000/api/auth/google`
2. Sau khi login Google, check xem có redirect về `http://localhost:5173/oauth-callback.html?...` không
3. Nếu không redirect, check Laravel logs: `storage/logs/laravel.log`

## ✅ Expected Flow

```
User clicks "Login with Google"
    ↓
Frontend opens popup: http://localhost:8000/api/auth/google
    ↓
Backend redirects to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects to: http://localhost:8000/api/auth/google/callback
    ↓
Backend creates/updates user, generates token
    ↓
Backend redirects to: http://localhost:5173/oauth-callback.html?success=true&token=xxx&user=xxx
    ↓
Callback page sends postMessage to parent window
    ↓
Parent window saves token, redirects to home
```

## 🚨 Common Mistakes

1. ❌ **Không redirect về frontend** - Backend trả JSON thay vì redirect
2. ❌ **URL callback sai** - Redirect về backend URL thay vì frontend
3. ❌ **Không encode user JSON** - Phải dùng `urlencode(json_encode($userData))`
4. ❌ **CORS issues** - OAuth routes phải là web routes, không phải api routes
5. ❌ **Missing FRONTEND_URL** - Không config frontend URL trong .env

## 📦 Required Packages

```bash
composer require laravel/socialite
composer require laravel/sanctum
```

## 🎯 Test Checklist

- [ ] Install Laravel Socialite
- [ ] Configure Google/Facebook OAuth credentials
- [ ] Create OAuthController
- [ ] Add routes to routes/web.php
- [ ] Add FRONTEND_URL to .env
- [ ] Test: Open http://localhost:8000/api/auth/google manually
- [ ] Verify: Should redirect to http://localhost:5173/oauth-callback.html after login
- [ ] Check: URL should have ?success=true&token=...&user=...
