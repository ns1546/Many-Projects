export const toTitleCase = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

export const normalizeProductEntity = (entity) => {
  return {
    ...entity,
    brand: toTitleCase(entity.brand?.trim()),
    productType: toTitleCase(entity.productType?.trim()),
    flavor: toTitleCase(entity.flavor?.trim()),
    weight: entity.weight?.trim().toLowerCase(), // weights are usually lowercase e.g., 400g
    notes: entity.notes?.trim()
  };
};
