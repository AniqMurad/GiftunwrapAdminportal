export const cleanWhatsInsideItems = (items) => (Array.isArray(items) ? items : [])
  .map((item) => {
    const normalizedItem = typeof item === 'string' ? { name: item } : item;
    const quantity = Number(normalizedItem?.quantity);

    return {
      name: String(normalizedItem?.name || '').trim(),
      ...(Number.isFinite(quantity) && quantity >= 1 ? { quantity } : {}),
      ...(String(normalizedItem?.description || '').trim()
        ? { description: String(normalizedItem.description).trim() }
        : {}),
    };
  })
  .filter((item) => item.name);
