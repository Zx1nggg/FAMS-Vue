/**
 * 用户专属 sessionStorage 工具
 *
 * 通过在 key 中嵌入用户 ID，避免同一浏览器下不同用户登录后
 * 读到上一个用户的缓存头像/个人信息。
 */

/** 从 sessionStorage 中提取当前登录用户的 ID */
export function getUserId(): number | null {
  const userStr = sessionStorage.getItem('aqua_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user.id ?? null
  } catch {
    return null
  }
}

/** 生成带用户 ID 后缀的 sessionStorage key */
function scopedKey(base: string): string {
  const uid = getUserId()
  if (!uid) return base // 降级：取不到用户 ID 时回退到原始 key
  return `${base}_${uid}`
}

// ---- 用户专属 key 常量 ----
const AVATAR_BASE64_PREFIX = 'aqua_avatar_base64'
const PROFILE_PREFIX = 'aqua_profile'

// ---- 旧的静态 key（用于登录时清理） ----
const OLD_STATIC_KEYS = ['aqua_avatar_base64', 'aqua_profile']

// ---- 读 / 写 ----

/** 读取当前用户缓存的头像 base64 */
export function getCachedAvatar(): string {
  return sessionStorage.getItem(scopedKey(AVATAR_BASE64_PREFIX)) || ''
}

/** 缓存当前用户的头像 base64 */
export function setCachedAvatar(base64: string): void {
  sessionStorage.setItem(scopedKey(AVATAR_BASE64_PREFIX), base64)
}

/** 读取当前用户缓存的完整 Profile JSON */
export function getCachedProfile(): string | null {
  return sessionStorage.getItem(scopedKey(PROFILE_PREFIX))
}

/** 缓存当前用户的完整 Profile JSON */
export function setCachedProfile(profileJson: string): void {
  sessionStorage.setItem(scopedKey(PROFILE_PREFIX), profileJson)
}

/** 清除当前用户的全部缓存（退出登录时调用） */
export function clearUserCache(): void {
  const uid = getUserId()
  if (uid) {
    sessionStorage.removeItem(`${AVATAR_BASE64_PREFIX}_${uid}`)
    sessionStorage.removeItem(`${PROFILE_PREFIX}_${uid}`)
  }
}

/**
 * 登录成功后调用：清理旧版静态 key（迁移期兜底），
 * 防止旧代码残留的全局缓存污染新用户。
 */
export function clearOldStaticCaches(): void {
  OLD_STATIC_KEYS.forEach((key) => sessionStorage.removeItem(key))
}
