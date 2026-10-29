import { useEffect, useState } from 'react';
import { Button, Input } from './UI';

const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];

const toggleListValue = (values, value) => (
  values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
);

export default function ProductOptionsEditor({ value, onChange }) {
  const [colorDraft, setColorDraft] = useState('');
  const sizeOptions = Array.isArray(value.sizeOptions) ? value.sizeOptions : [];
  const colorOptions = Array.isArray(value.colorOptions) ? value.colorOptions : [];

  const update = (changes) => onChange({ ...value, ...changes });
  useEffect(() => setColorDraft(''), [value._id]);
  const addColors = () => {
    const additions = colorDraft.split(',').map((entry) => entry.trim()).filter(Boolean);
    if (!additions.length) return;
    update({ colorOptions: [...new Set([...colorOptions, ...additions])] });
    setColorDraft('');
  };

  return (
    <fieldset className="whats-inside-editor">
      <legend>Product options</legend>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={Boolean(value.showSizeOptions)}
          onChange={(event) => update({
            showSizeOptions: event.target.checked,
            sizeOptions: event.target.checked ? sizeOptions : [],
          })}
        />
        <span><strong>Offer size options</strong><br /><small>Let customers choose a size on the product page.</small></span>
      </label>

      {value.showSizeOptions && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '0 0 1rem 1.75rem' }} role="group" aria-label="Available sizes">
          {SIZE_OPTIONS.map((size) => (
            <label key={size} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sizeOptions.includes(size)}
                onChange={() => update({ sizeOptions: toggleListValue(sizeOptions, size) })}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: value.showColorOptions ? '0.75rem' : 0, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={Boolean(value.showColorOptions)}
          onChange={(event) => update({
            showColorOptions: event.target.checked,
            colorOptions: event.target.checked ? colorOptions : [],
          })}
        />
        <span><strong>Offer color options</strong><br /><small>Let customers choose from the colors you enter below.</small></span>
      </label>

      {value.showColorOptions && (
        <div style={{ marginLeft: '1.75rem' }}>
          <Input
            label="Colors"
            placeholder="e.g. Red, Black, Rose Gold"
            value={colorDraft}
            onChange={(event) => setColorDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addColors();
              }
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '-0.35rem' }}>
            <Button type="button" variant="secondary" onClick={addColors}>Add color</Button>
            <small>Enter one or several comma-separated colors.</small>
          </div>
          {colorOptions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }} aria-label="Selected colors">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => update({ colorOptions: colorOptions.filter((entry) => entry !== color) })}
                  aria-label={`Remove ${color}`}
                  style={{ border: '1px solid var(--color-border)', borderRadius: '999px', background: 'var(--color-surface)', padding: '0.4rem 0.7rem', cursor: 'pointer' }}
                >
                  {color} ×
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
