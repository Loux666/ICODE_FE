# OAuth Testing Guide

## Bước 1: Test Backend Trực Tiếp

Mở browser và truy cập:
```
http://localhost:8000/api/auth/google
```

### Kết quả mong đợi:

Sau khi login Google thành công, backend phải redirect về:
```
http://localhost:5173/oauth-callback.html?success=true&token=XXX
```

**KHÔNG PHẢI** trả về JSON response!

### Nếu backend trả về JSON thay vì redirect:

Backend đang sai! Phải sửa controller để redirect về frontend callback page.

## Bước 2: Kiểm tra Backend Response

### Backend ĐÚNG phải làm:

```php
// ✅ ĐÚNG - Redirect về frontend
return redirect('http://localhost:5173/oauth-callback.html?success=true&token=' . $token);
```

### Backend SAI:

```php
// ❌ SAI - Trả JSON
return response()->json(['token' => $token]);
```

## Bước 3: Check Laravel Logs

Mở file:
```
d:\Base\Laravel\Base\storage\logs\laravel.log
```

Tìm error liên quan đến OAuth.

## Bước 4: Verify Backend Routes

Routes phải là **WEB routes**, không phải API routes (để có thể redirect):

```php
// routes/web.php
Route::get('/api/auth/google', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/api/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
```

## Bước 5: Check Environment Variables

File `.env` của Laravel phải có:

```env
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

## Common Issues

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Backend trả JSON | Route trong `api.php` | Chuyển sang `web.php` |
| 404 Not Found | Route chưa được định nghĩa | Thêm route vào `web.php` |
| Google OAuth error | Credentials sai hoặc redirect URI không match | Check Google Console settings |
| CORS error | Frontend URL chưa được whitelist | Thêm vào `config/cors.php` |
| "Đăng nhập thất bại" | Backend không gửi token | Check controller có redirect đúng không |

## Debug Checklist

- [ ] Test `http://localhost:8000/api/auth/google` trong browser
- [ ] Verify redirect về `http://localhost:5173/oauth-callback.html?success=true&token=...`
- [ ] Check Laravel logs có error không
- [ ] Verify routes trong `web.php`
- [ ] Check `.env` có đầy đủ credentials
- [ ] Test lại OAuth flow từ frontend
