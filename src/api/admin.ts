import request from '@/utils/request'

export const getAdminUsers = (params: Record<string, any>) =>
  request({ url: '/user/list', method: 'get', params })

export const updateAdminUserStatus = (id: string | number, status: number) =>
  request({ url: `/user/${id}/status`, method: 'put', params: { status } })

export const deleteAdminUsers = (ids: string | number) =>
  request({ url: `/user/${ids}`, method: 'delete' })

export const getAdminRegistrations = (params: Record<string, any>) =>
  request({ url: '/admin/registrations', method: 'get', params })
