import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/services/storage'

// 간단한 고유 id 생성
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const usePostStore = defineStore('posts', () => {
  const posts = ref(storage.getPosts())
  const bookmarks = ref(storage.getBookmarks()) // 북마크한 post id 배열
  const liked = ref(storage.getLiked()) // 좋아요 누른 post id 배열 (중복 방지)

  // ---- 영속화 헬퍼 ----
  const persist = () => storage.savePosts(posts.value)

  // ---- 조회 ----
  const byRegion = (regionKey) =>
    posts.value
      .filter((p) => p.region === regionKey)
      .sort((a, b) => b.createdAt - a.createdAt)

  const getById = (id) => posts.value.find((p) => p.id === id)

  const countByRegion = computed(() => {
    const map = {}
    for (const p of posts.value) map[p.region] = (map[p.region] || 0) + 1
    return map
  })

  const allTags = computed(() => {
    const set = new Set()
    posts.value.forEach((p) => (p.tags || []).forEach((t) => set.add(t)))
    return [...set]
  })

  // ---- CRUD ----
  function create({ region, title, content, password, author, tags }) {
    const now = Date.now()
    const post = {
      id: uid(),
      region,
      title: title.trim(),
      content: content.trim(),
      password, // ⚠️ 평문 저장 (공문 III-2-나, 서버 없음 → 의도된 설계)
      author: (author || '').trim() || '익명',
      tags: normalizeTags(tags),
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0
    }
    posts.value.unshift(post)
    persist()
    return post
  }

  // 비밀번호 일치 확인 (프론트엔드 로직으로만 권한 확인)
  function checkPassword(id, password) {
    const post = getById(id)
    return Boolean(post) && post.password === password
  }

  function update(id, { title, content, tags }, password) {
    const post = getById(id)
    if (!post) throw new Error('게시글을 찾을 수 없습니다.')
    if (post.password !== password) return false
    post.title = title.trim()
    post.content = content.trim()
    post.tags = normalizeTags(tags)
    post.updatedAt = Date.now()
    persist()
    return true
  }

  function remove(id, password) {
    const post = getById(id)
    if (!post) return false
    if (post.password !== password) return false
    posts.value = posts.value.filter((p) => p.id !== id)
    persist()
    return true
  }

  // ---- 조회수 / 좋아요 / 북마크 (부가기능) ----
  function incrementViews(id) {
    const post = getById(id)
    if (post) {
      post.views = (post.views || 0) + 1
      persist()
    }
  }

  function toggleLike(id) {
    const post = getById(id)
    if (!post) return
    const idx = liked.value.indexOf(id)
    if (idx === -1) {
      liked.value.push(id)
      post.likes = (post.likes || 0) + 1
    } else {
      liked.value.splice(idx, 1)
      post.likes = Math.max(0, (post.likes || 0) - 1)
    }
    storage.saveLiked(liked.value)
    persist()
  }
  const isLiked = (id) => liked.value.includes(id)

  function toggleBookmark(id) {
    const idx = bookmarks.value.indexOf(id)
    if (idx === -1) bookmarks.value.push(id)
    else bookmarks.value.splice(idx, 1)
    storage.saveBookmarks(bookmarks.value)
  }
  const isBookmarked = (id) => bookmarks.value.includes(id)
  const bookmarkedPosts = computed(() =>
    bookmarks.value.map((id) => getById(id)).filter(Boolean)
  )

  // ---- 데모 시드 (최초 1회, 비어있을 때만) ----
  function seedIfEmpty() {
    if (posts.value.length > 0) return
    const samples = [
      { region: 'capital', title: '양화한강공원 야경 추천!', content: '노을 질 때 가면 정말 예뻐요. 자전거 대여도 가능합니다.', tags: ['한강', '산책'] },
      { region: 'capital', title: '종로 문학주간 다녀왔어요', content: '동숭동 대학로에서 하는 문학 행사, 볼거리가 많네요.', tags: ['축제', '대학로'] },
      { region: 'chungcheong', title: '대전 비대면 관광지 문의', content: '언택트로 힐링하기 좋은 코스 아시는 분?', tags: ['힐링'] }
    ]
    samples.forEach((s, i) => {
      const now = Date.now() - (samples.length - i) * 3600_000
      posts.value.push({
        id: uid(), ...s, password: '1234', author: '운영자',
        tags: normalizeTags(s.tags), createdAt: now, updatedAt: now, views: (i + 1) * 7, likes: i
      })
    })
    persist()
  }

  return {
    posts, bookmarks, liked,
    byRegion, getById, countByRegion, allTags, bookmarkedPosts,
    create, checkPassword, update, remove,
    incrementViews, toggleLike, isLiked, toggleBookmark, isBookmarked,
    seedIfEmpty
  }
})

function normalizeTags(tags) {
  if (!tags) return []
  const arr = Array.isArray(tags) ? tags : String(tags).split(',')
  return [...new Set(arr.map((t) => t.trim().replace(/^#/, '')).filter(Boolean))].slice(0, 8)
}
