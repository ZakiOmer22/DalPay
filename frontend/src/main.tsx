import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Analytics } from '@vercel/analytics/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const showConsoleWarning =
  import.meta.env.VITE_SHOW_CONSOLE_WARNING === 'true'

  const queryClient = new QueryClient();
  
if (showConsoleWarning) {
  console.clear()

  // Big warning
  console.log(
    '%cSTOP!',
    `
      color: #ff4d4f;
      font-size: 80px;
      font-weight: 900;
      font-family: sans-serif;
    `
  )

  // Main message
  console.log(
    `%cThis is a browser feature intended for developers.

If someone told you to copy and paste something here,
it may be a scam and could compromise your account.

DalPay staff will NEVER ask you to paste code here.

Ha ku qorin wax aadan fahmin.
This is a secure government payment portal.`,
    `
      background: #111827;
      color: #ffffff;
      padding: 16px;
      font-size: 16px;
      line-height: 1.8;
      border-radius: 10px;
      font-family: monospace;
    `
  )

  // Repeated warnings like Discord
  for (let i = 0; i < 5; i++) {
    console.warn(
      '⚠️ WARNING: Do NOT paste code here unless you fully understand it.'
    )

    console.warn(
      '⚠️ Digniin: Ha ku qorin wax aadan fahmin console-ka.'
    )
  }

  // Branding
  console.log(
    '%cDalPay Government Payment Portal',
    `
      color: #10b981;
      font-size: 24px;
      font-weight: bold;
      font-family: sans-serif;
    `
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <App />
    </QueryClientProvider>
  </StrictMode>,
)