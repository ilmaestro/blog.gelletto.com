import { useCallback, useEffect, useRef, useState } from 'react'
import SiteMenu from '../components/SiteMenu'
import './puppies.css'

const API = 'https://dog.ceo/api/breeds/image/random/12'

export default function PuppiesPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async function loadMoreInternal() {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { status: string; message: string[] }
      if (data.status !== 'success') throw new Error('Unexpected API response')
      setImages((prev) => {
        const next = [...prev, ...data.message]
        // After adding images, check if page is still not scrollable
        setTimeout(() => {
          if (document.documentElement.scrollHeight <= window.innerHeight + 100) {
            loadMoreInternal()
          }
        }, 0)
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load puppies')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '600px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="puppies-page">
      <SiteMenu />
      <header className="puppies-header">
        <h1>Puppies 🐶</h1>
        <p>
          An endless stream of good dogs, courtesy of{' '}
          <a href="https://dog.ceo/dog-api/" target="_blank" rel="noreferrer">
            dog.ceo
          </a>
          .
        </p>
      </header>
      <div className="puppies-grid">
        {images.map((src, i) => (
          <img key={`${src}-${i}`} src={src} alt="A puppy" loading="lazy" />
        ))}
      </div>
      {error && (
        <div className="puppies-status">
          <p>Couldn't fetch more puppies: {error}</p>
          <button onClick={loadMore}>Try again</button>
        </div>
      )}
      {loading && <div className="puppies-status">Fetching more puppies…</div>}
      <div ref={sentinelRef} aria-hidden="true" />
      {showTopBtn && (
        <button className="puppies-back-to-top" onClick={scrollToTop} aria-label="Back to top">
          ↑
        </button>
      )}
    </div>
  )
}
