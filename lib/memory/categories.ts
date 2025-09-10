export type InMemoryCategory = {
  id: string;
  name: string;
  billboardId: string;
  storeId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

const categoriesStorage: Record<string, InMemoryCategory[]> = {};

export function getCategories(storeId: string): InMemoryCategory[] {
  return categoriesStorage[storeId] ?? [];
}

export function addCategory(storeId: string, category: InMemoryCategory): InMemoryCategory {
  if (!categoriesStorage[storeId]) {
    categoriesStorage[storeId] = [];
  }
  categoriesStorage[storeId].unshift(category);
  return category;
}

export function getCategoryById(storeId: string, categoryId: string): InMemoryCategory | undefined {
  return getCategories(storeId).find(c => c.id === categoryId);
}

export function updateCategory(
  storeId: string,
  categoryId: string,
  updates: Partial<Pick<InMemoryCategory, 'name' | 'billboardId'>>
): InMemoryCategory | undefined {
  const list = getCategories(storeId);
  const idx = list.findIndex(c => c.id === categoryId);
  if (idx === -1) return undefined;
  const updated: InMemoryCategory = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  return updated;
}

export function deleteCategory(storeId: string, categoryId: string): boolean {
  const list = getCategories(storeId);
  const before = list.length;
  categoriesStorage[storeId] = list.filter(c => c.id !== categoryId);
  return categoriesStorage[storeId].length !== before;
}


