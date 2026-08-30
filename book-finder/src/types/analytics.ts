export interface ReadingGoal {
  id: string;
  user_id: string;
  year: number;
  target_books: number;
  completed_books: number;
  progress_percentage: number;
  is_completed: boolean;
}

export interface MonthlyReadingStat {
  month: number;
  books_completed: number;
  pages_read: number;
}

export interface GenreStat {
  genre: string;
  count: number;
}

export interface ReadingAnalyticsResponse {
  total_books_completed: number;
  total_pages_read: number;
  average_personal_rating: number;
  active_goal: ReadingGoal | null;
  monthly_breakdown: MonthlyReadingStat[];
  top_genres: GenreStat[];
}

export interface SetGoalPayload {
  year: number;
  target_books: number;
}

export interface UpdateGoalPayload {
  target_books: number;
}
