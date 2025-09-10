export type InMemorySize = {
  id: string;
  storeId: string;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

const sizesStorage: Record<string, InMemorySize[]> = {};

export function getSizes(storeId: string): InMemorySize[] {
  return sizesStorage[storeId] ?? [];
}

export function addSize(storeId: string, size: InMemorySize): InMemorySize {
  if (!sizesStorage[storeId]) sizesStorage[storeId] = [];
  sizesStorage[storeId].unshift(size);
  return size;
}

export function getSizeById(storeId: string, sizeId: string): InMemorySize | undefined {
  return getSizes(storeId).find(s => s.id === sizeId);
}

export function updateSize(storeId: string, sizeId: string, updates: Partial<Pick<InMemorySize, 'name' | 'value'>>): InMemorySize | undefined {
  const list = getSizes(storeId);
  const idx = list.findIndex(s => s.id === sizeId);
  if (idx === -1) return undefined;
  const updated: InMemorySize = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  return updated;
}

export function deleteSize(storeId: string, sizeId: string): boolean {
  const list = getSizes(storeId);
  const before = list.length;
  sizesStorage[storeId] = list.filter(s => s.id !== sizeId);
  return sizesStorage[storeId].length !== before;
}




