import { Button, Input } from './UI';

const categoryExamples = {
  giftsForHim: 'e.g. Leather wallet',
  giftsForHer: 'e.g. Scented candle',
  birthday: 'e.g. Birthday chocolate bar',
  personalized: 'e.g. Personalized name plaque',
  FlowersChocolates: 'e.g. Fresh sunflowers',
  sweetTreats: 'e.g. Chocolate brownies',
  giftsForCompany: 'e.g. Branded notebook',
};

const createEmptyItem = () => ({ name: '', quantity: '', description: '' });

export default function WhatsInsideEditor({ items = [], onChange, category }) {
  const updateItem = (index, field, value) => {
    onChange(items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
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
      <p>Add each item included with this product. These entries appear in order on the storefront product page.</p>

      {items.length === 0 ? (
        <div className="whats-inside-empty">No included items added yet.</div>
      ) : (
        <div className="whats-inside-list">
          {items.map((item, index) => (
            <div className="whats-inside-item" key={`whats-inside-${index}`}>
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

              <div className="whats-inside-fields">
                <Input
                  label="Included item"
                  required
                  placeholder={categoryExamples[category] || 'e.g. Included gift item'}
                  value={item.name || ''}
                  onChange={(event) => updateItem(index, 'name', event.target.value)}
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Optional"
                  value={item.quantity ?? ''}
                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                />
              </div>
              <Input
                label="Details"
                placeholder="Optional supporting detail"
                value={item.description || ''}
                onChange={(event) => updateItem(index, 'description', event.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange([...items, createEmptyItem()])}
        icon={<i className="bi bi-plus-lg" aria-hidden="true" />}
      >
        Add included item
      </Button>
    </fieldset>
  );
}
