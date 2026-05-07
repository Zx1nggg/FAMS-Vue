import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
  // 建议使用 /api 配合 vite.config.js 的 proxy，防止跨域问题
  baseURL: '/api', 
  timeout: 10000    // 请求超时时间
});

// 1. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  (config) => {
    // 🌟 对齐：获取我们登录页存入的 aqua_token
    const token = sessionStorage.getItem('aqua_token');
    if (token) {
      // 🌟 必须与后端 JwtAuthenticationInterceptor 中的 token-prefix (Bearer ) 保持一致
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 🌟 对齐：后端 Result 类的 code
    if (res.code !== 200) {
      // 🌟 对齐：后端 Result 类的错误字段是 msg 而非 message
      ElMessage.error(res.msg || '系统异常');
      
      // 如果是 401 (鉴权失败/过期)，执行强制登出
      if (res.code === 401) {
        handleUnauthorized();
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res;
  },
  (error) => {
    // 处理 HTTP 状态码层面的错误
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
 */
function handleUnauthorized() {
  sessionStorage.removeItem('aqua_token');
  sessionStorage.removeItem('aqua_user');
  // 延迟一秒跳转，让用户看清错误提示
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

export default service;