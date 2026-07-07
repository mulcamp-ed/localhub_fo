// localStorage 래퍼 — 게시글/북마크/좋아요/알림 상태 저장
// ⚠️ 별도 서버가 없어 게시글의 수정용 비밀번호는 암호화 없이 저장됩니다(공문 III-2-나, 교육 목적의 의도된 설계).

const KEYS = {
  posts: 'localhub.posts',
  bookmarks: 'localhub.bookmarks',
  liked: 'localhub.liked',
  lastSeen: 'localhub.lastSeenPostId'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.warn(`[storage] ${key} 파싱 실패`, e)
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`[storage] ${key} 저장 실패 (용량 초과 가능)`, e)
    throw e
  }
}

export const storage = {
  getPosts: () => read(KEYS.posts, []),
  savePosts: (posts) => write(KEYS.posts, posts),

  getBookmarks: () => read(KEYS.bookmarks, []),
  saveBookmarks: (ids) => write(KEYS.bookmarks, ids),

  getLiked: () => read(KEYS.liked, []),
  saveLiked: (ids) => write(KEYS.liked, ids),

  getLastSeen: () => read(KEYS.lastSeen, null),
  saveLastSeen: (id) => write(KEYS.lastSeen, id)
}

export { KEYS }
