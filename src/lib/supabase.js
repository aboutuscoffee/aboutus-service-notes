import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 姉妹アプリ（aboutus-staff-todo等）と同じドメイン・同じSupabaseプロジェクトを
// 共有しているため、他アプリの認証セッションがブラウザの共有localStorageに残っていると
// このアプリのSupabaseクライアントがそれを誤って使い、匿名アクセス用のRLSポリシーに
// 一致せず「row-level security policy」違反で保存や取得が失敗することがある。
// このアプリはSupabase認証を使わないため、セッションの保存・自動読込を無効化して
// 常にVITE_SUPABASE_ANON_KEYだけで通信するようにする。
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
});
