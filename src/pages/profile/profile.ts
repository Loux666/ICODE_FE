import { defineComponent, computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { getAvatarUrl } from '@/utils/media';

export default defineComponent({
  name: 'ProfilePage',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const isLoading = ref(false);

    // Consolidate mounting logic
    onMounted(async () => {
      isLoading.value = true;
      await authStore.fetchProfile();
      if (authStore.user) {
        editName.value = authStore.user.name || '';
      }
      isLoading.value = false;
    });

    const fullName = computed(() => authStore.user?.name || authStore.user?.username || 'Người dùng');
    const userEmail = computed(() => authStore.user?.email || '—');
    const avatarUrl = computed(() => previewAvatar.value || getAvatarUrl(authStore.user?.avatar, 120));
    const userRole = computed(() => authStore.user?.role || 'user');
    const isActivated = computed(() => authStore.user?.is_activated === 1);
    const isEmailVerified = computed(() => !!authStore.user?.email_verified_at);
    const createdAt = computed(() => {
      if (!authStore.user?.created_at) return '—';
      const date = new Date(authStore.user.created_at);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Editable fields
    const editName = ref('');
    const previewAvatar = ref<string | null>(null);
    const avatarFile = ref<File | null>(null);
    const isSaving = ref(false);

    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const onAvatarChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        avatarFile.value = file;
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          previewAvatar.value = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSaveProfile = async () => {
      if (isSaving.value) return;
      isSaving.value = true;

      const success = await authStore.updateProfile({
        name: editName.value,
        avatar: avatarFile.value
      });

      if (success) {
        alert('Cập nhật thông tin thành công!');
        // Reset file and preview
        avatarFile.value = null;
        previewAvatar.value = null;
      } else {
        alert('Cập nhật thất bại, vui lòng thử lại.');
      }
      isSaving.value = false;
    };

    const handleUpdateEmail = () => {
      // Logic for email update could be a redirect or modal
      alert('Chức năng cập nhật email sẽ được thực hiện qua một quy trình xác thực riêng.');
    };

    const goToChangePassword = () => {
      router.push('/profile/change-password');
    };

    return {
      fullName,
      userEmail,
      avatarUrl,
      userRole,
      isActivated,
      isEmailVerified,
      createdAt,
      isLoading,
      editName,
      isSaving,
      onAvatarChange,
      fileInput,
      triggerFileInput,
      handleSaveProfile,
      handleUpdateEmail,
      goToChangePassword,
    };
  }
});
