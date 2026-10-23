import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme/theme.css'
import { App } from './ui/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
