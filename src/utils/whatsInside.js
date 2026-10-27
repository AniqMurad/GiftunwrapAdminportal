export const cleanWhatsInsideItems = (items) => (Array.isArray(items) ? items : [])
  .map((item) => {
    const normalizedItem = typeof item === 'string' ? { name: item } : item;
    const giftBoxItemId = Number(normalizedItem?.giftBoxItemId);

    return {
      ...(Number.isInteger(giftBoxItemId) && giftBoxItemId > 0 ? { giftBoxItemId } : {}),
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
