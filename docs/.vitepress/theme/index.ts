import { h } from 'vue'
import Theme from 'vitepress/theme'
import Giscus from './Giscus.vue'
import TagBadges from './TagBadges.vue'
import './style.css'

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      'doc-before': () => h(TagBadges),
      'doc-after': () => h(Giscus)
    })
  }
}
