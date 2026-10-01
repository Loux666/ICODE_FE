<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { bookApi } from '../services/api';
import { useBookshelfStore } from '../store/bookshelf';
import type { WorkDetails, ReadingStatus } from '../types/book';
import {
  X,
  BookOpen,
  Calendar,
  Layers,
  User,
  BookmarkPlus,
  BookmarkCheck,
  Star,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  workId: string | null;
  bookSnapshot?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'added'): void;
}>();

const store = useBookshelfStore();

const loading = ref(false);
const details = ref<WorkDetails | null>(null);
const adding = ref(false);
const showAddSuccess = ref(false);
const initialStatus = ref<ReadingStatus>('WANT_TO_READ');

const fetchWorkDetails = async () => {
  if (!props.workId) return;

  const snap = props.bookSnapshot;
  details.value = {
    workId: props.workId,
    title: snap?.title || 'Đang tải...',
    description: snap?.description || '',
    author: snap?.author || null,
    coverUrl: snap?.coverUrl || null,
    subjects: snap?.subjects || [],
    publishYear: snap?.publishYear || null,
    totalPages: snap?.totalPages || 0,
    isInBookshelf: snap?.isInBookshelf || false,
    bookshelfBook: snap?.bookshelfBook || null,
  };

  loading.value = true;
  showAddSuccess.value = false;
  initialStatus.value = 'WANT_TO_READ';

  try {
    const res = await bookApi.getWorkDetails(props.workId);
    details.value = {
      ...details.value,
      ...res,
      author: res.author || snap?.author || res.bookshelfBook?.author || null,
      publishYear: res.publishYear || snap?.publishYear || res.bookshelfBook?.publishYear || null,
      totalPages: res.totalPages || snap?.totalPages || res.bookshelfBook?.totalPages || 0,
      coverUrl: res.coverUrl || snap?.coverUrl || res.bookshelfBook?.coverUrl || null,
      title: res.title || snap?.title || 'Chưa có tiêu đề',
      description: res.description || snap?.description || '',
      subjects: (res.subjects && res.subjects.length > 0) ? res.subjects : (snap?.subjects || []),
      isInBookshelf: res.isInBookshelf ?? snap?.isInBookshelf ?? false,
      bookshelfBook: res.bookshelfBook || snap?.bookshelfBook || null,
    };
  } catch (err) {
    console.error('Failed to load work details:', err);
    if (!details.value && snap) {
      details.value = {
        workId: props.workId,
        title: snap.title,
        description: snap.description || 'Không có mô tả chi tiết cho cuốn sách này.',
        author: snap.author || null,
        coverUrl: snap.coverUrl || null,
        subjects: snap.subjects || [],
        publishYear: snap.publishYear || null,
        totalPages: snap.totalPages || 0,
        isInBookshelf: snap.isInBookshelf || false,
        bookshelfBook: null,
      };
    }
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
      if (props.workId) {
        fetchWorkDetails();
      }
    } else {
      document.body.style.overflow = '';
      details.value = null;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.body.style.overflow = '';
});

const handleClose = () => {
  document.body.style.overflow = '';
  emit('close');
};

