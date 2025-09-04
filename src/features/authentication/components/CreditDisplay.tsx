"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { CreditService } from '../services';
import type { CreditBalance } from '../services/credit-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Badge } from '@/features/shared/components/ui/badge';

interface SearchStats {
  totalSearches: number;
  basicSearches: number;
  smartSearches: number;
  totalCreditsUsed: number;
}

export function CreditDisplay() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCreditData();
    }
  }, [user]);

  const loadCreditData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load credit balance and search stats in parallel
      const [balance, stats] = await Promise.all([
        CreditService.getCreditBalance(user.id),
        CreditService.getSearchStats(user.id)
      ]);

      setCreditBalance(balance);
      setSearchStats(stats);

    } catch (err) {
      console.error('Error loading credit data:', err);
      setError('Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCreditData();
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Credits & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Credits & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Credits & Usage</CardTitle>
        <Button onClick={handleRefresh} variant="ghost" size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Balance */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Credit Balance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {creditBalance?.free_credits || 0}
              </div>
              <div className="text-xs text-green-600">Free Credits</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {creditBalance?.paid_credits || 0}
              </div>
              <div className="text-xs text-blue-600">Paid Credits</div>
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">
              {creditBalance?.total_credits || 0}
            </div>
            <div className="text-sm text-gray-600">Total Credits</div>
          </div>
        </div>

        {/* Search Statistics */}
        {searchStats && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Search Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {searchStats.totalSearches}
                </div>
                <div className="text-xs text-gray-600">Total Searches</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {searchStats.totalCreditsUsed}
                </div>
                <div className="text-xs text-gray-600">Credits Used</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex-1 justify-center">
                {searchStats.basicSearches} Basic
              </Badge>
              <Badge variant="default" className="flex-1 justify-center">
                {searchStats.smartSearches} Smart
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="w-full">
              Buy Credits
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              View History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
