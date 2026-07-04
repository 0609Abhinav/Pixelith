export function uniqueBy<T>(items: T[], keyFn: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function takeUnique<T>(items: T[], count: number, keyFn: (item: T) => string) {
  return uniqueBy(items, keyFn).slice(0, count);
}

const globalImagePool = new Set<string>();

export function registerImage(idOrUrl: string) {
  globalImagePool.add(idOrUrl);
}

export function isImageUsed(idOrUrl: string) {
  return globalImagePool.has(idOrUrl);
}

export function getUnusedImage<T>(items: T[], keyFn: (item: T) => string): T {
  for (const item of items) {
    const key = keyFn(item);
    if (!globalImagePool.has(key)) {
      globalImagePool.add(key);
      return item;
    }
  }
  return items[0]; // fallback if all used
}

export function clearImagePool() {
  globalImagePool.clear();
}
