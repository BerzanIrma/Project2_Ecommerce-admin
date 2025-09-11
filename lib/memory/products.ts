export type InMemoryProduct = {
  id: string;
  storeId: string;
  name: string;
  images: string[];
  price: string;
  categoryId?: string;
  sizeId?: string;
  colorId?: string;
  isFeatured?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
};

const productsStorage: Record<string, InMemoryProduct[]> = {};

export function getProducts(storeId: string): InMemoryProduct[] {
  return productsStorage[storeId] ?? [];
}

export function addProduct(storeId: string, product: InMemoryProduct): InMemoryProduct {
  if (!productsStorage[storeId]) productsStorage[storeId] = [];
  productsStorage[storeId].unshift(product);
  return product;
}

export function getProductById(storeId: string, productId: string): InMemoryProduct | undefined {
  return getProducts(storeId).find(p => p.id === productId);
}

export function updateProduct(
  storeId: string,
  productId: string,
  updates: Partial<Pick<InMemoryProduct, 'name' | 'images' | 'price' | 'sizeId' | 'colorId' | 'isFeatured' | 'isArchived'>>
): InMemoryProduct | undefined {
  const list = getProducts(storeId);
  const idx = list.findIndex(p => p.id === productId);
  if (idx === -1) return undefined;
  const updated: InMemoryProduct = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  return updated;
}

export function deleteProduct(storeId: string, productId: string): boolean {
  const list = getProducts(storeId);
  const before = list.length;
  productsStorage[storeId] = list.filter(p => p.id !== productId);
  return productsStorage[storeId].length !== before;
}


