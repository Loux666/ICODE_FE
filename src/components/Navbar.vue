<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBookshelfStore } from '../store/bookshelf';
import { BookmarkCheck, Search } from 'lucide-vue-next';

const route = useRoute();
const store = useBookshelfStore();

const totalBooks = computed(() => store.stats.totalBooks || store.books.length);
</script>

<template>
  <header class="navbar">
    <div class="container nav-content">
      

      <nav class="nav-links">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <Search :size="17" />
          <span>Tìm kiếm sách</span>
        </router-link>

        <router-link to="/bookshelf" class="nav-item" :class="{ active: route.path === '/bookshelf' }">
          <BookmarkCheck :size="17" />
          <span>Tủ sách của tôi</span>
          <span v-if="totalBooks > 0" class="nav-badge">{{ totalBooks }}</span>
        </router-link>
      </nav>

      
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text-main);
  letter-spacing: -0.4px;
}

.brand-tag {
  font-size: 0.72rem;
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--text-main);
}

.nav-item.active {
  color: white;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.nav-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}

.nav-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--text-muted);
  box-shadow: var(--shadow-sm);
}

.stat-pill b {
  color: var(--text-main);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.reading {
  background: var(--amber);
}

.dot.completed {
  background: var(--emerald);
}

@media (max-width: 768px) {
  .nav-stats, .brand-tag {
    display: none;
  }
}
</style>
