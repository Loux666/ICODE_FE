import { defineComponent } from 'vue';
import { useAuthStore } from '@/store/auth'; // Import store vừa tạo
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const remember = ref(false);
    const isGoogleLoading = ref(false);
    const isFacebookLoading = ref(false);
    const oauthError = ref('');

    // Note: removed persistent "remember" storage per request (no cookies/localStorage)
    const handleLogin = async () => {
      // Gọi hàm login bên store
      const success = await authStore.login({
        email: email.value,
        password: password.value
      });

      if (success) {
        router.push('/');
        return;
      }

      // If backend returned 403 (e.g., OTP required), redirect to OTP page
      if (authStore.lastLoginErrorStatus === 403) {
        router.push({ name: 'otp', query: { type: 'login', email: email.value } });
        return;
      }

      alert('Sai tài khoản hoặc mật khẩu');
    };

    const loginWithGoogle = async () => {
      console.log('Login with Google');
      oauthError.value = '';
      isGoogleLoading.value = true;

      try {
        const success = await authStore.loginWithGoogle();
        if (!success) {
          oauthError.value = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
        }
        // User will be redirected automatically on success
      } catch (error) {
        console.error('Google login error:', error);
        oauthError.value = 'Có lỗi xảy ra khi đăng nhập với Google.';
      } finally {
        isGoogleLoading.value = false;
      }
    };

    const loginWithFacebook = async () => {
      console.log('Login with Facebook');
      oauthError.value = '';
      isFacebookLoading.value = true;

      try {
        const success = await authStore.loginWithFacebook();
        if (!success) {
          oauthError.value = 'Đăng nhập Facebook thất bại. Vui lòng thử lại.';
        }
        // User will be redirected automatically on success
      } catch (error) {
        console.error('Facebook login error:', error);
        oauthError.value = 'Có lỗi xảy ra khi đăng nhập với Facebook.';
      } finally {
        isFacebookLoading.value = false;
      }
    };

    return {
      email,
      password,
      remember,
      handleLogin,
      loginWithGoogle,
      loginWithFacebook,
      isGoogleLoading,
      isFacebookLoading,
      oauthError
    };
  }
});

