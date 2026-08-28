---
title: Tags
description: All tags used in this wiki
---

<script setup lang="ts">
import { data as tags } from '../.vitepress/theme/tags.data'
</script>

# Tags

All tags used across the wiki:

<div v-for="{ tag, pages } in tags" :key="tag" :id="tag" class="tag-section">
  <h2><span class="tag-badge">{{ tag }}</span></h2>
  <ul>
    <li v-for="page in pages" :key="page.url">
      <a :href="page.url">{{ page.title }}</a>
    </li>
  </ul>
</div>
