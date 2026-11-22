export const cleanWhatsInsideItems = (items) => (Array.isArray(items) ? items : [])
  .map((item) => {
    const normalizedItem = typeof item === 'string' ? { name: item } : item;

    return {
      name: String(normalizedItem?.name || '').trim(),
      ...(String(normalizedItem?.description || '').trim()
        ? { description: String(normalizedItem.description).trim() }
        : {}),
      ...(typeof normalizedItem?.image === 'string' && normalizedItem.image.trim()
        ? { image: normalizedItem.image.trim() }
        : {}),
    };
  })
  .filter((item) => item.name);

export const hasCompleteWhatsInsideItems = (items) => Array.isArray(items)
  && items.length > 0
  && items.every((item) => (
    String(item?.name || '').trim()
    && (Boolean(item?.imageFile) || Boolean(String(item?.image || '').trim()))
  ));
