import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFollow() {
  const followUser = useCallback(async (followingId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: followingId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error in followUser:', error);
      return { error };
    }
  }, []);

  const unfollowUser = useCallback(async (followingId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('followers')
        .delete()
        .match({ follower_id: user.id, following_id: followingId });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { error };
    }
  }, []);

  return { followUser, unfollowUser };
}
