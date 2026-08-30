export interface ReviewAuthor {
  id: string;
  username: string;
  is_verified_reader: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  title: string | null;
  content: string;
  contains_spoilers: boolean;
  likes_count: number;
  author: ReviewAuthor;
  created_at: string;
  updated_at: string;
}

export interface RatingDistribution {
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
}

export interface BookReviewSummary {
  book_id: string;
  openlibrary_work_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: RatingDistribution;
  reviews: Review[];
}

export interface CreateReviewPayload {
  openlibrary_work_id: string;
  rating: number;
  title?: string | null;
  content: string;
  contains_spoilers?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string | null;
  content?: string;
  contains_spoilers?: boolean;
}
