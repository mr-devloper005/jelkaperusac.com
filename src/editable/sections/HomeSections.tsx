import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, Bookmark, BookOpen, Compass, ExternalLink, Flame,
  Globe, Hash, Layers, Link2, Search, Sparkles, TrendingUp,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/components/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

/* ------------------------------ data helpers ----------------------------- */
function contentOf(post?: SitePost | null) {
  return post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = contentOf(post)
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = contentOf(post)
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function rawDomain(post?: SitePost | null) {
  const content = contentOf(post)
  const url =
    (typeof content.website === 'string' && content.website) ||
    (typeof content.url === 'string' && content.url) ||
    (typeof content.link === 'string' && content.link) ||
    ''
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
}

function domainOf(post?: SitePost | null) {
  return rawDomain(post) || `${SITE_CONFIG.domain}`
}

function faviconFor(domain: string) {
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

// Topics derived from real post categories/tags, with curated fallbacks so the
// section always reads well even on a sparse feed.
function deriveTopics(posts: SitePost[], max = 8) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    const cat = categoryOf(post)
    if (cat) counts.set(cat, (counts.get(cat) || 0) + 1)
  }
  const derived = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
  const fallback = ['Design', 'Development', 'Productivity', 'Marketing', 'Tools', 'Inspiration', 'Reading', 'Reference']
    .map((name) => ({ name, count: 0 }))
  const merged = [...derived]
  for (const item of fallback) {
    if (merged.length >= max) break
    if (!merged.some((m) => m.name.toLowerCase() === item.name.toLowerCase())) merged.push(item)
  }
  return merged.slice(0, max)
}

/* ------------------------------ favicon chip ----------------------------- */
function SourceMark({ post, size = 'h-10 w-10' }: { post: SitePost; size?: string }) {
  const domain = domainOf(post)
  const favicon = faviconFor(domain)
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]`}>
      {favicon ? (
        <img src={favicon} alt="" className="h-5 w-5 object-contain" loading="lazy" />
      ) : (
        <Globe className="h-5 w-5 text-[var(--slot4-accent)]" />
      )}
    </span>
  )
}

/* ================================ HERO =================================== */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const featured = pool[0]
  const heroImage = featured ? getEditablePostImage(featured) : ''
  const hero = pagesContent.home.hero
  const heroTitle = hero.title || ['Save the links', 'worth keeping.']
  const topics = deriveTopics(pool, 5)

  const resourceCount = pool.length
  const topicCount = new Set(pool.map((p) => categoryOf(p)).filter(Boolean)).size

  const stats = [
    { value: resourceCount ? `${resourceCount}+` : '500+', label: 'Resources curated' },
    { value: topicCount ? `${topicCount}+` : '40+', label: 'Topics covered' },
    { value: timeSections.length ? `${timeSections.length}` : '3', label: 'Live collections' },
  ]

  return (
    <section className="px-3 pt-4 sm:px-5 sm:pt-6">
      <div className="relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden rounded-[2rem] bg-[var(--slot4-ink)] text-[var(--slot4-on-ink)] sm:rounded-[2.5rem]">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[var(--slot4-accent)]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />

        <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-14 lg:py-20">
          <EditableReveal as="div">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-ink-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {hero.badge}
            </span>
            <h1 className="editable-display mt-6 text-balance text-4xl font-bold leading-[1.04] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              {heroTitle.map((line, i) => (
                <span key={line} className={i === heroTitle.length - 1 ? 'block text-[var(--slot4-accent)]' : 'block'}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-on-ink-muted)] sm:text-lg">{hero.description}</p>

            <form action="/search" className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
              <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                placeholder={hero.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
              <button className="shrink-0 rounded-full bg-[var(--slot4-accent)] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-95">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-on-ink-muted)]">Popular:</span>
              {topics.map((topic) => (
                <Link
                  key={topic.name}
                  href={`${primaryRoute}?category=${encodeURIComponent(topic.name.toLowerCase())}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </EditableReveal>

          {/* Featured bookmark visual */}
          <EditableReveal as="div" className="relative">
            {featured ? (
              <Link
                href={postHref(primaryTask, featured, primaryRoute)}
                className="group block overflow-hidden rounded-[1.75rem] bg-white text-[var(--slot4-page-text)] shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                  {heroImage ? (
                    <img src={heroImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : null}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    <Bookmark className="h-3.5 w-3.5" /> Featured
                  </span>
                </div>
                <div className="flex items-start gap-3 p-5">
                  <SourceMark post={featured} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{domainOf(featured)}</p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.01em]">{featured.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(featured, 110)}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-[1.75rem] bg-white/5 p-10 text-center text-[var(--slot4-on-ink-muted)]">
                <Bookmark className="mx-auto h-10 w-10 text-[var(--slot4-accent)]" />
                <p className="mt-4 text-sm">Freshly curated bookmarks will appear here.</p>
              </div>
            )}
          </EditableReveal>
        </div>

        {/* Stats band */}
        <div className="relative border-t border-white/10 px-6 py-7 sm:px-10 lg:px-14">
          <div className="grid grid-cols-3 gap-4 text-center sm:max-w-xl sm:text-left">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="editable-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-[var(--slot4-on-ink-muted)] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================ BROWSE BY TOPIC ============================ */
const topicIcons = [Hash, Compass, Layers, BookOpen, Sparkles, TrendingUp, Globe, Link2]

