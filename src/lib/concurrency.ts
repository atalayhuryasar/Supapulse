/**
 * `items` üzerinde `fn` çalıştırırken eşzamanlı görev sayısını `limit` ile sınırlar.
 * Sonuçlar girdi sırasını korur; bir görev hata fırlatırsa hata yukarı iletilir
 * (çağıran taraf `Promise.allSettled` semantiği istiyorsa `fn` içinde yakalamalı).
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const size = Math.max(1, Math.floor(limit))
  const results = new Array<R>(items.length)
  let cursor = 0

  const worker = async () => {
    for (;;) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return
      results[index] = await fn(items[index], index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, () => worker())
  )

  return results
}
