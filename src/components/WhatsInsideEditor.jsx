import { useEffect, useMemo, useState } from 'react';
import { fetchGiftBoxItems } from '../api';
import { Button, Select } from './UI';

const categoryLabels = {
  'chocolates-snacks': 'Chocolates & Snacks',
  flowers: 'Flowers',
  'customised-items': 'Customised Items',
  'jewellery-accessories': 'Jewellery & Accessories',
  fragrances: 'Fragrances',
  clothing: 'Clothing',
  shoes: 'Shoes',
  'beauty-personal-care': 'Beauty & Personal Care',
  'gift-cards': 'Gift Cards',
};

const reusableItemSnapshot = (item) => ({
  giftBoxItemId: Number(item.id),
  name: item.name,
  description: item.description || '',
  image: item.image,
});

export default function WhatsInsideEditor({ items = [], onChange }) {
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    fetchGiftBoxItems()
      .then((response) => {
        if (active) setCatalogueItems(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (active) setLoadError('Reusable items could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const catalogueById = useMemo(
    () => new Map(catalogueItems.map((item) => [Number(item.id), item])),
    [catalogueItems],
  );
  const selectedIds = useMemo(
    () => new Set(items.map((item) => Number(item.giftBoxItemId)).filter(Number.isFinite)),
    [items],
  );
  const availableItems = catalogueItems.filter((item) => !selectedIds.has(Number(item.id)));

  const addItem = () => {
    const catalogueItem = catalogueById.get(Number(selectedItemId));
    if (!catalogueItem) return;
    onChange([...items, reusableItemSnapshot(catalogueItem)]);
    setSelectedItemId('');
  };

  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (index, direction) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    onChange(reordered);
  };

  return (
    <fieldset className="whats-inside-editor">
      <legend>What&apos;s Inside</legend>
      <p>
        Select reusable items from Gift Box Items. Their storefront name, image, and short description stay linked to the catalogue.
      </p>

      <div className="whats-inside-picker">
        <Select
          label="Reusable Gift Box Item"
          value={selectedItemId}
          onChange={(event) => setSelectedItemId(event.target.value)}
          disabled={loading || availableItems.length === 0}
        >
          <option value="">{loading ? 'Loading items…' : 'Choose an item'}</option>
          {availableItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {categoryLabels[item.category] || item.category}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" onClick={addItem} disabled={!selectedItemId}>
          Add item
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.open('/gift-box-items', '_blank', 'noopener,noreferrer')}>
          Manage Gift Box Items
        </Button>
      </div>

      {loadError && <p className="whats-inside-error" role="alert">{loadError}</p>}

      {items.length === 0 ? (
        <div className="whats-inside-empty">No included items selected yet.</div>
      ) : (
        <div className="whats-inside-list">
          {items.map((storedItem, index) => {
            const catalogueItem = catalogueById.get(Number(storedItem.giftBoxItemId));
            const item = catalogueItem || storedItem;
            const isLegacyItem = !storedItem.giftBoxItemId;

            return (
              <div className="whats-inside-item" key={`${storedItem.giftBoxItemId || 'legacy'}-${index}`}>
                <div className="whats-inside-item-heading">
                  <strong>Item {index + 1}</strong>
                  <div className="whats-inside-item-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Move item ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      icon={<i className="bi bi-arrow-up" aria-hidden="true" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Move item ${index + 1} down`}
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 1)}
                      icon={<i className="bi bi-arrow-down" aria-hidden="true" />}
                    />
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() => removeItem(index)}
                      icon={<i className="bi bi-trash3" aria-hidden="true" />}
                    />
                  </div>
                </div>

                <div className="whats-inside-catalogue-item">
                  <span className="whats-inside-catalogue-image">
                    {item.image ? <img src={item.image} alt="" /> : <i className="bi bi-image" aria-hidden="true" />}
                  </span>
                  <span className="whats-inside-catalogue-copy">
                    <strong>{item.name || 'Legacy included item'}</strong>
                    {item.description && <span>{item.description}</span>}
                    {isLegacyItem && <small>Legacy item — replace it with a reusable Gift Box Item when convenient.</small>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
