<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PasswordModal from '@/components/PasswordModal.vue'
import { regionName } from '@/constants/regions'
import { usePostStore } from '@/stores/posts'

const props = defineProps({ id: { type: String, required: true } })
const store = usePostStore()
const router = useRouter()

const post = computed(() => store.getById(props.id))
const modalOpen = ref(false)
const modalMode = ref('edit') // 'edit' | 'delete'
const modalRef = ref(null)
const copied = ref(false)

onMounted(() => {
  if (post.value) store.incrementViews(props.id)
})

function openModal(mode) {
  modalMode.value = mode
  modalOpen.value = true
}

function onSubmit(pw, setError) {
  if (!store.checkPassword(props.id, pw)) {
    setError('비밀번호가 일치하지 않습니다.')
    return
  }
  modalOpen.value = false
  if (modalMode.value === 'edit') {
    // 검증된 비밀번호를 수정 화면으로 전달
    sessionStorage.setItem(`localhub.edit.${props.id}`, pw)
    router.push(`/post/${props.id}/edit`)
  } else {
    store.remove(props.id, pw)
    router.push(`/board/${post.value.region}`)
  }
}

function share() {
  const url = window.location.href
  navigator.clipboard?.writeText(url).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  })
}

function fmt(ts) {
  return new Date(ts).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="container section narrow">
    <template v-if="post">
      <RouterLink :to="`/board/${post.region}`" class="back muted">‹ {{ regionName(post.region) }} 게시판</RouterLink>

      <article class="card post">
        <div class="row between wrap head">
          <span class="badge">{{ regionName(post.region) }}</span>
          <div class="row gap-8">
            <button class="btn btn-sm" @click="store.toggleBookmark(post.id)">
              {{ store.isBookmarked(post.id) ? '🔖 북마크됨' : '🔖 북마크' }}
            </button>
            <button class="btn btn-sm" @click="share">{{ copied ? '✅ 복사됨' : '🔗 공유' }}</button>
          </div>
        </div>

        <h1 class="title">{{ post.title }}</h1>

        <div class="row between wrap meta">
          <span class="muted">✍️ {{ post.author }}</span>
          <span class="muted">
            🕒 {{ fmt(post.createdAt) }}
            <template v-if="post.updatedAt !== post.createdAt"> (수정됨)</template>
            · 👁 {{ post.views }}
          </span>
        </div>

        <div v-if="post.tags?.length" class="row gap-8 wrap tags">
          <span v-for="t in post.tags" :key="t" class="tag">#{{ t }}</span>
        </div>

        <div class="content">{{ post.content }}</div>

        <div class="like-row">
          <button class="like-btn" :class="{ on: store.isLiked(post.id) }" @click="store.toggleLike(post.id)">
            {{ store.isLiked(post.id) ? '❤️' : '🤍' }} 좋아요 {{ post.likes }}
          </button>
        </div>

        <div class="row gap-8 actions">
          <button class="btn" @click="openModal('edit')">✏️ 수정</button>
          <button class="btn btn-danger" @click="openModal('delete')">🗑️ 삭제</button>
        </div>
      </article>
    </template>

    <div v-else class="empty card">
      <p>게시글을 찾을 수 없습니다. (삭제되었거나 다른 브라우저에서 작성된 글일 수 있어요)</p>
      <RouterLink to="/" class="btn btn-primary">홈으로</RouterLink>
    </div>

    <PasswordModal
      ref="modalRef"
      :open="modalOpen"
      :title="modalMode === 'edit' ? '수정 비밀번호 확인' : '삭제 비밀번호 확인'"
      :action="modalMode === 'edit' ? '수정하기' : '삭제하기'"
      @submit="onSubmit"
      @close="modalOpen = false"
    />
  </div>
</template>

<style scoped>
.narrow { max-width: 760px; }
.back { display: inline-block; margin-bottom: 14px; font-size: 14px; }
.post { padding: 28px; }
.head { margin-bottom: 10px; }
.title { font-size: 26px; margin: 6px 0 12px; }
.meta { font-size: 13px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.tags { margin: 14px 0; }
.content { white-space: pre-wrap; font-size: 15px; line-height: 1.8; padding: 18px 0; min-height: 120px; }
.like-row { text-align: center; padding: 10px 0 24px; }
.like-btn {
  border: 1px solid var(--border); background: #fff; padding: 10px 22px;
  border-radius: 999px; font-weight: 700; font-size: 15px;
}
.like-btn.on { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.actions { justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 18px; }
</style>
