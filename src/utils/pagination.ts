type PageResult<T> = { code: number; data: { records: T[]; total: number; [key: string]: unknown } }

/** Load all selector options using the existing paginated API, including server-side page-size caps. */
export async function loadAllPages<T>(fetchPage: (params: Record<string, unknown>) => Promise<PageResult<T>>, params: Record<string, unknown> = {}): Promise<PageResult<T>> {
  const records: T[] = []
  for (let pageNum = 1; ; pageNum++) {
    const response = await fetchPage({ ...params, pageNum, pageSize: 100 })
    if (response.code !== 200) throw new Error('选项加载失败')
    const page = response.data
    if (!Array.isArray(page.records) || !Number.isFinite(Number(page.total))) throw new Error('分页响应格式不正确')
    records.push(...page.records)
    if (records.length >= Number(page.total) || page.records.length === 0) {
      return { ...response, data: { ...page, records } }
    }
  }
}
