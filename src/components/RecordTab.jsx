import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const PRODUCT_OPTIONS = ['ドリップ', '豆売り', '物販', 'その他'];
const REGION_OPTIONS = ['国内', '欧米系', 'アジア系', 'その他海外'];
const GENDER_OPTIONS = ['男性', '女性', '未回答'];
const AGE_OPTIONS = ['〜20代', '30〜40代', '50代〜'];
const REACTION_OPTIONS = ['即決', '検討→購入', '見送り', '反応なし'];

const RECORD_TYPE_MAP = {
  オペレーション: 'operation',
  ロープレ: 'roleplay',
};

const initialState = {
  staffNames: [],
  recordTypeLabel: 'オペレーション',
  products: [],
  region: null,
  gender: null,
  ageGroup: null,
  reaction: null,
  note: '',
};

export default function RecordTab({ onSaved }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
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

  const toggleProduct = (product) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  const toggleStaff = (name) => {
    setForm((prev) => ({
      ...prev,
      staffNames: prev.staffNames.includes(name)
        ? prev.staffNames.filter((n) => n !== name)
        : [...prev.staffNames, name],
    }));
  };

  const setSingle = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: prev[key] === value ? prev[key] : value }));
  };

  const canSubmit = form.staffNames.length > 0 && form.reaction && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    const { error } = await supabase.from('service_notes').insert({
      staff_names: form.staffNames,
      record_type: RECORD_TYPE_MAP[form.recordTypeLabel],
      products: form.products,
      region: form.region,
      gender: form.gender,
      age_group: form.ageGroup,
      reaction: form.reaction,
      note: form.note.trim() ? form.note.trim() : null,
    });
    setSaving(false);

    if (error) {
      setToast('保存に失敗しました');
      setTimeout(() => setToast(''), 2500);
      return;
    }

    setForm(initialState);
    setToast('記録しました');
    onSaved?.();
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <span className="field-label">スタッフ名（複数選択可）</span>
        <div className="chip-row">
          {staffOptions.length === 0 ? (
            <span className="empty-state">スタッフ一覧を読み込み中…</span>
          ) : (
            staffOptions.map((name) => (
              <button
                key={name}
                type="button"
                className={`chip ${form.staffNames.includes(name) ? 'selected' : ''}`}
                onClick={() => toggleStaff(name)}
              >
                {name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="field">
        <span className="field-label">記録の種類</span>
        <div className="segmented">
          {['オペレーション', 'ロープレ'].map((label) => (
            <button
              key={label}
              type="button"
              className={`segmented-btn ${form.recordTypeLabel === label ? 'selected' : ''}`}
              onClick={() => setSingle('recordTypeLabel', label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">何を提案した？</span>
        <div className="chip-row">
          {PRODUCT_OPTIONS.map((product) => (
            <button
              key={product}
              type="button"
              className={`chip ${form.products.includes(product) ? 'selected' : ''}`}
              onClick={() => toggleProduct(product)}
            >
              {product}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">客層</span>

        <div className="customer-group">
          <span className="field-sublabel">国籍・エリア</span>
          <div className="chip-row">
            {REGION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${form.region === option ? 'selected' : ''}`}
                onClick={() => setSingle('region', form.region === option ? null : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="customer-group">
          <span className="field-sublabel">性別</span>
          <div className="chip-row">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${form.gender === option ? 'selected' : ''}`}
                onClick={() => setSingle('gender', form.gender === option ? null : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="customer-group">
          <span className="field-sublabel">年代</span>
          <div className="chip-row">
            {AGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${form.ageGroup === option ? 'selected' : ''}`}
                onClick={() => setSingle('ageGroup', form.ageGroup === option ? null : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="field">
        <span className="field-label">お客様の反応</span>
        <div className="chip-row reaction-row">
          {REACTION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${form.reaction === option ? 'selected' : ''}`}
              onClick={() => setSingle('reaction', option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="note">
          気づき・フリースペース（任意）
        </label>
        <textarea
          id="note"
          className="textarea-input"
          placeholder="気づいたことを自由にメモ"
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={!canSubmit}>
        記録する
      </button>
      <div className="toast-line">{toast}</div>
    </form>
  );
}
