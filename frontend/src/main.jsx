import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { QuoteProvider } from './context/QuoteContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QuoteProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </QuoteProvider>
    </BrowserRouter>
  </StrictMode>
)
