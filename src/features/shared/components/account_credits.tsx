'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/authentication/components/AuthProvider';

interface AccountCreditsProps {
  className?: string;
  isDark?: boolean;
}

export function AccountCredits({ className = '', isDark = false }: AccountCreditsProps) {
  const [credits, setCredits] = useState<{ free: number; paid: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchCredits = async () => {
        try {
          console.log('🔍 [AccountCredits] Fetching credits for user:', user.id);
          console.log('🔍 [AccountCredits] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
          
          // Now we can query credits directly using user_id
          const { data: credits, error: creditsError } = await supabase
            .from('credits')
            .select('free_credits_balance, paid_credits_balance')
            .eq('user_id', user.id)
            .single();
            
          console.log('🔍 [AccountCredits] Query result:', { credits, creditsError });

          if (creditsError) {
            console.error('Error fetching credits:', creditsError);
            setCredits({ free: 0, paid: 0 });
            return;
          }

          if (!credits) {
            setCredits({ free: 0, paid: 0 });
            return;
          }

          setCredits({
            free: credits.free_credits_balance || 0,
            paid: credits.paid_credits_balance || 0
          });
        } catch (error) {
          setCredits({ free: 0, paid: 0 });
        }
      };

      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [user]);

  if (!credits) return null;

  return (
    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} ${className}`}>
      <span className="text-green-500">{credits.free} free</span>
      {' • '}
      <span className="text-blue-500">{credits.paid} paid</span>
    </div>
  );
}
