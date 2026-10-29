import { useEffect, useMemo } from 'react';
import { Button } from './UI';

const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];
const DEFAULT_COLOR = '#FF2B3A';
const EMPTY_IMAGE_SOURCES = [];

const toggleListValue = (values, value) => (
  values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
);

const validHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value || '').trim());
const displayHex = (value) => (validHex(value) ? String(value).trim().toUpperCase() : DEFAULT_COLOR);

const normalizeColor = (color) => {
  if (typeof color === 'string') {
    return { name: color, hex: '#000000', image: '', imageIndex: '' };
  }
  return {
    name: String(color?.name || color?.color || ''),
    hex: String(color?.hex || '#000000').toUpperCase(),
    image: String(color?.image || ''),
    imageIndex: color?.imageIndex ?? '',
  };
};

export default function ProductOptionsEditor({ value, onChange, imageSources = EMPTY_IMAGE_SOURCES }) {
  const sizeOptions = Array.isArray(value.sizeOptions) ? value.sizeOptions : [];
  const colorOptions = (Array.isArray(value.colorOptions) ? value.colorOptions : []).map(normalizeColor);

  const imageOptions = useMemo(() => imageSources.map((source, index) => {
    const isFile = typeof File !== 'undefined' && source instanceof File;
    return {
      index,
      label: isFile ? `Image ${index + 1} — ${source.name}` : `Image ${index + 1}`,
      preview: isFile ? URL.createObjectURL(source) : source,
      url: isFile ? '' : source,
      isObjectUrl: isFile,
    };
  }), [imageSources]);

  useEffect(() => () => {
    imageOptions.forEach((option) => {
      if (option.isObjectUrl) URL.revokeObjectURL(option.preview);
    });
  }, [imageOptions]);

  const update = (changes) => onChange({ ...value, ...changes });
  const updateColor = (index, changes) => update({
    colorOptions: colorOptions.map((color, colorIndex) => (
      colorIndex === index ? { ...color, ...changes } : color
    )),
  });

  const selectedImageIndex = (color) => {
    const urlMatch = imageOptions.find((option) => option.url && option.url === color.image);
    if (urlMatch) return String(urlMatch.index);
    const numericIndex = Number(color.imageIndex);
    return color.imageIndex !== '' && Number.isInteger(numericIndex) && imageOptions[numericIndex]
      ? String(numericIndex)
      : '';
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
        <span><strong>Offer color options</strong><br /><small>Add the exact shade and link it to its matching product photo.</small></span>
      </label>

      {value.showColorOptions && (
        <div style={{ marginLeft: '1.75rem' }}>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Upload the product gallery images below, then map each color to the photo customers should see when they select it.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {colorOptions.map((color, index) => {
              const imageIndex = selectedImageIndex(color);
              const selectedImage = imageIndex === '' ? null : imageOptions[Number(imageIndex)];
              return (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    background: 'var(--color-surface)',
                    display: 'grid',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(170px, 0.8fr)', gap: '0.75rem' }}>
                    <label>
                      <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Color name</span>
                      <input
                        className="input"
                        type="text"
                        value={color.name}
                        placeholder="e.g. Ruby Red"
                        onChange={(event) => updateColor(index, { name: event.target.value })}
                      />
                    </label>

                    <label>
                      <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Exact shade</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="color"
                          value={displayHex(color.hex)}
                          onChange={(event) => updateColor(index, { hex: event.target.value.toUpperCase() })}
                          aria-label={`${color.name || `Color ${index + 1}`} shade picker`}
                          style={{ width: '48px', height: '42px', padding: '3px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                        />
                        <input
                          className="input"
                          type="text"
                          value={color.hex}
                          placeholder="#FF2B3A"
                          maxLength={7}
                          onChange={(event) => updateColor(index, { hex: event.target.value.toUpperCase() })}
                          onBlur={() => updateColor(index, { hex: displayHex(color.hex) })}
                          aria-label={`${color.name || `Color ${index + 1}`} hex value`}
                        />
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'end' }}>
                    <label>
                      <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Linked product image</span>
                      <select
                        className="input"
                        value={imageIndex}
                        onChange={(event) => {
                          const nextIndex = event.target.value;
                          const option = nextIndex === '' ? null : imageOptions[Number(nextIndex)];
                          updateColor(index, {
                            imageIndex: nextIndex === '' ? '' : Number(nextIndex),
                            image: option?.url || '',
                          });
                        }}
                      >
                        <option value="">Choose a product image</option>
                        {imageOptions.map((option) => (
                          <option key={`${option.index}-${option.label}`} value={option.index}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    {selectedImage && (
                      <img
                        src={selectedImage.preview}
                        alt={`${color.name || 'Color'} linked product`}
                        style={{ width: '58px', height: '58px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => update({ colorOptions: colorOptions.filter((_, colorIndex) => colorIndex !== index) })}
                    >
                      Remove color
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => update({
                colorOptions: [...colorOptions, { name: '', hex: DEFAULT_COLOR, image: '', imageIndex: '' }],
              })}
            >
              Add color
            </Button>
          </div>
        </div>
      )}
    </fieldset>
  );
}