const handleAddToShelf = async () => {
  if (!details.value || adding.value) return;
  adding.value = true;
  try {
    const total = details.value.totalPages || 0;
    const initialPages = initialStatus.value === 'COMPLETED' ? total : 0;

    await store.addBook({
      workId: details.value.workId,
      title: details.value.title,
      author: details.value.author,
      coverUrl: details.value.coverUrl,
      publishYear: details.value.publishYear,
      totalPages: total,
      description: details.value.description,
      subjects: details.value.subjects,
      status: initialStatus.value,
      currentPage: initialPages,
    });
    details.value.isInBookshelf = true;
    showAddSuccess.value = true;
    emit('added');
  } catch (err) {
    // Handled in store toast
  } finally {
    adding.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div v-if="show" class="modal-root" @click="handleClose">
        <div class="modal-overlay"></div>
        <div class="modal-container">
          <div class="modal-content" @click.stop>
            <!-- Close Button -->
            <button class="close-btn" @click="handleClose" aria-label="Đóng modal">
              <X :size="20" />
            </button>

            <!-- Details Content -->
            <div v-if="details" class="details-body">
              <div class="details-grid">
                <!-- Left: Cover & Action -->
                <div class="cover-column">
                  <div class="cover-wrapper">
                    <img
                      v-if="details.coverUrl"
                      :src="details.coverUrl"
                      :alt="details.title"
                      class="book-cover"
                      decoding="async"
                    />
                    <div v-else class="fallback-cover">
                      <BookOpen :size="50" />
                      <span class="fallback-title">{{ details.title }}</span>
                    </div>
                  </div>

                  <!-- Status & Action Box -->
                  <div class="shelf-action-box">
                    <div v-if="details.isInBookshelf" class="in-shelf-badge">
                      <BookmarkCheck :size="18" />
                      <span>Đã có trong tủ sách</span>
                    </div>

                    <!-- Add with Initial Status Selection -->
                    <div v-else class="add-shelf-flow">
                      <label class="status-select-label">Chọn trạng thái ban đầu:</label>
                      <div class="status-pill-selector">
                        <button
                          type="button"
                          class="status-choice want"
                          :class="{ active: initialStatus === 'WANT_TO_READ' }"
                          @click="initialStatus = 'WANT_TO_READ'"
                        >
                          Muốn đọc
                        </button>
                        <button
                          type="button"
                          class="status-choice reading"
                          :class="{ active: initialStatus === 'READING' }"
                          @click="initialStatus = 'READING'"
                        >
                          Đang đọc
                        </button>
                        <button
                          type="button"
                          class="status-choice completed"
                          :class="{ active: initialStatus === 'COMPLETED' }"
                          @click="initialStatus = 'COMPLETED'"
                        >
                          Đã đọc
                        </button>
                      </div>

                      <button
                        class="btn-add-shelf"
                        :disabled="adding"
                        @click="handleAddToShelf"
                      >
                        <Loader2 v-if="adding" class="spinner" :size="18" />
                        <BookmarkPlus v-else :size="18" />
                        <span>{{ adding ? 'Đang lưu...' : '+ Thêm vào Tủ sách' }}</span>
                      </button>
                    </div>

                    <div v-if="showAddSuccess" class="add-success-msg">
                      <CheckCircle2 :size="16" />
                      <span>Đã thêm thành công vào tủ sách!</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Info & Full Description -->
                <div class="info-column">
                  <div class="header-info">
                    <h2 class="book-title">{{ details.title }}</h2>
                    <p class="book-author">
                      <User :size="16" />
                      <span>Tác giả: <b>{{ details.author || 'Chưa rõ tác giả' }}</b></span>
                    </p>
                  </div>

                  <!-- Meta Badges -->
                  <div class="meta-row">
                    <span v-if="details.publishYear" class="meta-tag">
                      <Calendar :size="14" /> Xuất bản: <b>{{ details.publishYear }}</b>
                    </span>
                    <span v-if="details.totalPages && details.totalPages > 0" class="meta-tag">
                      <Layers :size="14" /> <b>{{ details.totalPages }}</b> trang
                    </span>
                    <span class="meta-tag id-tag">
                      Mã tác phẩm: <b>{{ details.workId }}</b>
                    </span>
                  </div>

                  <!-- Bookshelf Current Progress if added -->
                  <div v-if="details.bookshelfBook" class="shelf-status-card">
                    <div class="shelf-status-header">
                      <span class="shelf-status-title">Trạng thái trong tủ sách:</span>
                      <span
                        class="badge"
                        :class="{
                          'badge-want': details.bookshelfBook.status === 'WANT_TO_READ',
                          'badge-reading': details.bookshelfBook.status === 'READING',
                          'badge-completed': details.bookshelfBook.status === 'COMPLETED',
                        }"
                      >
                        {{
                          details.bookshelfBook.status === 'READING'
                            ? 'Đang đọc'
                            : details.bookshelfBook.status === 'COMPLETED'
                            ? 'Đã đọc'
                            : 'Muốn đọc'
                        }}
                      </span>
                    </div>

                    <div class="shelf-progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: details.bookshelfBook.progressPercent + '%' }"
                      ></div>
                    </div>
                    <div class="progress-labels">
                      <span>Trang {{ details.bookshelfBook.currentPage }} / {{ details.bookshelfBook.totalPages }}</span>
                      <b>{{ details.bookshelfBook.progressPercent }}% hoàn thành</b>
                    </div>

                    <!-- Reading Dates -->
                    <div v-if="details.bookshelfBook.startDate || details.bookshelfBook.finishDate" class="reading-dates">
                      <span v-if="details.bookshelfBook.startDate" class="date-item">
                        <Clock :size="13" /> Bắt đầu: {{ new Date(details.bookshelfBook.startDate).toLocaleDateString('vi-VN') }}
                      </span>
                      <span v-if="details.bookshelfBook.finishDate" class="date-item">
                        <CheckCircle2 :size="13" /> Xong: {{ new Date(details.bookshelfBook.finishDate).toLocaleDateString('vi-VN') }}
                      </span>
                    </div>

                    <div v-if="details.bookshelfBook.rating" class="user-rating">
                      <span class="rating-label">Đánh giá:</span>
                      <div class="stars">
                        <Star
                          v-for="s in 5"
                          :key="s"
                          :size="15"
                          :class="{ filled: s <= details.bookshelfBook.rating }"
                        />
                      </div>
                    </div>

                    <div v-if="details.bookshelfBook.notes" class="user-notes">
                      <span class="notes-label">Ghi chú cá nhân:</span>
                      <p>{{ details.bookshelfBook.notes }}</p>
                    </div>
                  </div>

                  <!-- Full Description -->
                  <div class="desc-section">
                    <div class="desc-header">
                      <h4 class="section-title">Giới thiệu nội dung</h4>
                      <Loader2 v-if="loading" class="spinner spinner-sm text-subtle" :size="14" />
                    </div>
                    <div class="desc-content">
                      <p class="full-text">{{ details.description || (loading ? 'Đang tải tóm tắt nội dung chi tiết...' : 'Chưa có thông tin mô tả chi tiết cho tác phẩm này.') }}</p>
                    </div>
                  </div>

                  <!-- Subjects Tags -->
                  <div v-if="details.subjects && details.subjects.length > 0" class="subjects-section">
                    <h4 class="section-title">Chủ đề / Thể loại</h4>
                    <div class="tags-list">
                      <span
                        v-for="(sub, idx) in details.subjects"
                        :key="idx"
                        class="subject-pill"
                      >
                        {{ sub }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 28px 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  z-index: 1;
}

.modal-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1040px;
  margin: auto;
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}

