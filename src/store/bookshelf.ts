import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bookshelfApi } from '../services/api';
import type { BookshelfItem, BookshelfStats, ReadingStatus, AddBookPayload, UpdateBookPayload } from '../types/book';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export const useBookshelfStore = defineStore('bookshelf', () => {
  const books = ref<BookshelfItem[]>([]);
  const stats = ref<BookshelfStats>({
    totalBooks: 0,
    readingCount: 0,
    completedCount: 0,
    wantToReadCount: 0,
    totalPagesRead: 0,
    avgRating: 0,
  });
  const loading = ref(false);
  const activeTab = ref<ReadingStatus | 'ALL'>('ALL');
  const toasts = ref<ToastMessage[]>([]);

  // Hiển thị thông báo Toast
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    toasts.value.push({ id, type, title, message });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  // Tải danh sách sách trong tủ
  const fetchBooks = async (status?: ReadingStatus, search?: string) => {
    loading.value = true;
    try {
      books.value = await bookshelfApi.getAll(status, search);
    } catch (error: any) {
      addToast('error', 'Không thể tải tủ sách', error?.response?.data?.message || error.message);
    } finally {
      loading.value = false;
    }
  };

  // Tải thống kê
  const fetchStats = async () => {
    try {
      stats.value = await bookshelfApi.getStats();
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  // Thêm sách vào tủ
  const addBook = async (payload: AddBookPayload) => {
    try {
      const newBook = await bookshelfApi.add(payload);
      books.value.unshift(newBook);
      await fetchStats();
      addToast('success', 'Thành công', `Đã thêm cuốn "${newBook.title}" vào tủ sách!`);
      return newBook;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Không thể thêm sách';
      addToast('error', 'Thất bại', msg);
      throw error;
    }
  };

  // Cập nhật sách
  const updateBook = async (id: number, payload: UpdateBookPayload) => {
    try {
      const updated = await bookshelfApi.update(id, payload);
      const idx = books.value.findIndex((b) => b.id === id);
      if (idx !== -1) {
        books.value[idx] = updated;
      }
      await fetchStats();
      if (updated.status === 'COMPLETED' && payload.currentPage === updated.totalPages) {
        addToast('success', 'Chúc mừng!', `Bạn đã đọc xong cuốn "${updated.title}"! 🎉`);
      } else {
        addToast('success', 'Đã lưu', 'Cập nhật tiến độ đọc thành công!');
      }
      return updated;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Không thể cập nhật';
      addToast('error', 'Thất bại', msg);
      throw error;
    }
  };

  // Xóa sách
  const deleteBook = async (id: number) => {
    try {
      const bookToDelete = books.value.find((b) => b.id === id);
      await bookshelfApi.delete(id);
      books.value = books.value.filter((b) => b.id !== id);
      await fetchStats();
      addToast('info', 'Đã xóa', `Đã xóa "${bookToDelete?.title || 'sách'}" khỏi tủ`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Không thể xóa sách';
      addToast('error', 'Thất bại', msg);
      throw error;
    }
  };

  return {
    books,
    stats,
    loading,
    activeTab,
    toasts,
    addToast,
    removeToast,
    fetchBooks,
    fetchStats,
    addBook,
    updateBook,
    deleteBook,
  };
});
