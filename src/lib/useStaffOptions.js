import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

export function useStaffOptions() {
  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadStaff() {
      const { data } = await supabase
        .from('staff')
        .select('name, sort_order')
        .order('sort_order', { ascending: true });
      if (!cancelled && data) {
        setStaffOptions(data.map((s) => s.name));
      }
    }
    loadStaff();
    return () => {
      cancelled = true;
    };
  }, []);

  return staffOptions;
}
