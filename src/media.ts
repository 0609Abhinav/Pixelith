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
