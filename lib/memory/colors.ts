export type InMemoryColor = {
  id: string;
  storeId: string;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

const colorsStorage: Record<string, InMemoryColor[]> = {};

export function getColors(storeId: string): InMemoryColor[] {
  return colorsStorage[storeId] ?? [];
}

export function addColor(storeId: string, color: InMemoryColor): InMemoryColor {
  if (!colorsStorage[storeId]) colorsStorage[storeId] = [];
  colorsStorage[storeId].unshift(color);
  return color;
}

export function getColorById(storeId: string, colorId: string): InMemoryColor | undefined {
  return getColors(storeId).find(c => c.id === colorId);
}

export function updateColor(
  storeId: string,
  colorId: string,
  updates: Partial<Pick<InMemoryColor, 'name' | 'value'>>
): InMemoryColor | undefined {
  const list = getColors(storeId);
  const idx = list.findIndex(c => c.id === colorId);
  if (idx === -1) return undefined;
  const updated: InMemoryColor = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  return updated;
}

export function deleteColor(storeId: string, colorId: string): boolean {
  const list = getColors(storeId);
  const before = list.length;
  colorsStorage[storeId] = list.filter(c => c.id !== colorId);
  return colorsStorage[storeId].length !== before;
}


