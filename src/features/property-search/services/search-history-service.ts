export interface SearchHistoryEntry {
  id: string;
  timestamp: Date;
  searchType: 'basic' | 'smart';
  address: string;
  latitude: number;
  longitude: number;
  success: boolean;
  resultCount?: number;
  creditsUsed?: number;
}

export interface SearchHistoryStats {
  totalSearches: number;
  basicSearches: number;
  smartSearches: number;
  totalCreditsUsed: number;
  averageResultCount: number;
  successRate: number;
}

export class SearchHistoryService {
  private static readonly STORAGE_KEY = 'alset_search_history';
  private static readonly MAX_ENTRIES = 100;

  /**
   * Add a new search to history
   */
  static addSearch(entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getSearchHistory();
      const newEntry: SearchHistoryEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: new Date()
      };

      // Add to beginning of array
      history.unshift(newEntry);

      // Keep only the most recent entries
      if (history.length > this.MAX_ENTRIES) {
        history.splice(this.MAX_ENTRIES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding search to history:', error);
    }
  }

  /**
   * Get all search history
   */
  static getSearchHistory(): SearchHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const history = JSON.parse(stored);
      return history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('Error retrieving search history:', error);
      return [];
    }
  }

  /**
   * Get search history filtered by type
   */
  static getSearchHistoryByType(searchType: 'basic' | 'smart'): SearchHistoryEntry[] {
    return this.getSearchHistory().filter(entry => entry.searchType === searchType);
  }

  /**
   * Get recent searches (last N entries)
   */
  static getRecentSearches(limit: number = 10): SearchHistoryEntry[] {
    return this.getSearchHistory().slice(0, limit);
  }

  /**
   * Get search statistics
   */
  static getSearchStats(): SearchHistoryStats {
    const history = this.getSearchHistory();
    
    if (history.length === 0) {
      return {
        totalSearches: 0,
        basicSearches: 0,
        smartSearches: 0,
        totalCreditsUsed: 0,
        averageResultCount: 0,
        successRate: 0
      };
    }

    const basicSearches = history.filter(entry => entry.searchType === 'basic');
    const smartSearches = history.filter(entry => entry.searchType === 'smart');
    const successfulSearches = history.filter(entry => entry.success);
    
    const totalCreditsUsed = history.reduce((sum, entry) => sum + (entry.creditsUsed || 0), 0);
    const totalResultCount = history.reduce((sum, entry) => sum + (entry.resultCount || 0), 0);

    return {
      totalSearches: history.length,
      basicSearches: basicSearches.length,
      smartSearches: smartSearches.length,
      totalCreditsUsed,
      averageResultCount: totalResultCount / history.length,
      successRate: (successfulSearches.length / history.length) * 100
    };
  }

  /**
   * Clear search history
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Remove a specific search entry
   */
  static removeSearch(id: string): void {
    try {
      const history = this.getSearchHistory();
      const filtered = history.filter(entry => entry.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing search entry:', error);
    }
  }

  /**
   * Export search history as JSON
   */
  static exportHistory(): string {
    try {
      const history = this.getSearchHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting search history:', error);
      return '[]';
    }
  }

  /**
   * Import search history from JSON
   */
  static importHistory(jsonData: string): boolean {
    try {
      const history = JSON.parse(jsonData);
      
      // Validate the imported data
      if (!Array.isArray(history)) {
        throw new Error('Invalid history format');
      }

      // Validate each entry
      for (const entry of history) {
        if (!this.isValidHistoryEntry(entry)) {
          throw new Error('Invalid history entry format');
        }
      }

      localStorage.setItem(this.STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      console.error('Error importing search history:', error);
      return false;
    }
  }

  /**
   * Get search suggestions based on history
   */
  static getSearchSuggestions(query: string, limit: number = 5): string[] {
    const history = this.getSearchHistory();
    const suggestions = new Set<string>();

    for (const entry of history) {
      if (entry.address.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(entry.address);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions);
  }

  /**
   * Get popular search locations
   */
  static getPopularLocations(limit: number = 10): Array<{ address: string; count: number }> {
    const history = this.getSearchHistory();
    const locationCounts = new Map<string, number>();

    for (const entry of history) {
      const count = locationCounts.get(entry.address) || 0;
      locationCounts.set(entry.address, count + 1);
    }

    return Array.from(locationCounts.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static isValidHistoryEntry(entry: any): entry is SearchHistoryEntry {
    return (
      typeof entry.id === 'string' &&
      typeof entry.timestamp === 'string' &&
      ['basic', 'smart'].includes(entry.searchType) &&
      typeof entry.address === 'string' &&
      typeof entry.latitude === 'number' &&
      typeof entry.longitude === 'number' &&
      typeof entry.success === 'boolean'
    );
  }
}
