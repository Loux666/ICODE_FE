<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBookshelfStore } from '../store/bookshelf';
import type { BookshelfItem, ReadingStatus } from '../types/book';
import EditBookModal from '../components/EditBookModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import BookDetailModal from '../components/BookDetailModal.vue';
import {
  BookOpen,
  Star,
  Search,
  ArrowUpDown,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-vue-next';

const store = useBookshelfStore();

// Filters & Sort
const activeTab = ref<'ALL' | ReadingStatus>('ALL');
const searchQuery = ref('');
const sortBy = ref<'updatedAt' | 'progress' | 'rating' | 'title'>('updatedAt');

// Modals
const showEditModal = ref(false);
const editingBook = ref<BookshelfItem | null>(null);

const showConfirmDelete = ref(false);
const deletingBook = ref<BookshelfItem | null>(null);
const deleting = ref(false);

const showDetailModal = ref(false);
const selectedWorkId = ref<string | null>(null);

onMounted(() => {
  store.fetchBooks();
  store.fetchStats();
});

// Filtered & Sorted list
const filteredBooks = computed(() => {
  let list = [...store.books];

  // 1. Status Filter
  if (activeTab.value !== 'ALL') {
    list = list.filter((b) => b.status === activeTab.value);
  }

  // 2. Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q))
    );
  }

  // 3. Sort
  list.sort((a, b) => {
    if (sortBy.value === 'progress') {
      return b.progressPercent - a.progressPercent;
    }
    if (sortBy.value === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy.value === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return list;
});

// Action Handlers
const openEditModal = (book: BookshelfItem) => {
  editingBook.value = { ...book };
  showEditModal.value = true;
};

const openConfirmDelete = (book: BookshelfItem) => {
  deletingBook.value = book;
  showConfirmDelete.value = true;
};

const handleDelete = async () => {
  if (!deletingBook.value || deleting.value) return;
  deleting.value = true;
  try {
    await store.deleteBook(deletingBook.value.id);
    showConfirmDelete.value = false;
    deletingBook.value = null;
  } catch (err) {
    // Handled in store
  } finally {
    deleting.value = false;
  }
};

const openDetailView = (book: BookshelfItem) => {
  selectedWorkId.value = book.workId;
  showDetailModal.value = true;
};

// Quick Page Increment (+10 / +50 pages)
const quickAddPages = async (event: Event, book: BookshelfItem, amount: number) => {
  event.stopPropagation();
  const newPage = Math.min(book.totalPages || 9999, book.currentPage + amount);
  try {
    await store.updateBook(book.id, {
      currentPage: newPage,
      status: book.totalPages > 0 && newPage >= book.totalPages ? 'COMPLETED' : 'READING',
    });
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <div class="bookshelf-page animate-fade">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Tủ Sách Của Tôi</h1>
          <p class="page-desc">Theo dõi tiến độ, lưu cảm nhận và chinh phục mục tiêu đọc sách.</p>
        </div>

        <router-link to="/" class="btn-find-more">
          <Plus :size="18" />
          <span>Tìm & Thêm sách mới</span>
        </router-link>
      </div>

      

      <!-- Filter Tabs & Controls -->
      <div class="controls-bar">
        <!-- Status Tabs -->
        <div class="filter-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'ALL' }"
            @click="activeTab = 'ALL'"
          >
            Tất cả ({{ store.books.length }})
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'WANT_TO_READ' }"
            @click="activeTab = 'WANT_TO_READ'"
          >
            Muốn đọc ({{ store.stats.wantToReadCount }})
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'READING' }"
            @click="activeTab = 'READING'"
          >
            Đang đọc ({{ store.stats.readingCount }})
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'COMPLETED' }"
            @click="activeTab = 'COMPLETED'"
          >
            Đã đọc ({{ store.stats.completedCount }})
          </button>
        </div>

        <!-- Search & Sort in Shelf -->
        <div class="right-controls">
          <div class="shelf-search">
            <Search :size="16" class="shelf-search-icon" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Tìm trong tủ sách..."
              class="shelf-search-input"
            />
          </div>

          <div class="shelf-sort">
            <ArrowUpDown :size="15" class="sort-icon" />
            <select v-model="sortBy" class="sort-select">
              <option value="updatedAt">Mới cập nhật</option>
              <option value="progress">Tiến độ đọc (%)</option>
              <option value="rating">Điểm đánh giá</option>
              <option value="title">Tên sách (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Books Grid -->
      <div v-if="filteredBooks.length > 0" class="bookshelf-grid">
        <div
          v-for="book in filteredBooks"
          :key="book.id"
          class="shelf-card"
          @click="openDetailView(book)"
        >
          <!-- Cover Image -->
          <div class="shelf-cover">
            <img
              v-if="book.coverUrl"
              :src="book.coverUrl"
              :alt="book.title"
              class="cover-img"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="fallback-cover">
              <BookOpen :size="36" />
              <span>{{ book.title }}</span>
            </div>

            <!-- Status Badge on top -->
            <div
              class="status-badge"
              :class="{
                'badge-want': book.status === 'WANT_TO_READ',
                'badge-reading': book.status === 'READING',
                'badge-completed': book.status === 'COMPLETED',
              }"
            >
              {{
                book.status === 'READING'
                  ? 'Đang đọc'
                  : book.status === 'COMPLETED'
                  ? 'Đã đọc'
                  : 'Muốn đọc'
              }}
            </div>
          </div>

          <!-- Shelf Content -->
          <div class="shelf-content">
            <div class="book-info">
              <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
              <p class="book-author" :title="book.author || 'Chưa rõ tác giả'">
                {{ book.author || 'Chưa rõ tác giả' }}
              </p>
            </div>

            <!-- Progress Bar Section -->
            <div class="progress-section">
              <div class="progress-header">
                <span class="pages-text">
                  <b>{{ book.currentPage }}</b> / {{ book.totalPages || '?' }} trang
                </span>
                <span class="percent-text">{{ book.progressPercent }}%</span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{ width: book.progressPercent + '%' }"
                  :class="{ completed: book.status === 'COMPLETED' }"
                ></div>
              </div>
            </div>

            <!-- Reading Dates Tracking -->
            <div v-if="book.startDate || book.finishDate" class="reading-dates-info">
              <span v-if="book.startDate" class="date-chip">
                <Clock :size="12" /> Bắt đầu: {{ new Date(book.startDate).toLocaleDateString('vi-VN') }}
              </span>
              <span v-if="book.finishDate" class="date-chip finish">
                <CheckCircle2 :size="12" /> Xong: {{ new Date(book.finishDate).toLocaleDateString('vi-VN') }}
              </span>
            </div>

            <!-- Star Rating & Quick Buttons -->
            <div class="card-bottom-meta">
              <div v-if="book.rating" class="rating-display">
                <Star
                  v-for="s in 5"
                  :key="s"
                  :size="13"
                  :class="{ filled: s <= book.rating }"
                />
              </div>
              <span v-else class="no-rating">Chưa chấm điểm</span>

              <!-- Quick Increment buttons when READING -->
              <div v-if="book.status === 'READING' && book.totalPages > 0 && book.currentPage < book.totalPages" class="quick-add-pills">
                <button
                  class="pill-btn"
                  title="Đã đọc thêm 10 trang"
                  @click="quickAddPages($event, book, 10)"
                >
                  +10
                </button>
                <button
                  class="pill-btn"
                  title="Đã đọc thêm 50 trang"
                  @click="quickAddPages($event, book, 50)"
                >
                  +50
                </button>
              </div>
            </div>

            <!-- Notes preview -->
            <p v-if="book.notes" class="notes-snippet" :title="book.notes">
              "{{ book.notes }}"
            </p>

            <!-- Card Actions -->
            <div class="card-actions" @click.stop>
              <button class="action-btn edit-btn" @click="openEditModal(book)">
                <Edit3 :size="15" />
                <span>Cập nhật</span>
              </button>
              <button class="action-btn delete-btn" @click="openConfirmDelete(book)">
                <Trash2 :size="15" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-shelf">
        <BookOpen :size="64" class="empty-icon" />
        <h3>Chưa có cuốn sách nào ở mục này</h3>
        <p v-if="searchQuery">
          Không tìm thấy sách phù hợp với từ khóa "<b>{{ searchQuery }}</b>".
        </p>
        <p v-else>
          Khám phá và thêm những cuốn sách bạn yêu thích vào tủ sách ngay hôm nay!
        </p>
        <router-link to="/" class="btn-explore">
          <Sparkles :size="18" />
          <span>Tìm sách ngay</span>
        </router-link>
      </div>
    </div>

    <!-- Modals -->
    <EditBookModal
      :show="showEditModal"
      :book="editingBook"
      @close="showEditModal = false"
      @saved="store.fetchStats"
    />

    <ConfirmModal
      :show="showConfirmDelete"
      title="Xác nhận xóa sách"
      :message="'Bạn có chắc chắn muốn xóa cuốn sách \'' + (deletingBook?.title || '') + '\' khỏi tủ sách?'"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showConfirmDelete = false"
    />

    <BookDetailModal
      :show="showDetailModal"
      :work-id="selectedWorkId"
      @close="showDetailModal = false"
    />
  </div>
</template>

<style scoped>
.bookshelf-page {
  padding: 40px 0 80px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-main);
  margin-bottom: 4px;
}

