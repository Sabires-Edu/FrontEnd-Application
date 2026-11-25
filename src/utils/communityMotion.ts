import '../styles/community-motion.css'

const buttonSelector = [
  '.feed-primary',
  '.feed-connect',
  '.feed-icon-button',
  '.feed-collapse',
  '.community-outline-link',
  '.community-chat-item',
  '.feed-sidebar nav :is(a, button)',
  '.feed-top-nav > :is(a, button)',
  '.feed-post-actions button',
  ':is(.feed-filter-bar, .profile-tabs, .community-tabs, .community-chat-filters) button',
].join(', ')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const clickAnimations = new WeakMap<HTMLElement, Animation>()

function playButtonRebound(event: MouseEvent) {
  if (reducedMotion.matches || event.button !== 0 || !(event.target instanceof Element)) return

  const button = event.target.closest(buttonSelector)
  if (!(button instanceof HTMLElement) || !button.closest('.sabires-feed')) return
  if (button.matches(':disabled, [aria-disabled="true"]')) return

  clickAnimations.get(button)?.cancel()

  // Use the independent scale property so the hover lift can finish separately.
  const animation = button.animate([
    { scale: '1.025 .88', offset: 0, easing: 'ease-out' },
    { scale: '.98 1.11', offset: .42, easing: 'ease-in-out' },
    { scale: '1.015 .98', offset: .73, easing: 'ease-out' },
    { scale: '1', offset: 1 },
  ], { duration: 350 })

  clickAnimations.set(button, animation)
}

document.addEventListener('click', playButtonRebound, true)

import.meta.hot?.dispose(() => {
  document.removeEventListener('click', playButtonRebound, true)
})
