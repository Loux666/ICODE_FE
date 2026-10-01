<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { bookApi } from '../services/api';
import { useBookshelfStore } from '../store/bookshelf';
import type { OpenLibraryBook } from '../types/book';
import BookDetailModal from '../components/BookDetailModal.vue';
import {
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  BookmarkCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-vue-next';

const store = useBookshelfStore();

const searchInput = ref('');
const currentQuery = ref('');
const isDefaultFeed = ref(true);
const page = ref(1);
const limit = ref(20);
const books = ref<OpenLibraryBook[]>([]);
const totalBooks = ref(0);
const totalPages = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);

// Modal state
const showDetailModal = ref(false);
const selectedWorkId = ref<string | null>(null);
const selectedSnapshot = ref<any | null>(null);

// Quick suggestions
const suggestions = ['Harry Potter', 'The Great Gatsby', 'Clean Code', 'The Hobbit', 'Atomic Habits', '1984', 'Dune'];

// Default query to load popular books on open library
const DEFAULT_QUERY = 'classic literature';

const handleSearch = async (targetPage = 1, customQuery?: string) => {
  const q = customQuery !== undefined ? customQuery.trim() : searchInput.value.trim();
  
  // If empty input, fallback to default popular books
  const queryToSearch = q || DEFAULT_QUERY;
  isDefaultFeed.value = !q;

  loading.value = true;
  error.value = null;
  page.value = targetPage;
  currentQuery.value = q || 'Sách nổi bật';

  try {
    const result = await bookApi.search(queryToSearch, page.value, limit.value);
    books.value = result.books;
    totalBooks.value = result.total;
    totalPages.value = result.totalPages;
  } catch (err: any) {
    error.value = err?.response?.data?.message || err.message || 'Không thể tải danh sách sách lúc này';
  } finally {
    loading.value = false;
  }
};

const applySuggestion = (s: string) => {
  searchInput.value = s;
  handleSearch(1, s);
};

const clearSearch = () => {
  searchInput.value = '';
  handleSearch(1, '');
};

const openDetails = (book: OpenLibraryBook) => {
  selectedWorkId.value = book.workId;
  selectedSnapshot.value = book;
  showDetailModal.value = true;
};

// Quick add from card
const handleQuickAdd = async (event: Event, book: OpenLibraryBook) => {
  event.stopPropagation();
  if (book.isInBookshelf) return;

  try {
    await store.addBook({
      workId: book.workId,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      publishYear: book.publishYear,
      totalPages: book.totalPages,
      status: 'WANT_TO_READ',
      currentPage: 0,
    });
    book.isInBookshelf = true;
    book.bookshelfStatus = 'WANT_TO_READ';
  } catch (err) {
    // Handled in store toast
  }
};

const onModalAdded = () => {
  if (selectedWorkId.value) {
    const b = books.value.find((item: any) => item.workId === selectedWorkId.value);
    if (b) {
      b.isInBookshelf = true;
      b.bookshelfStatus = 'WANT_TO_READ';
    }
  }
};

onMounted(() => {
  store.fetchStats();
  // Tải danh sách sách nổi bật từ Open Library khi vừa vào trang
  handleSearch(1, '');
});
</script>

