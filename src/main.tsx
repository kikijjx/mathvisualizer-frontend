import { createRoot } from 'react-dom/client'
import './index.css'
import { ServerProvider } from './ServerContext';

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <ServerProvider>
        <App />
    </ServerProvider>
)
