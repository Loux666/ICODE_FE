<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { AlertTriangle, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

watch(
  () => props.show,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onUnmounted(() => {
  document.body.style.overflow = '';
});

const handleCancel = () => {
  document.body.style.overflow = '';
  emit('cancel');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-root" @click="handleCancel">
        <div class="modal-overlay"></div>
        <div class="modal-container">
          <div class="modal-card" @click.stop>
            <div class="modal-icon-wrapper">
              <div class="warning-icon">
                <AlertTriangle :size="28" />
              </div>
            </div>

            <div class="modal-body">
              <h3 class="modal-title">{{ title }}</h3>
              <p class="modal-desc">{{ message }}</p>
            </div>

            <div class="modal-actions">
              <button class="btn btn-cancel" @click="handleCancel" :disabled="loading">
                Hủy bỏ
              </button>
              <button class="btn btn-confirm" @click="emit('confirm')" :disabled="loading">
                <Trash2 :size="16" />
                <span>{{ confirmText || 'Xóa khỏi tủ' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 1;
}

.modal-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  margin: auto;
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  padding: 26px 22px;
  text-align: center;
  box-shadow: 0 20px 35px -5px rgba(15, 23, 42, 0.2);
}

.modal-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.warning-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--rose-light);
  color: var(--rose);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 22px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  flex: 1;
  padding: 9px 16px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: var(--text-muted);
}
.btn-cancel:hover {
  background: #e2e8f0;
  color: var(--text-main);
}

.btn-confirm {
  background: var(--rose);
  border: 1px solid var(--rose);
  color: white;
}
.btn-confirm:hover {
  background: var(--rose-hover);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.modal-fade-leave-active .modal-card {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.modal-fade-enter-from .modal-card {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.modal-fade-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
