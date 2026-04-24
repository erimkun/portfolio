import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// StrictMode kapalı — canvas animasyon döngülerinde çift-çağırma sorunu yaşatır
createRoot(document.getElementById('root')).render(<App />)
