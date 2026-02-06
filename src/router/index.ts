import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/store/auth';

// Import Layouts


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home/index.vue'), // Lazy Load
      meta: { layout: MainLayout }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/login/index.vue'), 
       
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/register/index.vue'), 
      
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/profile/index.vue'), 
      meta: { requiresAuth: true , layout: MainLayout}
      
    },
    {
      path: '/otp',
      name: 'otp',
      component: () => import('@/pages/otp/index.vue'),
    }

    
  ]
});

export default router;

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  // Ví dụ: Trang '/admin' hoặc '/create-prompt' cần đăng nhập
  // Ông có thể thêm meta: { requiresAuth: true } vào các route đó
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login'); // Chưa đăng nhập mà đòi vào -> Đá về Login
  } else {
    next(); // Ok cho qua
  }
});