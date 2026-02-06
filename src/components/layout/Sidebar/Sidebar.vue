<template>
  <div>
    <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>
    <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
      <div class="sidebar-header">
        <h3>Menu</h3>
        <button class="close-btn" @click="$emit('close')" aria-label="Đóng">
          <span>&times;</span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <a href="/" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">🏠</span>
          <span>Trang chủ</span>
        </a>
        <a href="/about" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">ℹ️</span>
          <span>Giới thiệu</span>
        </a>
        <a href="/products" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">🛍️</span>
          <span>Sản phẩm</span>
        </a>
        <a href="/services" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">⚙️</span>
          <span>Dịch vụ</span>
        </a>
        <a href="/blog" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">📝</span>
          <span>Blog</span>
        </a>
        <a href="/contact" class="nav-item" @click="$emit('close')">
          <span class="nav-icon">📧</span>
          <span>Liên hệ</span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-icon">👤</span>
          <span>Chưa đăng nhập</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8f9fa;
  border-left-color: #007bff;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 14px;
}

.user-icon {
  font-size: 24px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 260px;
  }
}
</style>