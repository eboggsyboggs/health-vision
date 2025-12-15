import supabase, { isSupabaseConfigured } from '../lib/supabase'
import { trackEvent } from '../lib/posthog'

/**
 * Service for managing health journey data in Supabase
 * 
 * Database Schema (create this in Supabase):
 * 
 * Table: health_journeys
 * - id: uuid (primary key, default: gen_random_uuid())
 * - user_id: uuid (nullable, for authenticated users)
 * - session_id: text (for anonymous users)
 * - form_data: jsonb (stores all form responses)
 * - current_step: text
 * - completed: boolean (default: false)
 * - created_at: timestamp (default: now())
 * - updated_at: timestamp (default: now())
 * 
 * Enable Row Level Security (RLS):
 * - Allow users to read/write their own journeys
 * - Allow anonymous users to access by session_id
 */

// Generate a unique session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('health_journey_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('health_journey_session_id', sessionId)
  }
  return sessionId
}

/**
 * Save or update a health journey
 */
export const saveJourney = async (formData, currentStep) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Journey not saved to database.')
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const sessionId = getSessionId()
    const userId = supabase.auth.user()?.id || null

    // Check if journey exists
    const { data: existingJourney } = await supabase
      .from('health_journeys')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    let result
    if (existingJourney) {
      // Update existing journey
      result = await supabase
        .from('health_journeys')
        .update({
          form_data: formData,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
          user_id: userId,
        })
        .eq('session_id', sessionId)
        .select()
        .single()
    } else {
      // Create new journey
      result = await supabase
        .from('health_journeys')
        .insert({
          session_id: sessionId,
          user_id: userId,
          form_data: formData,
          current_step: currentStep,
          completed: false,
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving journey:', result.error)
      trackEvent('journey_save_failed', { error: result.error.message })
      return { success: false, error: result.error }
    }

    trackEvent('journey_saved', { step: currentStep })
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error in saveJourney:', error)
    trackEvent('journey_save_error', { error: error.message })
    return { success: false, error }
  }
}

/**
 * Load the current user's journey
 */
export const loadJourney = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const sessionId = getSessionId()

    const { data, error } = await supabase
      .from('health_journeys')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No journey found - this is okay
        return { success: true, data: null }
      }
      console.error('Error loading journey:', error)
      return { success: false, error }
    }

    trackEvent('journey_loaded')
    return { success: true, data }
  } catch (error) {
    console.error('Error in loadJourney:', error)
    return { success: false, error }
  }
}

/**
 * Mark journey as completed
 */
export const completeJourney = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const sessionId = getSessionId()

    const { data, error } = await supabase
      .from('health_journeys')
      .update({
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error completing journey:', error)
      return { success: false, error }
    }

    trackEvent('journey_completed')
    return { success: true, data }
  } catch (error) {
    console.error('Error in completeJourney:', error)
    return { success: false, error }
  }
}

/**
 * Delete current journey
 */
export const deleteJourney = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const sessionId = getSessionId()

    const { error } = await supabase
      .from('health_journeys')
      .delete()
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error deleting journey:', error)
      return { success: false, error }
    }

    // Clear session ID
    localStorage.removeItem('health_journey_session_id')
    
    trackEvent('journey_deleted')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteJourney:', error)
    return { success: false, error }
  }
}

/**
 * Get all journeys for the current user (if authenticated)
 */
export const getUserJourneys = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const userId = supabase.auth.user()?.id
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('health_journeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user journeys:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getUserJourneys:', error)
    return { success: false, error }
  }
}
