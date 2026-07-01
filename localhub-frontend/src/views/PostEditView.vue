<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { regionName } from '@/constants/regions'
import { usePostStore } from '@/stores/posts'

const props = defineProps({
  region: { type: String, default: '' }, // 새 글 작성 시
  id: { type: String, default: '' } // 수정 시
})

const store = usePostStore()
const router = useRouter()
const isEdit = computed(() => Boolean(props.id))

const form = reactive({ title: '', content: '', password: '', author: '', tags: '' })
const error = ref('')
const targetRegion = ref(props.region)

onMounted(() => {
  if (isEdit.value) {
    const post = store.getById(props.id)
    if (!post) {
      error.value = '게시글을 찾을 수 없습니다.'
      return
    }
    form.title = post.title
    form.content = post.content
    form.author = post.author
    form.tags = (post.tags || []).join(', ')
    targetRegion.value = post.region
    // 수정 진입 시 비밀번호는 PostDetail 에서 검증 후 sessionStorage 에 임시 전달
    const verified = sessionStorage.getItem(`localhub.edit.${props.id}`)
    if (verified) form.password = verified
    else {
      error.value = '비밀번호 확인 후 수정할 수 있습니다.'
      router.replace(`/post/${props.id}`)
    }
  }
})

function submit() {
  error.value = ''
  if (!form.title.trim()) return (error.value = '제목을 입력하세요.')
  if (!form.content.trim()) return (error.value = '내용을 입력하세요.')
  if (!isEdit.value && !form.password) return (error.value = '수정용 비밀번호를 입력하세요.')

  if (isEdit.value) {
    const ok = store.update(
      props.id,
      { title: form.title, content: form.content, tags: form.tags },
      form.password
    )
    if (!ok) return (error.value = '비밀번호가 일치하지 않습니다.')
    sessionStorage.removeItem(`localhub.edit.${props.id}`)
    router.push(`/post/${props.id}`)
  } else {
    const post = store.create({
      region: targetRegion.value,
      title: form.title,
      content: form.content,
      password: form.password,
      author: form.author,
      tags: form.tags
    })
    router.push(`/post/${post.id}`)
  }
}

function cancel() {
  if (isEdit.value) router.push(`/post/${props.id}`)
  else router.push(`/board/${targetRegion.value}`)
}
</script>

<template>
  <div class="container section narrow">
    <h1 class="page-title">{{ isEdit ? '✏️ 글 수정' : '✏️ 새 글 작성' }}</h1>
    <p class="page-sub">{{ regionName(targetRegion) }} 게시판</p>

    <div class="card form-card">
      <div class="field">
        <label>제목</label>
        <input v-model="form.title" class="input" placeholder="제목을 입력하세요" maxlength="80" />
      </div>

      <div class="field">
        <label>작성자 (선택)</label>
        <input v-model="form.author" class="input" placeholder="비워두면 '익명'" maxlength="20" />
      </div>

      <div class="field">
        <label>내용</label>
        <textarea v-model="form.content" class="textarea" placeholder="내용을 입력하세요"></textarea>
      </div>

      <div class="field">
        <label>태그 (선택, 쉼표로 구분)</label>
        <input v-model="form.tags" class="input" placeholder="예: 맛집, 데이트, 한강" />
      </div>

      <div v-if="!isEdit" class="field">
        <label>수정용 비밀번호</label>
        <input v-model="form.password" type="password" class="input" placeholder="수정·삭제 시 필요합니다" />
        <p class="muted note">
          ⚠️ 서버가 없어 비밀번호는 브라우저(localStorage)에 <b>암호화 없이</b> 저장됩니다. (교육용 설계)
        </p>
      </div>

      <p v-if="error" class="err">{{ error }}</p>

      <div class="row gap-8" style="justify-content: flex-end">
        <button class="btn" @click="cancel">취소</button>
        <button class="btn btn-primary" @click="submit">{{ isEdit ? '수정 완료' : '등록' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.narrow { max-width: 720px; }
.form-card { padding: 24px; }
.note { font-size: 12px; margin: 8px 0 0; }
.err { color: var(--danger); font-size: 14px; margin: 0 0 12px; }
</style>
