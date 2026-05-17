<template>
  <div class="app-container">
    <nav class="nav-menu">
      <router-link to="/">首页</router-link> |
      <router-link to="/test">后端测试页</router-link>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
// 所有的状态和请求都交给具体的 View 组件去处理
</script>

<style>
.app-container {
  font-family: Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}

.nav-menu {
  padding: 30px;
}

.nav-menu a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

.nav-menu a.router-link-exact-active {
  color: #42b983; /* Vue 默认绿色高亮 */
}

.main-content {
  padding: 20px;
}

/* 简单的路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>