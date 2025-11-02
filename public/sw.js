self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.senderName || data.title || 'New message'
  const body = data.body || 'You have a new message'
  const url = data.url || '/dashboard'
  const icon = data.icon || '/icons/icon-192.png'
  const tag = data.tag || 'chat-msg'
  const image = data.image || data.imageUrl
  const badge = data.badge || icon // monochrome small icon
  const actions = data.actions || [
    { action: 'open', title: 'Open Chat' },
  ]
  const requireInteraction = !!data.requireInteraction
  const vibrate = data.vibrate || [100,50,100]
  const options = {
    body,
    icon,
    badge,
    image,
    actions,
    data: { url, actions },
    tag,
    requireInteraction,
    vibrate,
  }
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  const action = event.action
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})