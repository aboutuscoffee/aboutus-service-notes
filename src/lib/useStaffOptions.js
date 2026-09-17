import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

// aboutus-staff-todoの共有staffテーブルには接客ノートで使わないテスト用・対象外の人物が
// 含まれているため、この接客ノート側の候補一覧からだけ除外する（共有テーブル自体は変更しない）。
const EXCLUDED_STAFF_NAMES = new Set(['澤野井泰成', '確認用', '確認２', '確認３']);

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
        setStaffOptions(
          data.map((s) => s.name).filter((name) => !EXCLUDED_STAFF_NAMES.has(name))
        );
      }
    }
    loadStaff();
    return () => {
      cancelled = true;
    };
  }, []);

  return staffOptions;
}
