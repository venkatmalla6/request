import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { InvitationExperience } from './invitation/InvitationExperience.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Cinematic Invitation Experience is now the default root */}
        <Route path="/" element={<InvitationExperience />} />

        {/* Existing Heart Text Animator moved to /animator */}
        <Route path="/animator" element={<App />} />

        {/* Fallback to invitation */}
        <Route path="*" element={<InvitationExperience />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
