import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Todoアプリのマニュアル一覧など、アプリ内ブラウザ経由で開いた場合に
// 古いレスポンス（特にCORSプリフライト）がキャッシュされて通信が失敗することがあるため、
// このアプリの全Supabase通信を常にno-storeにする（aboutus-staff-todoの日報バナーで
// 同様の問題が起きた際の対処と同じ方針）。
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
});
