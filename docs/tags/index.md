---
title: Tags
description: All tags used in this wiki
layout: page
---

<script setup lang="ts">
import { data as tags } from '../.vitepress/theme/tags.data'
</script>

# Tags

All tags used across the wiki:

<div v-for="{ tag, pages } in tags" :key="tag" style="margin-bottom: 2rem;">
  <h2>{{ tag }}</h2>
  <ul>
    <li v-for="page in pages" :key="page.url">
      <a :href="page.url">{{ page.title }}</a>
    </li>
  </ul>
</div>
