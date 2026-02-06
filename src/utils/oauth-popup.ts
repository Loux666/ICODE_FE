/**
 * OAuth Popup Utility
 * Handles OAuth authentication via popup windows for Google and Facebook
 */

interface OAuthResponse {
    success: boolean;
    data?: {
        token: string;
        user?: any; // Optional - fetched after receiving token
    };
    message?: string;
}

interface PopupOptions {
    width?: number;
    height?: number;
    title?: string;
}

const DEFAULT_POPUP_OPTIONS: PopupOptions = {
    width: 600,
    height: 700,
    title: 'OAuth Login',
};

/**
 * Opens a centered popup window
 */
function openPopup(url: string, options: PopupOptions = {}): Window | null {
    const { width, height, title } = { ...DEFAULT_POPUP_OPTIONS, ...options };

    // Calculate center position
    const left = window.screen.width / 2 - (width || 600) / 2;
    const top = window.screen.height / 2 - (height || 700) / 2;

    const features = `
    width=${width},
    height=${height},
    left=${left},
    top=${top},
    toolbar=no,
    location=no,
    directories=no,
    status=no,
    menubar=no,
    scrollbars=yes,
    resizable=yes,
    copyhistory=no
  `.replace(/\s/g, '');

    return window.open(url, title || 'OAuth Login', features);
}

/**
 * Waits for OAuth response via postMessage
 */
function waitForOAuthResponse(popup: Window): Promise<OAuthResponse> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            console.error('[OAuth] Timeout - No response received after 5 minutes');
            reject(new Error('OAuth timeout - No response received'));
        }, 5 * 60 * 1000); // 5 minutes timeout

        // Note: We don't check popup.closed because COOP (Cross-Origin-Opener-Policy) blocks it
        // Instead, we rely solely on postMessage and timeout

        const handleMessage = (event: MessageEvent) => {
            console.log('[OAuth] Received postMessage:', event.data, 'from origin:', event.origin);

            const data = event.data;

            // Check based on contract: type 'oauth-success' or 'oauth-error'
            if (data && typeof data === 'object' && (data.type === 'oauth-success' || data.type === 'oauth-error')) {
                console.log('[OAuth] Valid contract message received:', data);
                cleanup();

                if (data.type === 'oauth-success') {
                    console.log('[OAuth] Login successful!');
                    resolve({
                        success: true,
                        data: {
                            token: data.token
                        }
                    });
                } else {
                    console.error('[OAuth] Login failed:', data.error);
                    reject(new Error(data.error || 'OAuth authentication failed'));
                }

                // Try to close the popup
                try {
                    popup.close();
                } catch (e) {
                    // Silently ignore - popup will close itself
                }
            }
        };

        const cleanup = () => {
            clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            console.log('[OAuth] Cleanup completed');
        };

        console.log('[OAuth] Waiting for postMessage...');
        window.addEventListener('message', handleMessage);
    });
}

/**
 * Handles OAuth login flow
 */
async function handleOAuthLogin(
    provider: 'google' | 'facebook',
    popupOptions?: PopupOptions
): Promise<OAuthResponse> {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    console.log('[OAuth] VITE_API_URL from env:', import.meta.env.VITE_API_URL);
    console.log('[OAuth] Final apiUrl:', apiUrl);

    // OAuth URL should be: http://localhost:8000/api/auth/google
    const oauthUrl = `${apiUrl}/auth/${provider}`;
    console.log('[OAuth] Final oauthUrl:', oauthUrl);

    // Open popup
    const popup = openPopup(oauthUrl, popupOptions);

    if (!popup) {
        throw new Error('Failed to open popup. Please allow popups for this site.');
    }

    try {
        // Wait for OAuth response
        const response = await waitForOAuthResponse(popup);

        // Save token and fetch user data
        if (response.success && response.data) {
            const { token } = response.data;

            // Save token to localStorage
            localStorage.setItem('token', token);

            // Set axios default header
            const apiClient = (await import('../services/api')).default;
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch user data from API (endpoint per contract: /api/me)
            console.log('[OAuth] Fetching user data from /api/me...');
            try {
                const userResponse = await apiClient.get('/me');
                const user = userResponse.data.data?.user || userResponse.data.data || userResponse.data;

                console.log('[OAuth] User data fetched:', user);
                localStorage.setItem('user', JSON.stringify(user));

                // Return response with user data
                return {
                    success: true,
                    data: {
                        token,
                        user
                    }
                };
            } catch (error) {
                console.error('[OAuth] Failed to fetch user data:', error);
                // Clear token if user fetch fails
                localStorage.removeItem('token');
                throw new Error('Không thể tải thông tin người dùng');
            }
        }

        return response;
    } catch (error) {
        // Ensure popup is closed on error
        try {
            if (!popup.closed) {
                popup.close();
            }
        } catch (e) {
            // Ignore
        }
        throw error;
    }
}

/**
 * Login with Google
 */
export async function loginWithGoogle(
    options?: PopupOptions
): Promise<{ success: boolean; user?: any; message?: string }> {
    console.log('[OAuth] Starting Google login...');
    try {
        const response = await handleOAuthLogin('google', options);
        console.log('[OAuth] Google login response:', response);

        if (response.success) {
            console.log('[OAuth] Google login successful, redirecting to home...');
            // Redirect to home page after successful login
            setTimeout(() => {
                console.log('[OAuth] Executing redirect...');
                window.location.href = '/';
            }, 500);

            return {
                success: true,
                user: response.data?.user,
                message: 'Đăng nhập Google thành công!',
            };
        }

        console.warn('[OAuth] Google login was not successful');
        return {
            success: false,
            message: response.message || 'Đăng nhập Google thất bại',
        };
    } catch (error) {
        console.error('[OAuth] Google login error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Đăng nhập Google thất bại',
        };
    }
}

/**
 * Login with Facebook
 */
export async function loginWithFacebook(
    options?: PopupOptions
): Promise<{ success: boolean; user?: any; message?: string }> {
    console.log('[OAuth] Starting Facebook login...');
    try {
        const response = await handleOAuthLogin('facebook', options);
        console.log('[OAuth] Facebook login response:', response);

        if (response.success) {
            console.log('[OAuth] Facebook login successful, redirecting to home...');
            // Redirect to home page after successful login
            setTimeout(() => {
                console.log('[OAuth] Executing redirect...');
                window.location.href = '/';
            }, 500);

            return {
                success: true,
                user: response.data?.user,
                message: 'Đăng nhập Facebook thành công!',
            };
        }

        console.warn('[OAuth] Facebook login was not successful');
        return {
            success: false,
            message: response.message || 'Đăng nhập Facebook thất bại',
        };
    } catch (error) {
        console.error('[OAuth] Facebook login error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Đăng nhập Facebook thất bại',
        };
    }
}

/**
 * Example usage in a Vue component:
 * 
 * import { loginWithGoogle, loginWithFacebook } from '@/utils/oauth-popup';
 * 
 * const handleGoogleLogin = async () => {
 *   const result = await loginWithGoogle();
 *   if (result.success) {
 *     console.log('Logged in as:', result.user);
 *   } else {
 *     console.error(result.message);
 *   }
 * };
 * 
 * const handleFacebookLogin = async () => {
 *   const result = await loginWithFacebook();
 *   if (result.success) {
 *     console.log('Logged in as:', result.user);
 *   } else {
 *     console.error(result.message);
 *   }
 * };
 */
