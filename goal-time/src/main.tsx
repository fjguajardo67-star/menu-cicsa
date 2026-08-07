import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { StoreProvider } from './lib/store'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/motion.css'
import './styles/kid.css'
import './styles/parent.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)

// Offline support. Registered after load so it never delays first paint.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI).href)
      .catch(() => {
        /* offline caching is a bonus; the app works without it */
      })
  })
}
