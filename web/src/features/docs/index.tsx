/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState, useMemo, useCallback } from 'react'
import { BookOpen, ChevronRight, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Markdown } from '@/components/ui/markdown'
import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getDocsContent, type DocCategory } from './content'

function DocsSidebar(props: {
  categories: DocCategory[]
  activeSection: string
  onSelect: (sectionId: string) => void
  onClose?: () => void
}) {
  const { t } = useTranslation()

  return (
    <nav className='flex h-full flex-col'>
      <div className='border-border/60 flex items-center justify-between border-b px-4 py-3'>
        <span className='flex items-center gap-2 text-sm font-semibold'>
          <BookOpen className='text-muted-foreground size-4' />
          {t('Docs')}
        </span>
        {props.onClose && (
          <Button
            variant='ghost'
            size='icon'
            className='size-7 md:hidden'
            onClick={props.onClose}
          >
            <X className='size-4' />
          </Button>
        )}
      </div>
      <ScrollArea className='flex-1'>
        <div className='space-y-1 p-3'>
          {props.categories.map((cat) => (
            <div key={cat.id}>
              <div className='text-muted-foreground/70 px-2 pt-3 pb-1.5 text-xs font-medium uppercase'>
                {cat.title}
              </div>
              {cat.sections.map((section) => (
                <button
                  key={section.id}
                  type='button'
                  onClick={() => {
                    props.onSelect(section.id)
                    props.onClose?.()
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    props.activeSection === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <ChevronRight
                    className={cn(
                      'size-3.5 shrink-0 transition-transform',
                      props.activeSection === section.id && 'rotate-90'
                    )}
                  />
                  <span className='truncate'>{section.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </nav>
  )
}

function DocsContent(props: {
  categories: DocCategory[]
  activeSection: string
}) {
  const currentSection = useMemo(() => {
    for (const cat of props.categories) {
      const found = cat.sections.find((s) => s.id === props.activeSection)
      if (found) return found
    }
    return props.categories[0]?.sections[0] ?? null
  }, [props.categories, props.activeSection])

  if (!currentSection) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-muted-foreground text-sm'>No content available</p>
      </div>
    )
  }

  return (
    <div className='flex-1'>
      <div id={currentSection.id} className='scroll-mt-20'>
        <h1 className='mb-6 text-2xl font-bold tracking-tight'>
          {currentSection.title}
        </h1>
        <Markdown>{currentSection.content}</Markdown>
      </div>
    </div>
  )
}

export function DocsPage() {
  const { i18n } = useTranslation()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const categories = useMemo(
    () => getDocsContent(i18n.language),
    [i18n.language]
  )

  const handleSelect = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
  }, [])

  return (
    <PublicLayout>
      <div className='mx-auto flex max-w-7xl'>
        {sidebarOpen && (
          <div className='bg-background/80 fixed inset-0 z-40 md:hidden'>
            <div className='bg-background border-border/60 fixed inset-y-0 left-0 z-50 w-72 border-r shadow-lg'>
              <DocsSidebar
                categories={categories}
                activeSection={activeSection}
                onSelect={handleSelect}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
            <div
              className='fixed inset-0 bg-black/30'
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        <aside className='border-border/60 bg-background sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r md:block'>
          <DocsSidebar
            categories={categories}
            activeSection={activeSection}
            onSelect={handleSelect}
          />
        </aside>

        <div className='border-border/60 fixed bottom-4 left-4 z-30 md:hidden'>
          <Button
            size='icon'
            className='shadow-lg'
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className='size-4' />
          </Button>
        </div>

        <main className='min-h-[calc(100vh-4rem)] flex-1 px-4 py-8 sm:px-8 lg:px-12'>
          <DocsContent
            categories={categories}
            activeSection={activeSection}
          />
        </main>
      </div>
    </PublicLayout>
  )
}
