import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { createContentLoader } from 'vitepress'

declare const data: Record<string, any>
export { data }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform(raw) {
    const tags: Record<string, Array<{ title: string; url: string }>> = {}

    // Parse frontmatter from all markdown files
    const docsDir = path.resolve(__dirname, '../../')

    function walkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'public') continue

        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          walkDir(fullPath)
        } else if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const { data: fm } = matter(content)

          if (fm.tags && Array.isArray(fm.tags)) {
            const relativePath = path.relative(docsDir, fullPath).replace(/\\/g, '/')
            const url = '/' + relativePath.replace('.md', '')
            const title = fm.title || entry.name.replace('.md', '')

            for (const tag of fm.tags) {
              if (!tags[tag]) {
                tags[tag] = []
              }
              tags[tag].push({ title, url })
            }
          }
        }
      }
    }

    walkDir(docsDir)

    // Convert to array of { tag, pages }
    const result = Object.entries(tags).map(([tag, pages]) => ({
      tag,
      pages: pages.sort((a, b) => a.title.localeCompare(b.title))
    }))

    return result.sort((a, b) => a.tag.localeCompare(b.tag))
  }
})
