<script setup lang="ts">
const isLoading = useState('global-loading', () => false)
const loadingText = useState('global-loading-text', () => 'กำลังโหลดข้อมูล...')

const nuxtApp = useNuxtApp()

nuxtApp.hook('page:start', () => {
  isLoading.value = true
  loadingText.value = 'กำลังเปลี่ยนหน้า...'
})

nuxtApp.hook('page:finish', () => {
  // Use a slight delay (250ms) to ensure smooth transition and prevent screen flicker
  setTimeout(() => {
    // Only hide if the text has not been taken over by the mounting page
    if (loadingText.value === 'กำลังเปลี่ยนหน้า...') {
      isLoading.value = false
    }
  }, 250)
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <LoadingOverlay :show="isLoading" :text="loadingText" />
  </div>
</template>


