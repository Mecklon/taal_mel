import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthContextProvider from './store/authContextProvider.jsx'

createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <App />
    </AuthContextProvider>
)
