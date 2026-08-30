import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Book } from '../types/book';
import { AuthContext } from './AuthContext';
import { favoriteService } from '../services/favoriteService';

export interface FavoritesContextType {
  favorites: Book[];
  isLoading: boolean;
  isFavorite: (bookKey: string) => boolean;
  toggleFavorite: (book: Book) => Promise<void>;
  removeFromFavorites: (bookKey: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAuthenticated = authContext ? authContext.isAuthenticated : true;

  const [favorites, setFavorites] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch favorites from backend API
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const serverFavorites = await favoriteService.getFavorites();
      setFavorites(serverFavorites);
      try {
        localStorage.setItem(`biblio_favorites_${user.id}`, JSON.stringify(serverFavorites));
      } catch {}
    } catch {
      // Offline / fallback cache
      try {
        const saved = localStorage.getItem(`biblio_favorites_${user.id}`);
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Synchronize on authentication transitions
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchFavorites]);

  const isFavorite = useCallback(
    (bookKey: string): boolean => {
      if (!isAuthenticated) return false;
      const cleanKey = bookKey.replace('/works/', '').trim();
      return favorites.some(
        (fav) => fav.key === bookKey || fav.key.replace('/works/', '').trim() === cleanKey
      );
    },
    [favorites, isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (book: Book) => {
      if (!isAuthenticated) {
        authContext?.openAuthModal('login');
        return;
      }

      const cleanKey = book.key.replace('/works/', '').trim();
      const exists = favorites.some(
        (fav) => fav.key === book.key || fav.key.replace('/works/', '').trim() === cleanKey
      );

      const updated = exists
        ? favorites.filter(
            (fav) => fav.key !== book.key && fav.key.replace('/works/', '').trim() !== cleanKey
          )
        : [...favorites, book];

      setFavorites(updated);
      if (user) {
        try {
          localStorage.setItem(`biblio_favorites_${user.id}`, JSON.stringify(updated));
        } catch {}
      }

      try {
        if (exists) {
          await favoriteService.removeFavorite(book.key);
        } else {
          await favoriteService.addFavorite(book);
        }
      } catch (e) {
        console.error('Failed to persist favorite to backend:', e);
      }
    },
    [authContext, favorites, isAuthenticated, user]
  );

  const removeFromFavorites = useCallback(
    async (bookKey: string) => {
      const cleanKey = bookKey.replace('/works/', '').trim();
      const updated = favorites.filter(
        (fav) => fav.key !== bookKey && fav.key.replace('/works/', '').trim() !== cleanKey
      );
      setFavorites(updated);
      if (user) {
        try {
          localStorage.setItem(`biblio_favorites_${user.id}`, JSON.stringify(updated));
        } catch {}
      }

      try {
        await favoriteService.removeFavorite(bookKey);
      } catch (e) {
        console.error('Failed to remove favorite from backend:', e);
      }
    },
    [favorites, user]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        removeFromFavorites,
        fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
