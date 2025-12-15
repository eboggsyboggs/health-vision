import posthog from 'posthog-js'

// Initialize PostHog
export const initPostHog = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (apiKey) {
    posthog.init(apiKey, {
      api_host: apiHost,
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true, // Automatically capture pageviews
      capture_pageleave: true, // Capture when users leave
      autocapture: true, // Automatically capture clicks and interactions
      session_recording: {
        enabled: true, // Enable session recordings
        maskAllInputs: true, // Mask sensitive input fields
        maskTextSelector: '[data-private]', // Mask elements with data-private attribute
      },
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('PostHog initialized successfully')
        }
      },
    })
  } else if (import.meta.env.DEV) {
    console.warn('PostHog API key not found. Analytics will not be tracked.')
  }
}

// Track custom events
export const trackEvent = (eventName, properties = {}) => {
  if (posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

// Identify user (call this when you have user info)
export const identifyUser = (userId, properties = {}) => {
  if (posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

// Reset user session (call on logout)
export const resetUser = () => {
  if (posthog.__loaded) {
    posthog.reset()
  }
}

export default posthog
