<template>
  <div id="giscus-container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', 'namiyama814/md-wiki')
  script.setAttribute('data-repo-id', 'REPLACE_WITH_REPO_ID')
  script.setAttribute('data-category', 'Discussions')
  script.setAttribute('data-category-id', 'REPLACE_WITH_CATEGORY_ID')
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'bottom')
  script.setAttribute('data-theme', 'light')
  script.setAttribute('data-lang', 'ja')
  script.setAttribute('data-loading', 'lazy')

  const container = document.getElementById('giscus-container')
  if (container) {
    container.appendChild(script)
  }
})
</script>
