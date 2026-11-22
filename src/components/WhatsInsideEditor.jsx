import { Button, ImageDropzone, Input, Textarea } from './UI';

const emptyItem = () => ({
  name: '',
  description: '',
  image: '',
});

export default function WhatsInsideEditor({ items = [], onChange }) {
  const addItem = () => {
    onChange([...items, emptyItem()]);
  };

  const updateItem = (index, changes) => {
    onChange(items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...changes } : item
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

  const updateItemImage = (index, files) => {
    updateItem(index, { imageFile: files[0] });
  };

  return (
    <fieldset className="whats-inside-editor">
      <legend>What&apos;s Inside</legend>
      <p>
        Add the contents for this product only. Enter each item&apos;s text and upload its own image.
      </p>

      {items.length === 0 ? (
        <div className="whats-inside-empty">No included items added yet.</div>
      ) : (
        <div className="whats-inside-list">
          {items.map((item, index) => (
            <div className="whats-inside-item" key={`product-content-${index}`}>
              <div className="whats-inside-item-heading">
                <strong>Item {index + 1}</strong>
                <div className="whats-inside-item-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Move item ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    icon={<i className="bi bi-arrow-up" aria-hidden="true" />}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Move item ${index + 1} down`}
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    icon={<i className="bi bi-arrow-down" aria-hidden="true" />}
                  />
                  <Button
                    type="button"
                    variant="danger-ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() => removeItem(index)}
                    icon={<i className="bi bi-trash3" aria-hidden="true" />}
                  />
                </div>
              </div>

              <div className="whats-inside-manual-fields">
                <Input
                  label="Item name"
                  required
                  value={item.name || ''}
                  placeholder="e.g. Fresh yellow sunflowers"
                  onChange={(event) => updateItem(index, { name: event.target.value })}
                />
                <Textarea
                  label="Item description"
                  value={item.description || ''}
                  placeholder="Optional short detail about this item"
                  rows={3}
                  onChange={(event) => updateItem(index, { description: event.target.value })}
                />
                <ImageDropzone
                  label="Item image"
                  required
                  compact
                  maxFiles={1}
                  files={item.imageFile ? [item.imageFile] : []}
                  existingImages={!item.imageFile && item.image ? [item.image] : []}
                  onRemoveExisting={() => updateItem(index, { image: '' })}
                  onFilesChange={(files) => updateItemImage(index, files)}
                  help="Upload one image for this item. A new upload replaces its current image."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={addItem}
        icon={<i className="bi bi-plus-lg" aria-hidden="true" />}
      >
        Add What&apos;s Inside item
      </Button>
    </fieldset>
  );
}