<template>
  <div class="search-page animate-fade">
    <!-- Hero Header -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-badge">
          <Sparkles :size="14" />
          <span>Khám phá kho sách toàn cầu Open Library</span>
        </div>
        <h1 class="hero-title">Tìm kiếm & Xây dựng Tủ sách của bạn</h1>
        <p class="hero-subtitle">
          Tìm kiếm hàng triệu đầu sách theo tên sách hoặc tác giả, lưu vào tủ sách cá nhân và theo dõi tiến độ đọc mỗi ngày.
        </p>

        <!-- Search Bar -->
        <form class="search-form" @submit.prevent="handleSearch(1)">
          <div class="search-box">
            <Search class="search-icon" :size="22" />
            <input
              type="text"
              v-model="searchInput"
              placeholder="Nhập tên sách hoặc tên tác giả "
              class="search-input"
            />
            <button
              v-if="searchInput"
              type="button"
              class="btn-clear"
              @click="clearSearch"
            >
              <X :size="18" />
            </button>
            <button type="submit" class="btn-search" :disabled="loading">
              <Loader2 v-if="loading" class="spinner" :size="20" />
              <span v-else>Tìm kiếm</span>
            </button>
          </div>
        </form>

        <!-- Search Suggestions -->
        <div class="suggestions-list">
          <span class="suggestions-label">Gợi ý tìm kiếm:</span>
          <button
            v-for="item in suggestions"
            :key="item"
            class="suggestion-pill"
            @click="applySuggestion(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section container">
      <!-- Loading Skeletons -->
      <div v-if="loading" class="books-grid">
        <div v-for="i in 8" :key="i" class="book-card skeleton-card">
          <div class="skeleton skeleton-cover"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-author"></div>
            <div class="skeleton skeleton-meta"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <AlertCircle :size="48" class="text-rose" />
        <h3>Đã xảy ra lỗi</h3>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="handleSearch(page)">Thử lại</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="books.length === 0" class="empty-state">
        <BookOpen :size="56" class="text-subtle" />
        <h3>Không tìm thấy kết quả phù hợp</h3>
        <p>Không có cuốn sách nào khớp với từ khóa "<b>{{ searchInput }}</b>". Hãy thử lại với từ khóa khác nhé!</p>
      </div>

      <!-- Results Grid -->
      <div v-else-if="books.length > 0">
        <div class="results-header">
          <div class="results-count">
            <span v-if="isDefaultFeed">
              📚 <b>Sách nổi bật & phổ biến từ Open Library</b> ({{ totalBooks.toLocaleString() }} kết quả)
            </span>
            <span v-else>
              Tìm thấy <b>{{ totalBooks.toLocaleString() }}</b> cuốn sách cho "<span>{{ searchInput }}</span>"
            </span>
          </div>
          <div class="results-page-info">
            Trang <b>{{ page }}</b> / <b>{{ totalPages }}</b>
          </div>
        </div>

        <div class="books-grid">
          <div
            v-for="book in books"
            :key="book.workId"
            class="book-card"
            @click="openDetails(book)"
          >
            <!-- Ảnh bìa sách -->
            <div class="card-cover">
              <img
                v-if="book.coverUrl"
                :src="book.coverUrl"
                :alt="book.title"
                loading="lazy"
                decoding="async"
                class="cover-img"
              />
              <div v-else class="fallback-cover">
                <BookOpen :size="36" />
                <span class="fallback-title">{{ book.title }}</span>
              </div>

              <!-- Badge đã thêm -->
              <div v-if="book.isInBookshelf" class="card-badge">
                <BookmarkCheck :size="13" />
                <span>Đã thêm</span>
              </div>
            </div>

            <!-- Nội dung tóm tắt -->
            <div class="card-info">
              <h3 class="card-title" :title="book.title">{{ book.title }}</h3>
              <p class="card-author" :title="book.author">{{ book.author }}</p>

              <div class="card-meta">
                <span v-if="book.publishYear" class="meta-item">
                  <Calendar :size="13" /> {{ book.publishYear }}
                </span>
                <span v-if="book.totalPages > 0" class="meta-item">
                  <Layers :size="13" /> {{ book.totalPages }} trang
                </span>
              </div>

              <div class="card-action">
                <button
                  v-if="!book.isInBookshelf"
                  class="btn-add"
                  @click="handleQuickAdd($event, book)"
                >
                  <BookmarkPlus :size="15" />
                  <span>+ Thêm vào tủ</span>
                </button>
                <div v-else class="added-indicator">
                  <span class="dot-indicator"></span>
                  <span>Trong tủ sách</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="pagination-wrapper">
          <button
            class="page-btn"
            :disabled="page <= 1"
            @click="handleSearch(page - 1)"
          >
            <ChevronLeft :size="18" />
            <span>Trang trước</span>
          </button>

          <div class="page-numbers">
            <button
              v-for="p in Math.min(5, totalPages)"
              :key="p"
              class="page-num"
              :class="{ active: p === page }"
              @click="handleSearch(p)"
            >
              {{ p }}
            </button>
            <span v-if="totalPages > 5" class="page-ellipsis">...</span>
          </div>

          <button
            class="page-btn"
            :disabled="page >= totalPages"
            @click="handleSearch(page + 1)"
          >
            <span>Trang sau</span>
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </section>

    <!-- Modal Xem chi tiết (Màn hình 2) -->
    <BookDetailModal
      :show="showDetailModal"
      :work-id="selectedWorkId"
      :book-snapshot="selectedSnapshot"
      @close="showDetailModal = false"
      @added="onModalAdded"
    />
  </div>
