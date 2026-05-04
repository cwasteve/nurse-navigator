import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RadixTooltip.Provider delayDuration={300}>
      <App />
    </RadixTooltip.Provider>
  </StrictMode>,
)
