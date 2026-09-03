export default defineNuxtPlugin((nuxtApp) => {
  let dispose = () => {}

  function initialise() {
    dispose()
    if (useRoute().path !== '/') return

    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const canSmooth = !reducedMotion && !coarsePointer
    const cleanups = []
    const observers = []
    let frameId = 0
    let current = window.scrollY
    let target = current
    const recentWrites = []
    let mouseX = 0
    let mouseY = 0
    let heroX = 0
    let heroY = 0

    root.classList.add('js-scroll-effects')

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight)
    const listen = (element, type, handler, options) => {
      element.addEventListener(type, handler, options)
      cleanups.push(() => element.removeEventListener(type, handler, options))
    }

    function setTarget(value, immediate = false) {
      target = clamp(value, 0, maxScroll())
      if (immediate || !canSmooth) {
        current = target
        recentWrites.push(Math.round(target))
        window.scrollTo(0, target)
      }
    }

    if (canSmooth) {
      listen(window, 'wheel', (event) => {
        if (event.ctrlKey || event.defaultPrevented) return
        event.preventDefault()
        const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
        setTarget(target + event.deltaY * multiplier)
      }, { passive: false })

      listen(window, 'keydown', (event) => {
        if (event.defaultPrevented || document.activeElement?.matches('input, textarea, select, [contenteditable]')) return
        const page = window.innerHeight * 0.88
        const amounts = { ArrowDown: 90, ArrowUp: -90, PageDown: page, PageUp: -page, ' ': event.shiftKey ? -page : page }
        if (event.key === 'Home') setTarget(0)
        else if (event.key === 'End') setTarget(maxScroll())
        else if (event.key in amounts) setTarget(target + amounts[event.key])
        else return
        event.preventDefault()
      })

      listen(window, 'scroll', () => {
        const observed = window.scrollY
        const writtenByEngine = recentWrites.some(value => Math.abs(observed - value) <= 2)
        if (writtenByEngine) return
        current = observed
        target = observed
        recentWrites.length = 0
      }, { passive: true })
    }

    listen(document, 'click', (event) => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return
      const destination = document.querySelector(link.getAttribute('href'))
      if (!destination) return
      event.preventDefault()
      setTarget(destination.getBoundingClientRect().top + window.scrollY)
      history.replaceState(null, '', link.hash)
    })

    let progress = document.querySelector('[data-scroll-progress]')
    if (!progress) {
      progress = document.createElement('div')
      progress.className = 'scroll-progress-line'
      progress.dataset.scrollProgress = ''
      progress.setAttribute('aria-hidden', 'true')
      document.body.appendChild(progress)
      cleanups.push(() => progress.remove())
    }

    const hero = document.querySelector('.hero')
    const heroImage = hero?.querySelector('.hero-image')
    const heroLayers = hero ? [...hero.querySelectorAll('.hero-copy, .quick-booking')] : []
    const parallaxItems = [
      { element: document.querySelector('.route-map'), speed: 0.055 },
      { element: document.querySelector('.luxury-drive-image'), speed: 0.045 },
      { element: document.querySelector('.arrival-content'), speed: 0.035 }
    ].filter(item => item.element)

    if (hero && canSmooth) {
      listen(hero, 'mousemove', (event) => {
        const rect = hero.getBoundingClientRect()
        mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
        mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      })
      listen(hero, 'mouseleave', () => { mouseX = 0; mouseY = 0 })
    }

    const revealItems = document.querySelectorAll('.journey-intro, .luxury-drive, .road-story, .fleet-section, .safety-section, .process-section, .arrival-section')
    const staggerGroups = document.querySelectorAll('.story-grid, .evidence-list, .process-track')

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(item => item.classList.add('in'))
      staggerGroups.forEach(group => [...group.children].forEach(item => item.classList.add('in')))
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('in')
          revealObserver.unobserve(entry.target)
        })
      }, { threshold: 0.2 })
      revealItems.forEach(item => { item.classList.add('scroll-reveal'); revealObserver.observe(item) })
      observers.push(revealObserver)

      staggerGroups.forEach((group) => {
        const items = [...group.children]
        items.forEach(item => item.classList.add('stagger-reveal-item'))
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry?.isIntersecting) return
          items.forEach((item, index) => window.setTimeout(() => item.classList.add('in'), index * 90))
          observer.disconnect()
        }, { threshold: 0.2 })
        observer.observe(group)
        observers.push(observer)
      })
    }

    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    if ('IntersectionObserver' in window) {
      const chapterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`))
        })
      }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 })
      navLinks.forEach((link) => {
        const section = document.querySelector(link.hash)
        if (section) chapterObserver.observe(section)
      })
      observers.push(chapterObserver)
    }

    function updateEffects() {
      if (canSmooth) {
        target = clamp(target, 0, maxScroll())
        current += (target - current) * 0.09
        if (Math.abs(target - current) < 0.1) current = target
        recentWrites.push(Math.round(current))
        if (recentWrites.length > 24) recentWrites.shift()
        window.scrollTo(0, current)
      }

      const maximum = maxScroll()
      progress.style.transform = `scaleX(${maximum ? clamp(window.scrollY / maximum, 0, 1) : 0})`

      if (!reducedMotion) {
        const viewportCenter = window.innerHeight * 0.5
        parallaxItems.forEach(({ element, speed }) => {
          const rect = element.getBoundingClientRect()
          if (rect.bottom < -250 || rect.top > window.innerHeight + 250) return
          const offset = clamp((viewportCenter - (rect.top + rect.height * 0.5)) * speed, -110, 110)
          element.style.setProperty('--scroll-parallax-y', `${offset.toFixed(2)}px`)
        })

        heroX += (mouseX - heroX) * 0.08
        heroY += (mouseY - heroY) * 0.08
        if (heroImage) {
          const heroRect = hero.getBoundingClientRect()
          const scrollOffset = clamp((window.innerHeight * 0.45 - (heroRect.top + heroRect.height * 0.45)) * 0.1, -45, 75)
          heroImage.style.translate = `${(heroX * 14).toFixed(2)}px ${(scrollOffset + heroY * 9).toFixed(2)}px`
          heroImage.style.rotate = `${(heroX * 0.35).toFixed(2)}deg`
        }
        heroLayers.forEach((layer, index) => {
          const depth = index + 1
          layer.style.translate = `${(heroX * depth * 2.4).toFixed(2)}px ${(heroY * depth * 1.7).toFixed(2)}px`
        })
      }

      frameId = requestAnimationFrame(updateEffects)
    }

    frameId = requestAnimationFrame(updateEffects)
    listen(window, 'resize', () => setTarget(window.scrollY, true), { passive: true })

    dispose = () => {
      cancelAnimationFrame(frameId)
      cleanups.forEach(cleanup => cleanup())
      observers.forEach(observer => observer.disconnect())
      root.classList.remove('js-scroll-effects')
      ;[heroImage, ...heroLayers, ...parallaxItems.map(item => item.element)].filter(Boolean).forEach((element) => {
        element.style.translate = ''
        element.style.rotate = ''
        element.style.removeProperty('--scroll-parallax-y')
      })
    }
  }

  nuxtApp.hook('app:mounted', initialise)
  nuxtApp.hook('page:finish', initialise)
})
