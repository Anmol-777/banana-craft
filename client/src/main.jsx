import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles/global.css'
import App from './App.jsx'

const toastOptions = {
  duration: 3000,
  style: { background: '#5b6234', color: '#fffbf1' },
  success: {
    iconTheme: { primary: '#fffbf1', secondary: '#5b6234' },
    style: { background: '#4a5228', color: '#fffbf1' },
  },
  error: {
    iconTheme: { primary: '#fffbf1', secondary: '#c0392b' },
    style: { background: '#c0392b', color: '#fffbf1' },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={toastOptions} />
    </BrowserRouter>
  </StrictMode>,
)
