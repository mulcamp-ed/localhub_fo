<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DATA_REGION_KEY } from '@/constants/regions'

const open = ref(false)
const nav = [
  { to: `/board/${DATA_REGION_KEY}`, label: '서울 게시판', icon: '🏘️' },
  { to: '/map', label: '지도', icon: '🗺️' },
  { to: '/dashboard', label: '대시보드', icon: '📊' },
  { to: '/calendar', label: '축제 캘린더', icon: '📅' },
  { to: '/bookmarks', label: '북마크', icon: '🔖' }
]
</script>

<template>
  <header class="hd">
    <div class="container hd-inner">
      <RouterLink to="/" class="logo">📍 LocalHub</RouterLink>

      <button class="menu-btn" @click="open = !open" aria-label="메뉴">☰</button>

      <nav class="nav" :class="{ open }" @click="open = false">
        <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-link">
          {{ n.icon }} {{ n.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.hd-inner { display: flex; align-items: center; height: 60px; gap: 20px; }
.logo { font-size: 20px; font-weight: 800; color: var(--primary); }
.nav { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.nav-link {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
.nav-link:hover { background: var(--primary-soft); color: var(--primary); }
.router-link-active.nav-link { color: var(--primary); }

.dropdown { position: relative; }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 6px;
  display: none;
}
.dropdown:hover .dropdown-menu { display: block; }
.dropdown-item {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}
.dropdown-item:hover { background: var(--primary-soft); color: var(--primary); }

.menu-btn { display: none; margin-left: auto; font-size: 22px; background: none; border: none; }

@media (max-width: 720px) {
  .menu-btn { display: block; }
  .nav {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 8px;
    gap: 2px;
  }
  .nav.open { display: flex; }
  .dropdown-menu { position: static; display: block; box-shadow: none; border: none; padding: 0 0 0 12px; }
}
</style>
