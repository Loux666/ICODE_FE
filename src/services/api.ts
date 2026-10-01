import axios from 'axios';
import type {
  ApiResponse,
  OpenLibraryBook,
  WorkDetails,
  BookshelfItem,
  BookshelfStats,
  AddBookPayload,
  UpdateBookPayload,
  ReadingStatus
} from '../types/book';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookApi = {
  // Tìm kiếm sách từ Open Library (qua Backend Proxy)
  async search(query: string, page = 1, limit = 20): Promise<{ books: OpenLibraryBook[]; total: number; page: number; totalPages: number }> {
    const res = await apiClient.get<ApiResponse<{ books: OpenLibraryBook[]; total: number; page: number; totalPages: number }>>('/books/search', {
      params: { q: query, page, limit }
    });
    return res.data.data;
  },

  // Xem chi tiết tác phẩm (có Fallback & Auto-Sync)
  async getWorkDetails(workId: string): Promise<WorkDetails> {
    const res = await apiClient.get<ApiResponse<WorkDetails>>(`/books/works/${workId}`);
    return res.data.data;
  },
};

export const bookshelfApi = {
  // Lấy danh sách Tủ sách cá nhân
  async getAll(status?: ReadingStatus, search?: string): Promise<BookshelfItem[]> {
    const res = await apiClient.get<ApiResponse<BookshelfItem[]>>('/bookshelf', {
      params: { status, search }
    });
    return res.data.data;
  },

  // Lấy thống kê nhanh
  async getStats(): Promise<BookshelfStats> {
    const res = await apiClient.get<ApiResponse<BookshelfStats>>('/bookshelf/stats');
    return res.data.data;
  },

  // Thêm sách vào tủ (chống trùng 409)
  async add(payload: AddBookPayload): Promise<BookshelfItem> {
    const res = await apiClient.post<ApiResponse<BookshelfItem>>('/bookshelf', payload);
    return res.data.data;
  },

  // Cập nhật tiến độ / trạng thái / đánh giá
  async update(id: number, payload: UpdateBookPayload): Promise<BookshelfItem> {
    const res = await apiClient.put<ApiResponse<BookshelfItem>>(`/bookshelf/${id}`, payload);
    return res.data.data;
  },

  // Xóa sách khỏi tủ
  async delete(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/bookshelf/${id}`);
    return res.data.data;
  },
};