export function EditableStoryRail({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const topics = deriveTopics(pool, 8)
  if (!topics.length) return null

  return (
    <section className={`${container} py-14 sm:py-20`}>
      <EditableReveal as="div" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Explore</p>
          <h2 className="editable-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Browse by topic</h2>
          <p className="mt-2 max-w-xl text-[var(--slot4-muted-text)]">Jump straight into the collections you care about.</p>
        </div>
        <Link href={primaryRoute} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
          All bookmarks <ArrowRight className="h-4 w-4" />
        </Link>
      </EditableReveal>

      <EditableReveal as="div" stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic, index) => {
          const Icon = topicIcons[index % topicIcons.length]
          return (
            <Link
              key={topic.name}
              href={`${primaryRoute}?category=${encodeURIComponent(topic.name.toLowerCase())}`}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--slot4-accent)]/40 hover:shadow-[0_18px_40px_rgba(11,26,77,0.10)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)] transition group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">{topic.name}</p>
                <p className="text-xs font-medium text-[var(--slot4-muted-text)]">
                  {topic.count ? `${topic.count} saved` : 'Explore collection'}
                </p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-accent)]" />
            </Link>
          )
        })}
      </EditableReveal>
    </section>
  )
}

/* =================== FEATURED COLLECTION + POPULAR LIST =================== */
function PopularRow({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition hover:border-[var(--editable-border)] hover:bg-[var(--slot4-surface-bg)]">
      <span className="editable-display mt-0.5 w-7 shrink-0 text-xl font-bold text-[var(--slot4-soft-muted-text)]">{String(index + 1).padStart(2, '0')}</span>
      <SourceMark post={post} size="h-10 w-10" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--slot4-accent)]">{domainOf(post)}</p>
        <h3 className="mt-0.5 line-clamp-2 font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
      </div>
      <ArrowUpRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-accent)]" />
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null
  const featured = pool[0]
  const popular = pool.slice(1, 6)
  const featuredImage = getEditablePostImage(featured)

  return (
    <section className="bg-[var(--slot4-surface-bg)]">
      <div className={`${container} py-14 sm:py-20`}>
        <EditableReveal as="div" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
              <Flame className="h-4 w-4" /> Popular this week
            </p>
            <h2 className="editable-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The resources everyone’s saving</h2>
          </div>
          <Link href={primaryRoute} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="mt-9 grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Featured collection card */}
          <EditableReveal as="div">
            <Link
              href={postHref(primaryTask, featured, primaryRoute)}
              className="group block overflow-hidden rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] shadow-[0_18px_50px_rgba(11,26,77,0.08)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_70px_rgba(11,26,77,0.14)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                {featuredImage ? (
                  <img src={featuredImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(10,22,64,0.78))]" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-6">
                  <SourceMark post={featured} size="h-11 w-11" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/80">{domainOf(featured)}</p>
                    <h3 className="editable-display mt-1 line-clamp-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-white">{featured.title}</h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <p className="line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(featured, 150)}</p>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[var(--slot4-accent)]">Open <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          </EditableReveal>

          {/* Popular list */}
          <EditableReveal as="div" stagger className="grid gap-1">
            {popular.map((post, index) => (
              <PopularRow key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* =================== BOOKMARK CARD GRID (time sections) =================== */
function BookmarkCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 transition duration-300 hover:-translate-y-1.5 hover:border-[var(--slot4-accent)]/30 hover:shadow-[0_22px_50px_rgba(11,26,77,0.12)]"
    >
      <div className="flex items-start gap-3">
        <SourceMark post={post} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--slot4-accent)]">{domainOf(post)}</p>
          {category ? <span className="mt-1 inline-block rounded-full bg-[var(--slot4-panel-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--slot4-muted-text)]">{category}</span> : null}
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)] transition group-hover:text-[var(--slot4-accent)]" />
      </div>
      <h3 className="mt-4 line-clamp-2 font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 130)}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)]">
        Open resource <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'Latest saves' },
  browse: { eyebrow: 'Deep collection', title: 'Browse the library' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={index % 2 === 0 ? '' : 'bg-[var(--slot4-surface-bg)]'}>
            <div className={`${container} py-14 sm:py-18`}>
              <EditableReveal as="div" className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </EditableReveal>
              <EditableReveal as="div" stagger className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <BookmarkCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                ))}
              </EditableReveal>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ================================= CTA ================================== */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="scroll-mt-24 px-3 py-10 sm:px-5 sm:py-14">
      <div className="relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden rounded-[2rem] bg-[var(--slot4-ink)] px-6 py-14 text-center text-[var(--slot4-on-ink)] sm:rounded-[2.5rem] sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[var(--slot4-accent)]/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-[110px]" />
        <EditableReveal as="div" className="relative mx-auto flex max-w-2xl flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-ink-muted)]">
            <Bookmark className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {cta.badge}
          </span>
          <h2 className="editable-display mt-6 text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl lg:text-5xl">{cta.title}</h2>
          <p className="mt-4 max-w-xl text-base text-[var(--slot4-on-ink-muted)] sm:text-lg">{cta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={cta.primaryCta.href} className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3.5 text-sm font-bold text-white transition hover:brightness-95 active:scale-[0.98]">
              {cta.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={cta.secondaryCta.href} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              {cta.secondaryCta.label}
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
