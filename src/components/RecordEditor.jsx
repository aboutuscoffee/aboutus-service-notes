import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useStaffOptions } from '../lib/useStaffOptions.js';
import {
  PRODUCT_OPTIONS,
  REGION_OPTIONS,
  GENDER_OPTIONS,
  AGE_OPTIONS,
  REACTION_OPTIONS,
  RECORD_TYPE_LABELS,
  RECORD_TYPE_MAP,
  RECORD_TYPE_LABEL_BY_VALUE,
} from '../lib/options.js';

export default function RecordEditor({ row, onCancel, onSaved, onDeleted }) {
  const staffOptions = useStaffOptions();
  const [form, setForm] = useState({
    staffNames: row.staff_names ?? [],
    recordTypeLabel: RECORD_TYPE_LABEL_BY_VALUE[row.record_type] ?? 'オペレーション',
    products: row.products ?? [],
    region: row.region,
    gender: row.gender,
    ageGroup: row.age_group,
    reaction: row.reaction,
    note: row.note ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleStaff = (name) => {
    setForm((prev) => ({
      ...prev,
      staffNames: prev.staffNames.includes(name)
        ? prev.staffNames.filter((n) => n !== name)
        : [...prev.staffNames, name],
    }));
  };

  const toggleProduct = (product) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  const setSingle = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: prev[key] === value ? prev[key] : value }));
  };

  const canSave = form.staffNames.length > 0 && form.reaction && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setErrorMsg('');
    const { error } = await supabase
      .from('service_notes')
      .update({
        staff_names: form.staffNames,
        record_type: RECORD_TYPE_MAP[form.recordTypeLabel],
        products: form.products,
        region: form.region,
        gender: form.gender,
        age_group: form.ageGroup,
        reaction: form.reaction,
        note: form.note.trim() ? form.note.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    setSaving(false);

    if (error) {
      setErrorMsg('更新に失敗しました');
      return;
    }
    onSaved?.();
  };

  const handleDelete = async () => {
    setSaving(true);
    setErrorMsg('');
    const { error } = await supabase.from('service_notes').delete().eq('id', row.id);
    setSaving(false);

    if (error) {
      setErrorMsg('削除に失敗しました');
      return;
    }
    onDeleted?.();
  };

  return (
    <div className="card editor-card">
      <div className="field">
        <span className="field-label">スタッフ名（複数選択可）</span>
        <div className="chip-row">
          {staffOptions.map((name) => (
            <button
              key={name}
              type="button"
              className={`chip ${form.staffNames.includes(name) ? 'selected' : ''}`}
              onClick={() => toggleStaff(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">記録の種類</span>
        <div className="segmented">
          {RECORD_TYPE_LABELS.map((label) => (
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
        <label className="field-label" htmlFor={`note-${row.id}`}>
          気づき・フリースペース（任意）
        </label>
        <textarea
          id={`note-${row.id}`}
          className="textarea-input"
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
        />
      </div>

      {errorMsg && <div className="toast-line">{errorMsg}</div>}

      <div className="editor-actions">
        <button type="button" className="ghost-btn" onClick={onCancel} disabled={saving}>
          キャンセル
        </button>
        {confirmingDelete ? (
          <>
            <span className="confirm-text">本当に削除しますか？</span>
            <button type="button" className="danger-btn" onClick={handleDelete} disabled={saving}>
              削除する
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setConfirmingDelete(false)}
              disabled={saving}
            >
              やめる
            </button>
          </>
        ) : (
          <button
            type="button"
            className="danger-btn"
            onClick={() => setConfirmingDelete(true)}
            disabled={saving}
          >
            削除
          </button>
        )}
        <button type="button" className="submit-btn editor-save-btn" onClick={handleSave} disabled={!canSave}>
          更新する
        </button>
      </div>
    </div>
  );
}