.page-desc {
  font-size: 1rem;
  color: var(--text-muted);
}

.btn-find-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: 0.92rem;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
  transition: all 0.2s;
}
.btn-find-more:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Stats Row */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 32px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: var(--primary-light);
  color: var(--primary);
}

.stat-icon.reading {
  background: var(--amber-light);
  color: var(--amber);
}

.stat-icon.completed {
  background: var(--emerald-light);
  color: var(--emerald);
}

.stat-icon.pages {
  background: var(--sky-light);
  color: var(--sky);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.stat-sub {
  font-size: 0.78rem;
  color: var(--amber);
  font-weight: 600;
  margin-top: 2px;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 7px 16px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--text-main);
}
.tab-btn.active {
  background: #ffffff;
  color: var(--primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shelf-search {
  position: relative;
  display: flex;
  align-items: center;
}

.shelf-search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-subtle);
}

.shelf-search-input {
  padding: 8px 12px 8px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #ffffff;
  font-size: 0.88rem;
  color: var(--text-main);
  width: 200px;
  transition: all 0.2s;
}
.shelf-search-input:focus {
  width: 240px;
  border-color: var(--primary);
}

.shelf-sort {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-icon {
  position: absolute;
  left: 10px;
  color: var(--text-subtle);
  pointer-events: none;
}

.sort-select {
  padding: 8px 14px 8px 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #ffffff;
  font-size: 0.88rem;
  color: var(--text-main);
  font-weight: 500;
  cursor: pointer;
}

/* Bookshelf Grid */
.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.shelf-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.shelf-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: #cbd5e1;
}

