import axios from 'axios';

import {ElMessage} from 'element-plus';

// Axios实例
const service = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000,
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res.code !== 200) {
            ElMessage.error(res.message || '请求失败');
            return  Promise.reject(new Error(res.message || '请求失败')); // 返回一个被拒绝的Promise，包含错误信息
        }
        return res;
    },
    (error) => {
        console.error('HTTP 响应错误',error);
        ElMessage.error(error.message || '网络错误');
        return Promise.reject(error);
    }
);

export default service;