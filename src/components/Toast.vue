<script setup lang="ts">
import { useBookshelfStore } from '../store/bookshelf';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const store = useBookshelfStore();
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in store.toasts"
        :key="toast.id"
        class="toast-item"
        :class="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="18" />
          <Info v-else :size="18" />
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="store.removeToast(toast.id)">
          <X :size="14" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 380px;
  width: 100%;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: #ffffff;
}

.toast-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.toast-success .toast-icon {
  color: #16a34a;
}

.toast-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
.toast-error .toast-icon {
  color: #dc2626;
}

.toast-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
.toast-info .toast-icon {
  color: #2563eb;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
</style>