.shelf-cover {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f1f5f9;
  overflow: hidden;
}

.cover-img {
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
  gap: 8px;
  padding: 16px;
  text-align: center;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.shelf-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.book-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.35;
  margin-bottom: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Progress Section */
.progress-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 10px 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.progress-header b {
  color: var(--text-main);
}
.percent-text {
  font-weight: 700;
  color: var(--primary);
}

.progress-track {
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.progress-bar.completed {
  background: linear-gradient(90deg, #059669, #10b981);
}

/* Reading Dates Info */
.reading-dates-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--text-subtle);
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}
.date-chip.finish {
  color: var(--emerald);
  background: var(--emerald-light);
}

/* Bottom Meta */
.card-bottom-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-display {
  display: flex;
  gap: 2px;
  color: #cbd5e1;
}
.rating-display .filled {
  color: #f59e0b;
  fill: #f59e0b;
}

.no-rating {
  font-size: 0.75rem;
  color: var(--text-subtle);
  font-style: italic;
}

.quick-add-pills {
  display: flex;
  gap: 4px;
}

.pill-btn {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.pill-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary);
}

.notes-snippet {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

/* Actions */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.edit-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: var(--text-main);
}
.edit-btn:hover {
  background: var(--primary-light);
  color: var(--primary);
  border-color: rgba(79, 70, 229, 0.3);
}

.delete-btn {
  background: #ffffff;
  border: 1px solid #fee2e2;
  color: var(--rose);
}
.delete-btn:hover {
  background: var(--rose-light);
}

/* Empty Shelf */
.empty-shelf {
  text-align: center;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.empty-icon {
  color: var(--text-subtle);
}
.empty-shelf h3 {
  font-size: 1.4rem;
  color: var(--text-main);
}
.empty-shelf p {
  color: var(--text-muted);
  max-width: 440px;
}

.btn-explore {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 12px;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}
.btn-explore:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-tabs {
    overflow-x: auto;
  }
  .right-controls {
    flex-direction: column;
  }
  .shelf-search-input {
    width: 100%;
  }
}
</style>
