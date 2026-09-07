import { createServer } from 'vite'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { host: '127.0.0.1', port: 15173, strictPort: true, proxy: { '/api': { target: 'http://127.0.0.1:18080', changeOrigin: true } } },
})
try {
  await server.listen()
  const page = await fetch('http://127.0.0.1:15173')
  assert.equal(page.status, 200)
  assert.match(await page.text(), /<div id="app"><\/div>/)
  const profile = await fetch('http://127.0.0.1:15173/api/user/profile')
  assert.equal((await profile.json()).code, 401)
  const entry = await fetch('http://127.0.0.1:15173/src/main.ts')
  assert.equal(entry.status, 200)
  await server.environments.client.depsOptimizer?.scanProcessing
  await server.waitForRequestsIdle()
  console.log('PASS Vite dev startup, HTML entry and /api proxy to real backend')
} finally {
  await server.close()
}
