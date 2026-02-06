import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
    name: 'RegisterPage',
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();
        const name = ref('');
        const email = ref('');
        const password = ref('');
        const password_confirmation = ref('');
        const errorMessage = ref('');

        const handleRegister = async () => {
            errorMessage.value = '';

            if (password.value !== password_confirmation.value) {
                errorMessage.value = 'Mật khẩu nhập lại không khớp!';
                return;
            }

            const success = await authStore.register({
                name: name.value,
                email: email.value,
                password: password.value,
                password_confirmation: password_confirmation.value,
            });

            if (success) {
                alert('Đăng ký thành công');
                // Navigate to OTP page and include type and email so OTP page can know context
                router.push({ name: 'otp', query: { type: 'registration', email: email.value } });
            } else {
                alert('Đăng ký thất bại');
            }
        };

        return {
            name,
            email,
            password,
            password_confirmation,
            errorMessage,
            handleRegister,
        };
    },
});