.modal-content {
  background: #ffffff;
  border-radius: var(--radius-xl);
  border: 1px solid #e2e8f0;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.22);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
  transition: all 0.15s ease;
}
.close-btn:hover {
  background: #e2e8f0;
  color: var(--text-main);
}

.details-body {
  padding: 32px 36px;
}

.details-grid {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 32px;
  align-items: start;
}

/* Left Column */
.cover-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cover-wrapper {
  width: 100%;
  height: 360px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: #f1f5f9;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fallback-cover {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.fallback-title {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shelf-action-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-select-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 4px;
  display: block;
}

.status-pill-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid #e2e8f0;
  margin-bottom: 8px;
}

.status-choice {
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.status-choice.want.active {
  background: #ffffff;
  color: var(--sky);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.status-choice.reading.active {
  background: #ffffff;
  color: var(--amber);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.status-choice.completed.active {
  background: #ffffff;
  color: var(--emerald);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-add-shelf {
  width: 100%;
  padding: 11px 16px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.92rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  transition: background 0.15s ease;
}
.btn-add-shelf:hover:not(:disabled) {
  background: var(--primary-hover);
}

.in-shelf-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  background: var(--primary-light);
  border: 1px solid rgba(79, 70, 229, 0.25);
  color: var(--primary);
  font-weight: 600;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
}

.add-success-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--emerald);
  font-size: 0.82rem;
  font-weight: 600;
  margin-top: 4px;
  justify-content: center;
}

/* Right Column */
.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.book-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.25;
  margin-bottom: 6px;
  padding-right: 40px;
  letter-spacing: -0.3px;
}

.book-author {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.book-author b {
  color: var(--text-main);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #f1f5f9;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  color: var(--text-muted);
  border: 1px solid #e2e8f0;
}
.meta-tag b {
  color: var(--text-main);
}
.meta-tag.id-tag {
  font-family: monospace;
  font-size: 0.78rem;
}

.shelf-status-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shelf-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shelf-status-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.shelf-progress-bar {
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  border-radius: 999px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.reading-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.78rem;
  color: var(--text-subtle);
  margin-top: 2px;
}
.date-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.user-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}
.stars {
  display: flex;
  gap: 3px;
  color: #cbd5e1;
}
.stars .filled {
  color: #f59e0b;
  fill: #f59e0b;
}

.user-notes {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: #ffffff;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid #e2e8f0;
}
.notes-label {
  font-weight: 600;
  color: var(--text-main);
  display: block;
  margin-bottom: 2px;
}

.desc-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.spinner-sm {
  animation: spin 1s linear infinite;
}

.desc-content .full-text {
  font-size: 0.92rem;
  color: var(--text-muted);
  line-height: 1.65;
  white-space: pre-line;
  overflow: visible;
}

.subjects-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.subject-pill {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* Modal Transitions */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.15s ease;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

.modal-pop-enter-active .modal-container {
  transition: transform 0.15s cubic-bezier(0, 0, 0.2, 1), opacity 0.15s ease;
}

.modal-pop-leave-active .modal-container {
  transition: transform 0.12s ease, opacity 0.12s ease;
}

.modal-pop-enter-from .modal-container {
  opacity: 0;
  transform: translate3d(0, 8px, 0) scale(0.98);
}

.modal-pop-leave-to .modal-container {
  opacity: 0;
  transform: translate3d(0, 8px, 0) scale(0.98);
}

@media (max-width: 800px) {
  .details-body {
    padding: 22px;
  }
  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .cover-wrapper {
    max-width: 200px;
    height: 280px;
    margin: 0 auto;
  }
}
</style>
