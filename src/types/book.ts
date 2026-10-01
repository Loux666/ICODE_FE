export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface OpenLibraryBook {
  workId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  publishYear: number | null;
  editionCount: number;
  totalPages: number;
  isInBookshelf: boolean;
  bookshelfStatus: ReadingStatus | null;
  bookshelfId: number | null;
}

export interface WorkDetails {
  workId: string;
  title: string;
  description: string;
  author?: string | null;
  coverUrl: string | null;
  subjects: string[];
  publishYear?: number | null;
  totalPages?: number;
  isInBookshelf: boolean;
  bookshelfBook: BookshelfItem | null;
}

export interface BookshelfItem {
  id: number;
  workId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  publishYear: number | null;
  totalPages: number;
  description: string | null;
  subjects: string | null;
  status: ReadingStatus;
  currentPage: number;
  rating: number | null;
  notes: string | null;
  startDate: string | null;
  finishDate: string | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookshelfStats {
  totalBooks: number;
  readingCount: number;
  completedCount: number;
  wantToReadCount: number;
  totalPagesRead: number;
  avgRating: number;
}

export interface AddBookPayload {
  workId: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  publishYear?: number | null;
  totalPages?: number;
  description?: string | null;
  subjects?: string | string[] | null;
  status?: ReadingStatus;
  currentPage?: number;
  rating?: number | null;
  notes?: string | null;
}

export interface UpdateBookPayload {
  currentPage?: number;
  totalPages?: number;
  status?: ReadingStatus;
  rating?: number | null;
  notes?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
