export interface RecommendationProfile {
  id: string;
  user_id: string;
  preferred_genres?: string[] | null;
  preferred_authors?: string[] | null;
  preferred_languages?: string[] | null;
  min_rating?: number | null;
  max_rating?: number | null;
  updated_at: string;
}

export interface RecommendationProfileCreate {
  preferred_genres?: string[];
  preferred_authors?: string[];
  preferred_languages?: string[];
  min_rating?: number;
  max_rating?: number;
}

export interface RecommendationProfileUpdate {
  preferred_genres?: string[];
  preferred_authors?: string[];
  preferred_languages?: string[];
  min_rating?: number;
  max_rating?: number;
}

export interface BookRecommendationItem {
  book_id: string;
  openlibrary_work_id: string;
  title: string;
  authors: string[];
  cover_url?: string | null;
  first_publish_year?: number | null;
  subjects: string[];
  score: number;
  match_reasons: string[];
  average_rating: number;
}

export interface BookRecommendationResponse {
  recommendations: BookRecommendationItem[];
  total_count: number;
}
