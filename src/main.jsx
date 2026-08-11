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
        {/* Existing Heart Text Animator */}
        <Route path="/" element={<App />} />

        {/* Cinematic Invitation Experience */}
        <Route path="/invitation" element={<InvitationExperience />} />

        {/* Fallback to main app */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
