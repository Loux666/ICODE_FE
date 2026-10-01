<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue';
import { useBookshelfStore } from '../store/bookshelf';
import type { BookshelfItem, ReadingStatus } from '../types/book';
import { X, Star, BookOpen, Layers, Check, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  book: BookshelfItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const store = useBookshelfStore();

const status = ref<ReadingStatus>('WANT_TO_READ');
const currentPage = ref(0);
const totalPages = ref(0);
const rating = ref<number | null>(null);
const notes = ref('');
const loading = ref(false);

watch(
  () => props.book,
  (b) => {
    if (b) {
      status.value = b.status;
      currentPage.value = b.currentPage;
      totalPages.value = b.totalPages || 0;
      rating.value = b.rating;
      notes.value = b.notes || '';
    }
  },
  { immediate: true }
);

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

const handleClose = () => {
  document.body.style.overflow = '';
  emit('close');
};

const progressPercent = computed(() => {
  if (!totalPages.value || totalPages.value <= 0) return 0;
  return Math.min(100, Math.round((currentPage.value / totalPages.value) * 100));
});

watch(currentPage, (val) => {
  if (totalPages.value > 0 && val >= totalPages.value && status.value !== 'COMPLETED') {
    status.value = 'COMPLETED';
  } else if (val > 0 && status.value === 'WANT_TO_READ') {
    status.value = 'READING';
  }
});

const setRating = (r: number) => {
  rating.value = rating.value === r ? null : r;
};

const handleSave = async () => {
  if (!props.book || loading.value) return;
  loading.value = true;
  try {
    await store.updateBook(props.book.id, {
      status: status.value,
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      rating: rating.value,
      notes: notes.value,
    });
    emit('saved');
    handleClose();
  } catch (err) {
    // Handled in store
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show && book" class="modal-root" @click="handleClose">
        <div class="modal-overlay"></div>
        <div class="modal-container">
          <div class="modal-card" @click.stop>
            <div class="modal-header">
              <div class="header-text">
                <h3 class="modal-title">Cập nhật tiến độ đọc</h3>
                <p class="book-subtitle">{{ book.title }}</p>
              </div>
              <button class="close-btn" @click="handleClose" aria-label="Đóng modal">
                <X :size="20" />
              </button>
            </div>

            <div class="modal-body">
              <!-- Status Selector -->
              <div class="form-group">
                <label class="form-label">Trạng thái đọc</label>
                <div class="status-options">
                  <button
                    type="button"
                    class="status-btn want"
                    :class="{ active: status === 'WANT_TO_READ' }"
                    @click="status = 'WANT_TO_READ'"
                  >
                    Muốn đọc
                  </button>
                  <button
                    type="button"
                    class="status-btn reading"
                    :class="{ active: status === 'READING' }"
                    @click="status = 'READING'"
                  >
                    Đang đọc
                  </button>
                  <button
                    type="button"
                    class="status-btn completed"
                    :class="{ active: status === 'COMPLETED' }"
                    @click="status = 'COMPLETED'"
                  >
                    Đã hoàn thành
                  </button>
                </div>
              </div>

              <!-- Page Progress -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Trang hiện tại</label>
                  <div class="input-with-icon">
                    <BookOpen :size="16" class="input-icon" />
                    <input
                      type="number"
                      v-model.number="currentPage"
                      min="0"
                      :max="totalPages || 9999"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Tổng số trang</label>
                  <div class="input-with-icon">
                    <Layers :size="16" class="input-icon" />
                    <input
                      type="number"
                      v-model.number="totalPages"
                      min="1"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Progress bar preview -->
              <div class="progress-preview">
                <div class="preview-header">
                  <span>Tiến độ hoàn thành</span>
                  <b>{{ progressPercent }}%</b>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" :style="{ width: progressPercent + '%' }"></div>
                </div>
              </div>

              <!-- Rating -->
              <div class="form-group">
                <label class="form-label">Đánh giá sao (Tùy chọn)</label>
                <div class="rating-stars">
                  <button
                    v-for="s in 5"
                    :key="s"
                    type="button"
                    class="star-btn"
                    :class="{ active: rating !== null && s <= rating }"
                    @click="setRating(s)"
                  >
                    <Star :size="24" :class="{ filled: rating !== null && s <= rating }" />
                  </button>
                  <span v-if="rating" class="rating-value">{{ rating }} / 5 sao</span>
                </div>
              </div>

              <!-- Notes -->
              <div class="form-group">
                <label class="form-label">Ghi chú cá nhân / Cảm nhận</label>
                <textarea
                  v-model="notes"
                  rows="3"
                  placeholder="Viết vài dòng cảm nhận hoặc lưu ý về cuốn sách..."
                  class="form-textarea"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-cancel" @click="handleClose" :disabled="loading">
                Hủy
              </button>
              <button class="btn btn-save" @click="handleSave" :disabled="loading">
                <Loader2 v-if="loading" class="spinner" :size="16" />
                <Check v-else :size="16" />
                <span>Lưu thay đổi</span>
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
  max-width: 490px;
  margin: auto;
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.book-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 360px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.close-btn:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.modal-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.status-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.status-btn {
  padding: 8px 6px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.status-btn:hover {
  border-color: #cbd5e1;
}

.status-btn.want.active {
  background: var(--sky-light);
  color: var(--sky);
  border-color: var(--sky);
}

.status-btn.reading.active {
  background: var(--amber-light);
  color: var(--amber);
  border-color: var(--amber);
}

.status-btn.completed.active {
  background: var(--emerald-light);
  color: var(--emerald);
  border-color: var(--emerald);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-subtle);
}

.form-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #ffffff;
  font-size: 0.9rem;
  color: var(--text-main);
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--primary);
}

.progress-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 10px 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.bar-bg {
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  border-radius: 999px;
  transition: width 0.25s ease;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #cbd5e1;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: transform 0.15s;
}
.star-btn:hover {
  transform: scale(1.15);
}
.star-btn .filled {
  color: #f59e0b;
  fill: #f59e0b;
}

.rating-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 6px;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #ffffff;
  font-size: 0.88rem;
  color: var(--text-main);
  resize: vertical;
}
.form-textarea:focus {
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid var(--border-color);
  background: #f8fafc;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save {
  background: var(--primary);
  border: 1px solid var(--primary);
  color: white;
}
.btn-save:hover {
  background: var(--primary-hover);
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
