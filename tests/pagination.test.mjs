import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAllPages } from '../src/utils/pagination.ts'

test('loads beyond first page even if server caps page size', async () => {
  const calls = []
  const result = await loadAllPages(async params => {
    calls.push(params)
    return { code: 200, data: { records: params.pageNum === 1 ? [1, 2] : [3], total: 3 } }
  }, { farmId: 10 })
  assert.deepEqual(result.data.records, [1, 2, 3])
  assert.deepEqual(calls.map(p => p.farmId), [10, 10])
  assert.deepEqual(calls.map(p => p.pageNum), [1, 2])
})
test('stops when concurrent deletion empties a page', async () => {
  const result = await loadAllPages(async () => ({ code: 200, data: { records: [], total: 1 } }))
  assert.deepEqual(result.data.records, [])
})
test('does not silently accept failed API responses', async () => {
  await assert.rejects(loadAllPages(async () => ({ code: 403, data: null })))
})
