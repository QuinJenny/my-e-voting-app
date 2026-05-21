'use client';

import { useMemo } from 'react';
import { createClientComponentClient } from '@/lib/supabase';

export const useSupabase = () => {
  return useMemo(() => createClientComponentClient(), []);
};

