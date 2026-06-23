import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // 1. Import
import { useAuthStore } from '@/store/auth';
import { getAvatarUrl } from '@/utils/media';
import api, { headerApi } from '@/services/api';

interface ChildCategory {
  id: number;
  name: string;
  slug: string;
}

interface ParentCategory {
  id: number;
  name: string;
  slug: string;
  children: ChildCategory[];
}

interface Audience {
  id: number;
  name: string;
  label: string;
  categories: ParentCategory[];
}

interface Collection {
  id: number;
  name: string;
  slug: string;
}

interface HeaderData {
  collections: Collection[];
  audiences: Audience[];
}

export default defineComponent({
  emits: ['toggle-sidebar'],
  setup() {
    // 2. Khởi tạo router instance (QUAN TRỌNG)
    const router = useRouter();
    
    // Header data from API
    const collections = ref<Collection[]>([]);
    const audiences = ref<Audience[]>([]);

    // Logic scroll giữ nguyên
    const isScrolled = ref(false);
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10;
    };

    const authStore = useAuthStore();
    
    // Fetch header data
    const fetchHeaderData = async () => {
      try {
        const response = await headerApi.getHeader();
        if (response.data) {
          collections.value = response.data.collections || [];
          audiences.value = response.data.audiences || [];
        }
      } catch (error) {
        console.error('Failed to fetch header data:', error);
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    const goToLogin = () => {
      router.push('/login'); 
    };

    const goToRegister = () => {
      router.push('/register'); 
    };

    // User menu
    const showDropdown = ref(false);
    const toggleDropdown = () => (showDropdown.value = !showDropdown.value);

    const userName = computed(() => {
      return authStore.user?.name || authStore.user?.username || '';
    });

    const avatarUrl = computed(() => getAvatarUrl(authStore.user?.avatar, 40));

    const goToProfile = () => {
      showDropdown.value = false;
      router.push('/profile');
    };

    const logout = async () => {
      showDropdown.value = false;
      await authStore.logout();
    };

    // Product menu toggle
    const showProductMenu = ref(false);
    const toggleProductMenu = () => {
      showProductMenu.value = !showProductMenu.value;
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu')) showDropdown.value = false;
      if (!target.closest('.product-submenu') && !target.closest('.nav-link')) {
        showProductMenu.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('click', handleDocumentClick);
      fetchHeaderData();
    });
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleDocumentClick);
    });

    return {
      isScrolled,
      goToLogin,
      goToRegister,
      // user menu
      showDropdown,
      toggleDropdown,
      userName,
      avatarUrl,
      goToProfile,
      logout,
      // product menu
      showProductMenu,
      toggleProductMenu,
      // expose auth status
      isAuthenticated: computed(() => authStore.isAuthenticated),
      // header data
      collections,
      audiences,
    };
  }
});