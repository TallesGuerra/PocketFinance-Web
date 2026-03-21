const CACHE_NAME = 'pocketfinance-v2'
const STATIC_ASSETS = [
  '/',
  '/transacoes',
  '/orcamentos',
  '/categorias',
  '/recorrentes',
  '/manifest.json',
  '/pocketFinance_icon.svg',
]

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ─── Activate ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── Fetch (cache-first for static, network-first for API) ─
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || network
    })
  )
})

// ─── Push Notifications ────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'PocketFinance'
  const options = {
    body: data.body ?? '',
    icon: '/pocketFinance_icon.svg',
    badge: '/pocketFinance_icon.svg',
    tag: data.tag ?? 'pocketfinance',
    data: data.url ? { url: data.url } : {},
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction ?? false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})

// ─── Background Sync (budget check) ───────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'budget-check') {
    event.waitUntil(checkBudgetAlerts())
  }
})

async function checkBudgetAlerts() {
  // Notificações locais guardadas pelo app são lidas aqui
  try {
    const cache = await caches.open('budget-alerts')
    const response = await cache.match('/budget-alerts-data')
    if (!response) return
    const alerts = await response.json()
    for (const alert of alerts) {
      await self.registration.showNotification('⚠️ ' + alert.title, {
        body: alert.body,
        icon: '/pocketFinance_icon.svg',
        tag: 'budget-' + alert.categoryId,
      })
    }
    await cache.delete('/budget-alerts-data')
  } catch {}
}