</template>

<style scoped>
.search-page {
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  padding: 48px 0 32px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--primary-light);
  border: 1px solid rgba(79, 70, 229, 0.2);
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.2;
  margin-bottom: 12px;
  color: var(--text-main);
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 620px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

.search-form {
  max-width: 680px;
  margin: 0 auto 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: var(--radius-xl);
  padding: 6px 6px 6px 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  transition: all 0.2s;
}
.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15);
}

.search-icon {
  color: var(--text-subtle);
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.05rem;
  color: var(--text-main);
}
.search-input::placeholder {
  color: var(--text-subtle);
}

.btn-clear {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin-right: 6px;
}
.btn-clear:hover {
  color: var(--text-main);
  background: #f1f5f9;
}

.btn-search {
  padding: 10px 24px;
  border-radius: var(--radius-lg);
  background: var(--primary);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}
.btn-search:hover:not(:disabled) {
  background: var(--primary-hover);
}

.suggestions-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.suggestions-label {
  font-size: 0.82rem;
  color: var(--text-subtle);
  font-weight: 500;
}

.suggestion-pill {
  padding: 4px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: all 0.15s;
}
.suggestion-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

/* Results Section */
.results-section {
  margin-top: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.results-count {
  font-size: 0.95rem;
  color: var(--text-muted);
}
.results-count b, .results-count span {
  color: var(--text-main);
  font-weight: 700;
}

.results-page-info {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 24px;
}

/* Book Card */
.book-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}
.book-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
  box-shadow: var(--shadow-hover);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 270px;
  background: #f1f5f9;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.book-card:hover .cover-img {
  transform: scale(1.04);
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
}
.fallback-title {
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(16, 185, 129, 0.9);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.35;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.7em;
}

.card-author {
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.76rem;
  color: var(--text-subtle);
  margin-bottom: 14px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-action {
  margin-top: auto;
}

.btn-add {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid rgba(79, 70, 229, 0.2);
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add:hover {
  background: var(--primary);
  color: white;
}

.added-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--emerald);
  padding: 6px;
}
.dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--emerald);
}

/* Skeletons */
.skeleton-card {
  height: 380px;
}
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
}
.skeleton-cover {
  height: 250px;
}
.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skeleton-title {
  height: 16px;
  border-radius: 4px;
}
.skeleton-author {
  height: 12px;
  width: 60%;
  border-radius: 4px;
}
.skeleton-meta {
  height: 10px;
  width: 40%;
  border-radius: 4px;
}
@keyframes skeletonLoading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty & Error States */
.empty-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-state h3, .error-state h3 {
  font-size: 1.3rem;
  color: var(--text-main);
}
.empty-state p, .error-state p {
  color: var(--text-muted);
  max-width: 450px;
}
.text-rose {
  color: var(--rose);
}
.text-subtle {
  color: var(--text-subtle);
}
.btn-retry {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 48px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: #ffffff;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-num {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: #ffffff;
  border: 1px solid var(--border-color);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.page-num:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.page-num.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.page-ellipsis {
  color: var(--text-subtle);
  padding: 0 4px;
}
</style>
