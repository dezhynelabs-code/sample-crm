import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser: User) => {
      // Use maybeSingle to prevent 406 Not Acceptable errors if the profile is missing
      const { data, error } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).maybeSingle();
      
      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback: If the database trigger failed to create a profile, create it manually right now!
        const defaultProfile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || 'Demo User',
          role: 'SALES_EXEC' // Default role
        };
        await supabase.from('profiles').insert([defaultProfile]);
        
        // Also ensure they have the ADMIN role if it's the admin email, just in case
        if (sessionUser.email === 'admin@pipeline.com') {
          await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', sessionUser.id);
          defaultProfile.role = 'ADMIN';
        } else if (sessionUser.email === 'manager@pipeline.com') {
          await supabase.from('profiles').update({ role: 'MANAGER' }).eq('id', sessionUser.id);
          defaultProfile.role = 'MANAGER';
        }
        
        setProfile(defaultProfile as unknown as Profile);
      }
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
