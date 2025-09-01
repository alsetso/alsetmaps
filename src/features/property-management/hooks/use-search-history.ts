import { useState, useEffect, useCallback } from 'react';
import { SearchHistoryService } from '../services';
import { SearchHistory, SearchHistoryCreate, SearchHistoryFilters } from '../types';
import { useAuth } from '@/features/authentication/hooks';

export const useSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load search history based on user authentication status
  const loadSearchHistory = useCallback(async (filters?: SearchHistoryFilters) => {
    setLoading(true);
    setError(null);

    try {
      let history: SearchHistory[] = [];

      if (user?.id) {
        // Authenticated user - load by user ID
        history = await SearchHistoryService.getByUserId(user.id, filters);
      } else {
        // Anonymous user - try to load by session ID from localStorage
        const sessionId = localStorage.getItem('alset_session_id');
        if (sessionId) {
          history = await SearchHistoryService.getBySessionId(sessionId, filters);
        }
      }

      setSearchHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load search history');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add a new search to history
  const addSearch = useCallback(async (searchData: Omit<SearchHistoryCreate, 'user_id' | 'session_id' | 'anonymous_id'>) => {
    try {
      let sessionId: string | undefined;
      let anonymousId: string | undefined;

      if (!user?.id) {
        // For anonymous users, generate or retrieve session/anonymous IDs
        sessionId = localStorage.getItem('alset_session_id') || SearchHistoryService.generateSessionId();
        anonymousId = localStorage.getItem('alset_anonymous_id') || SearchHistoryService.generateAnonymousId();
        
        // Store IDs for future use
        localStorage.setItem('alset_session_id', sessionId);
        localStorage.setItem('alset_anonymous_id', anonymousId);
      }

      const newSearch: SearchHistoryCreate = {
        ...searchData,
        user_id: user?.id || null,
        session_id: sessionId || null,
        anonymous_id: anonymousId || null,
      };

      const createdSearch = await SearchHistoryService.create(newSearch);
      
      if (createdSearch) {
        setSearchHistory(prev => [createdSearch, ...prev]);
        return createdSearch;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add search to history');
      return null;
    }
  }, [user?.id]);

  // Update search history record
  const updateSearch = useCallback(async (id: string, updates: Partial<SearchHistory>) => {
    try {
      const updatedSearch = await SearchHistoryService.update(id, updates);
      
      if (updatedSearch) {
        setSearchHistory(prev => 
          prev.map(search => 
            search.id === id ? updatedSearch : search
          )
        );
        return updatedSearch;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update search history');
      return null;
    }
  }, []);

  // Delete search history record
  const deleteSearch = useCallback(async (id: string) => {
    try {
      const success = await SearchHistoryService.delete(id);
      
      if (success) {
        setSearchHistory(prev => prev.filter(search => search.id !== id));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search history');
      return false;
    }
  }, []);

  // Clear all search history
  const clearSearchHistory = useCallback(async () => {
    try {
      // Delete all searches for the current user/session
      const searchesToDelete = searchHistory.map(search => search.id);
      
      for (const id of searchesToDelete) {
        await SearchHistoryService.delete(id);
      }
      
      setSearchHistory([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear search history');
      return false;
    }
  }, [searchHistory]);

  // Get search statistics
  const getStats = useCallback(async () => {
    try {
      let sessionId: string | undefined;
      let anonymousId: string | undefined;

      if (!user?.id) {
        sessionId = localStorage.getItem('alset_session_id');
        anonymousId = localStorage.getItem('alset_anonymous_id');
      }

      return await SearchHistoryService.getStats(user?.id, sessionId, anonymousId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get search statistics');
      return null;
    }
  }, [user?.id]);

  // Load search history on mount and when user changes
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    searchHistory,
    loading,
    error,
    loadSearchHistory,
    addSearch,
    updateSearch,
    deleteSearch,
    clearSearchHistory,
    getStats,
    refresh: () => loadSearchHistory(),
  };
};
