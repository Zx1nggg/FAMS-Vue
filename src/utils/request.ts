import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  // 允许跨域携带 Cookie（HttpOnly Cookie `aqua_token` 依赖此配置）
  withCredentials: true,
});

// 1. 请求拦截器
service.interceptors.request.use(
  (config) => {
    // HttpOnly Cookie 由浏览器自动在每次同源请求中携带
    const currentFarmId = sessionStorage.getItem('current_farm_id')
    const userStr = sessionStorage.getItem('aqua_user')

    if (currentFarmId && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'FARMER') {
          config.headers = config.headers || {}
          config.headers['X-Current-Farm-Id'] = currentFarmId
        }
      } catch {
        // ignore parse failure
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 后端 Result 统一格式：{ code, message, data }
    if (res.code !== 200) {
      ElMessage.error(res.message || '系统异常');

      // 401 鉴权失败 → 强制跳转登录页
      if (res.code === 401) {
        handleUnauthorized();
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    // HTTP 状态码层面的错误（后端统一返回 200 + code 字段）
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      handleUnauthorized();
    } else {
      ElMessage.error(error.message || '网络连接异常');
    }
    return Promise.reject(error);
  }
);

/**
 * 统一处理 401 无权限状态
 * HttpOnly Cookie 无法被 JS 删除，交由后端销毁；
 * 前端只需清除自己存的用户展示信息，然后跳转登录页。
 */
function handleUnauthorized() {
  sessionStorage.removeItem('aqua_user');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

export default service;
