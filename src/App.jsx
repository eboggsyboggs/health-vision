import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import CompassApp from './components/CompassApp'
import { trackEvent } from './lib/posthog'

function App() {
  const [started, setStarted] = useState(false)

  const handleStart = () => {
    trackEvent('journey_started')
    setStarted(true)
  }

  const handleBack = () => {
    trackEvent('journey_exited')
    setStarted(false)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {!started ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <CompassApp onBack={handleBack} />
      )}
    </div>
  )
}

export default App
