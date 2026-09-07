# FAMS-Vue

智渔 / FAMS 前端，Vue 3 + TypeScript + Vite + Element Plus + Tailwind。实际验证 Node 24.11、npm 11.6。后端位于同级 FAMS-backend，默认 http://localhost:8080/api。

## 运行与验证

```sh
npm ci
npm run dev
npm test
npm run build
```

开发端口默认 5173，`/api` 经 vite.config.ts 代理到后端 8080。登录依赖后端 HttpOnly Cookie；请保持同一访问主机，不能混用 localhost 与 127.0.0.1 的会话。不要在前端配置 JWT 密钥或保存真实 token。

`npm run build` 同时运行 vue-tsc 类型检查和生产构建；`npm test` 使用 Node 内置测试运行器验证分页选项加载。目前没有独立 lint 脚本。`dist` 用于静态部署；部署服务器须将 `/api` 反向代理到后端，并为 Vue Router 配置 HTML history 回退。

管理员新增 SOP 模板；监管端新增抽检/附件/整改流程；出塘结算按池塘选批次。密码设置调用真实后端。短信、邮件和外部身份/机构认证缺少服务规格，界面已明确标示未接入，详见工作区 BLOCKERS.md。公开申请状态查询必须输入手机号和最新申请时设置的密码，验证后才显示个人资料与审批意见；密码不放入 URL 或本地存储。

真实服务冒烟由后端 `scripts/Smoke-Isolated.ps1` 统一启动；前端 `scripts/smoke-dev.mjs` 需要专用后端 18080，不应单独对生产环境执行。该检查证明入口/代理连通，不能代替浏览器逐页人工验收。

以下为原模板中的开发工具说明。

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
