import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DefaultTheme } from 'vitepress'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docsDir = path.resolve(__dirname, '../../')

interface FrontMatter {
  title?: string
  order?: number
  tags?: string[]
  description?: string
}

interface PageInfo {
  title: string
  path: string
  order: number
}

interface SidebarGroup {
  text: string
  items: (SidebarGroup | DefaultTheme.SidebarItem)[]
  order: number
}

function parseFrontMatter(filePath: string): FrontMatter {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(content)
    return data as FrontMatter
  } catch {
    return {}
  }
}

function getFilesInDir(dirPath: string): PageInfo[] {
  const files: PageInfo[] = []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'index.md') continue

      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        files.push(...getFilesInDir(fullPath))
      } else if (entry.name.endsWith('.md')) {
        const fm = parseFrontMatter(fullPath)
        const relativePath = path.relative(docsDir, fullPath).replace(/\\/g, '/')
        files.push({
          title: fm.title || entry.name.replace('.md', ''),
          path: '/' + relativePath.replace('.md', ''),
          order: fm.order ?? Infinity
        })
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files
}

function createSidebarForCategory(categoryPath: string, categoryName: string): DefaultTheme.SidebarItem | null {
  try {
    const entries = fs.readdirSync(categoryPath, { withFileTypes: true })
    const items: (DefaultTheme.SidebarItem | DefaultTheme.SidebarGroup)[] = []

    const mdFiles: { file: string; info: PageInfo }[] = []
    const dirs: string[] = []

    // Separate directories and files
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'index.md') continue

      const fullPath = path.join(categoryPath, entry.name)
      if (entry.isDirectory()) {
        dirs.push(entry.name)
      } else if (entry.name.endsWith('.md')) {
        const fm = parseFrontMatter(fullPath)
        const relativePath = path.relative(docsDir, fullPath).replace(/\\/g, '/')
        mdFiles.push({
          file: entry.name,
          info: {
            title: fm.title || entry.name.replace('.md', ''),
            path: '/' + relativePath.replace('.md', ''),
            order: fm.order ?? Infinity
          }
        })
      }
    }

    // Add files sorted by order
    const sortedFiles = mdFiles.sort((a, b) => a.info.order - b.info.order)
    for (const { info } of sortedFiles) {
      items.push({
        text: info.title,
        link: info.path
      })
    }

    // Add directories as nested groups
    for (const dir of dirs.sort()) {
      const subCategoryPath = path.join(categoryPath, dir)
      const subCategoryInfo = createSidebarForCategory(subCategoryPath, dir)
      if (subCategoryInfo) {
        items.push(subCategoryInfo)
      }
    }

    if (items.length === 0) return null

    return {
      text: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      items,
      collapsible: true,
      collapsed: false
    }
  } catch {
    return null
  }
}

export function generateSidebar(): DefaultTheme.Config['sidebar'] {
  const sidebar: DefaultTheme.Config['sidebar'] = {}

  try {
    const entries = fs.readdirSync(docsDir, { withFileTypes: true })

    // Get all categories (directories at docs root level)
    const categories = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'public')
      .map(e => e.name)
      .sort()

    for (const category of categories) {
      const categoryPath = path.join(docsDir, category)
      const sidebarItem = createSidebarForCategory(categoryPath, category)
      if (sidebarItem) {
        sidebar[`/${category}/`] = [sidebarItem]
      }
    }
  } catch {
    // Error reading docs directory
  }

  return sidebar
}

export function generateNav(): DefaultTheme.Config['nav'] {
  const nav: DefaultTheme.Config['nav'] = []

  try {
    const entries = fs.readdirSync(docsDir, { withFileTypes: true })

    // Get all categories as nav items
    const categories = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'public')
      .map(e => e.name)
      .sort()

    for (const category of categories) {
      nav.push({
        text: category.charAt(0).toUpperCase() + category.slice(1),
        link: `/${category}/`,
        activeMatch: `/${category}/`
      })
    }
  } catch {
    // Error reading docs directory
  }

  return nav
}
