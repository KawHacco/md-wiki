<template>
  <div v-if="tags.length" class="tag-badges">
    <a
      v-for="tag in tags"
      :key="tag"
      :href="withBase(`/tags/#${tag}`)"
      class="tag-badge"
    >{{ tag }}</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()
const tags = computed<string[]>(() => frontmatter.value.tags ?? [])
</script>
