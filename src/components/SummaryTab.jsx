import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const POSITIVE_REACTIONS = new Set(['即決', '検討→購入']);

function isPositive(reaction) {
  return POSITIVE_REACTIONS.has(reaction);
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${min}`;
}

export default function SummaryTab({ refreshKey }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        setErrorMsg('データの取得に失敗しました');
        setRows([]);
      } else {
        setErrorMsg('');
        setRows(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentRows = rows.filter((r) => now - new Date(r.created_at).getTime() <= sevenDaysMs);
  const weeklyCount = recentRows.length;
  const positiveRate = weeklyCount
    ? Math.round((recentRows.filter((r) => isPositive(r.reaction)).length / weeklyCount) * 100)
    : 0;

  const staffMap = new Map();
  for (const row of rows) {
    const names = row.staff_names?.length ? row.staff_names : ['（未入力）'];
    for (const key of names) {
      if (!staffMap.has(key)) {
        staffMap.set(key, { count: 0, positive: 0 });
      }
      const entry = staffMap.get(key);
      entry.count += 1;
      if (isPositive(row.reaction)) entry.positive += 1;
    }
  }
  const staffStats = Array.from(staffMap.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      rate: stats.count ? Math.round((stats.positive / stats.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const recentActivity = rows.slice(0, 20);

  if (loading) {
    return <div className="card empty-state">読み込み中…</div>;
  }

  if (errorMsg) {
    return <div className="card empty-state">{errorMsg}</div>;
  }

  return (
    <>
      <div className="summary-tiles">
        <div className="summary-tile">
          <div className="tile-value">{weeklyCount}</div>
          <div className="tile-label">今週の提案数</div>
        </div>
        <div className="summary-tile">
          <div className="tile-value">{positiveRate}%</div>
          <div className="tile-label">前向きな反応率</div>
        </div>
      </div>

      <div className="card">
        <p className="section-title">スタッフ別</p>
        {staffStats.length === 0 ? (
          <div className="empty-state">まだ記録がありません</div>
        ) : (
          staffStats.map((s) => (
            <div className="staff-row" key={s.name}>
              <div className="staff-row-top">
                <span>{s.name}</span>
                <span>
                  {s.count}件・前向き{s.rate}%
                </span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${s.rate}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <p className="section-title">最近の記録</p>
        {recentActivity.length === 0 ? (
          <div className="empty-state">まだ記録がありません</div>
        ) : (
          recentActivity.map((row) => (
            <div className="activity-row" key={row.id}>
              <div className="activity-main">
                <span className="activity-time">{formatTime(row.created_at)}</span>
                <span className="activity-staff-products">
                  {row.staff_names?.length ? row.staff_names.join('・') : '（未入力）'}
                  {row.products?.length ? ` ・ ${row.products.join('・')}` : ''}
                </span>
              </div>
              <span className={`badge ${isPositive(row.reaction) ? 'positive' : 'neutral'}`}>
                {row.reaction}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
