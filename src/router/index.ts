import { createRouter, createWebHistory } from 'vue-router';
import SearchPage from '../pages/SearchPage.vue';
import BookshelfPage from '../pages/BookshelfPage.vue';

const routes = [
  {
    path: '/',
    name: 'Search',
    component: SearchPage,
    meta: { title: 'Tìm kiếm sách' },
  },
  {
    path: '/bookshelf',
    name: 'Bookshelf',
    component: BookshelfPage,
    meta: { title: 'Tủ sách của tôi' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  document.title = (to.meta.title ? to.meta.title + ' — ' : '') + 'Mini Reading Tracker';
});

export default router;
