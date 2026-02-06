import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/services/api';

export default defineComponent({
  name: 'OtpPage',
  setup() {
    const router = useRouter();
    const route = useRoute();
    // Email may be passed via query when navigating to /otp
    const email = ref((route.query.email as string) || 'q1uangdm@gmail.com');
    // Type must be either 'registration' or 'login' — prefer query, fallback to 'registration'
    const type = ref((route.query.type as string) || 'registration');
    const otpDigits = ref<string[]>(['', '', '', '', '', '']);
    const inputRefs = ref<(HTMLInputElement | null)[]>([]);
    const countdown = ref(56);
    const isOtpComplete = ref(false);
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const resendLoading = ref(false);
    let countdownInterval: number | null = null;

    const setInputRef = (el: any, index: number) => {
      if (el) {
        inputRefs.value[index] = el as HTMLInputElement;
      }
    };

    const handleInput = (index: number, event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;

      // Only allow numbers
      if (value && !/^\d$/.test(value)) {
        otpDigits.value[index] = '';
        return;
      }

      otpDigits.value[index] = value;

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.value[index + 1]?.focus();
      }

      // Check if OTP is complete
      checkOtpComplete();
    };

    const handleKeyDown = (index: number, event: KeyboardEvent) => {
      // Handle backspace
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        inputRefs.value[index - 1]?.focus();
      }

      // Handle arrow keys
      if (event.key === 'ArrowLeft' && index > 0) {
        inputRefs.value[index - 1]?.focus();
      }
      if (event.key === 'ArrowRight' && index < 5) {
        inputRefs.value[index + 1]?.focus();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const pastedData = event.clipboardData?.getData('text');
      
      if (pastedData) {
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        digits.forEach((digit, index) => {
          if (index < 6) {
            otpDigits.value[index] = digit;
          }
        });
        
        // Focus the last filled input or the first empty one
        const nextEmptyIndex = otpDigits.value.findIndex(d => !d);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.value[focusIndex]?.focus();
        
        checkOtpComplete();
      }
    };

    const checkOtpComplete = () => {
      isOtpComplete.value = otpDigits.value.every(digit => digit !== '');
    };

    const startCountdown = () => {
      countdown.value = 56;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      countdownInterval = window.setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };

    const resendCode = async () => {
      if (resendLoading.value) return;
      resendLoading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const payload = { email: email.value, type: type.value };
        const res = await apiClient.post('/otp/resend', payload);
        // Optionally use message from server
        successMessage.value = res?.data?.message || 'Mã đã được gửi lại.';

        // Clear inputs and focus first
        otpDigits.value = ['', '', '', '', '', ''];
        isOtpComplete.value = false;
        inputRefs.value[0]?.focus();

        // Restart countdown
        startCountdown();
      } catch (err: any) {
        console.error('Resend OTP error', err);
        errorMessage.value = err?.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại.';
      } finally {
        resendLoading.value = false;
      }
    };

    const verifyOtp = async () => {
      if (!isOtpComplete.value || loading.value) return;

      errorMessage.value = '';
      loading.value = true;
      const otpCode = otpDigits.value.join('');
      try {
        const payload = {
          email: email.value,
          otp_code: otpCode,
          type: type.value,
        };

        await apiClient.post('/otp/verify', payload);
        // Handle success — behavior depends on backend. Redirect heuristics:
        if (type.value === 'registration') {
          // After registration verification, send user to login
          router.push('/login');
        } else {
          // After login verification, go to home
          router.push('/');
        }
      } catch (err: any) {
        console.error('OTP verify error', err);
        errorMessage.value = err?.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.';
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      // Auto-focus first input
      inputRefs.value[0]?.focus();
      // Start countdown
      startCountdown();
    });

    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });

    return {
      email,
      otpDigits,
      countdown,
      isOtpComplete,
      loading,
      errorMessage,
      successMessage,
      resendLoading,
      type,
      setInputRef,
      handleInput,
      handleKeyDown,
      handlePaste,
      resendCode,
      verifyOtp,
      goBack,
    };
  },
});
