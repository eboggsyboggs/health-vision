# Architecture Overview: PostHog & Supabase Integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Health Summit App                      │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │   Landing    │  │   Compass    │              │    │
│  │  │     Page     │─▶│     App      │              │    │
│  │  └──────────────┘  └──────┬───────┘              │    │
│  │                            │                       │    │
│  │                    ┌───────▼────────┐             │    │
│  │                    │  Step Components│             │    │
│  │                    │  (Vision, Base  │             │    │
│  │                    │   Camp, etc.)   │             │    │
│  │                    └───────┬────────┘             │    │
│  │                            │                       │    │
│  └────────────────────────────┼───────────────────────┘    │
│                               │                             │
│         ┌─────────────────────┼─────────────────────┐      │
│         │                     │                     │      │
│         ▼                     ▼                     ▼      │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐│
│  │  PostHog    │      │  Supabase   │      │   Local     ││
│  │    Lib      │      │    Lib      │      │  Storage    ││
│  └──────┬──────┘      └──────┬──────┘      └─────────────┘│
│         │                    │                             │
└─────────┼────────────────────┼─────────────────────────────┘
          │                    │
          │ HTTPS              │ HTTPS
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│   PostHog Cloud  │  │  Supabase Cloud  │
│                  │  │                  │
│  • Analytics     │  │  • PostgreSQL    │
│  • Events        │  │  • Row Level     │
│  • Recordings    │  │    Security      │
│  • Dashboards    │  │  • Real-time     │
└──────────────────┘  └──────────────────┘
```

## Data Flow

### Journey Start Flow
```
User clicks "Begin Your Ascent"
         │
         ▼
App.jsx: handleStart()
         │
         ├─▶ trackEvent('journey_started') ──▶ PostHog
         │
         └─▶ setStarted(true)
                  │
                  ▼
         CompassApp renders
                  │
                  └─▶ loadJourney() ──▶ Supabase
                           │
                           └─▶ Restore saved data (if exists)
```

### Step Navigation Flow
```
User navigates to step
         │
         ▼
CompassApp: setCurrentStep()
         │
         ├─▶ trackEvent('step_viewed', { step }) ──▶ PostHog
         │
         └─▶ Trigger auto-save
                  │
                  └─▶ saveJourney(formData, step) ──▶ Supabase
```

### Form Input Flow
```
User types in form field
         │
         ▼
Step Component: onChange
         │
         └─▶ updateFormData(field, value)
                  │
                  ▼
         CompassApp: setFormData()
                  │
                  └─▶ useEffect detects change
                           │
                           └─▶ Debounce 1 second
                                    │
                                    └─▶ saveJourney() ──▶ Supabase
                                             │
                                             └─▶ trackEvent('journey_saved') ──▶ PostHog
```

## Component Hierarchy

```
App.jsx (Root)
  │
  ├─▶ LandingPage
  │     └─▶ onStart() → trackEvent('journey_started')
  │
  └─▶ CompassApp
        │
        ├─▶ useEffect: loadJourney() on mount
        ├─▶ useEffect: trackEvent('step_viewed') on step change
        ├─▶ useEffect: saveJourney() on data change (debounced)
        │
        └─▶ Step Components
              ├─▶ NorthStarStep
              ├─▶ CardinalDirectionsStep
              ├─▶ TerrainStep
              ├─▶ RouteStep
              └─▶ SummaryPage
```

## Service Layer

### PostHog Service (`src/lib/posthog.js`)
```javascript
initPostHog()
  └─▶ Initialize PostHog client with API key
  └─▶ Configure session recording
  └─▶ Enable autocapture

trackEvent(name, properties)
  └─▶ Send custom event to PostHog

identifyUser(userId, properties)
  └─▶ Link events to user profile

resetUser()
  └─▶ Clear user session
```

### Supabase Service (`src/lib/supabase.js`)
```javascript
createClient(url, key)
  └─▶ Initialize Supabase client
  └─▶ Configure auth persistence
  └─▶ Enable auto-refresh

isSupabaseConfigured()
  └─▶ Check if credentials exist
```

### Journey Service (`src/services/journeyService.js`)
```javascript
saveJourney(formData, currentStep)
  ├─▶ Get session ID (or create new)
  ├─▶ Check if journey exists
  ├─▶ Update or insert journey
  └─▶ Track save event

loadJourney()
  ├─▶ Get session ID
  ├─▶ Query Supabase for journey
  └─▶ Return form data and current step

completeJourney()
  └─▶ Mark journey as completed

deleteJourney()
  └─▶ Delete journey and clear session
```

## Database Schema

### Supabase Table: `health_journeys`
```sql
┌──────────────┬──────────────┬─────────────────────────────┐
│ Column       │ Type         │ Description                 │
├──────────────┼──────────────┼─────────────────────────────┤
│ id           │ UUID         │ Primary key                 │
│ user_id      │ UUID         │ Auth user (nullable)        │
│ session_id   │ TEXT         │ Anonymous session ID        │
│ form_data    │ JSONB        │ All form responses          │
│ current_step │ TEXT         │ Last visited step           │
│ completed    │ BOOLEAN      │ Journey completion status   │
│ created_at   │ TIMESTAMP    │ Creation time               │
│ updated_at   │ TIMESTAMP    │ Last update time            │
└──────────────┴──────────────┴─────────────────────────────┘

Indexes:
  - idx_health_journeys_session_id (session_id)
  - idx_health_journeys_user_id (user_id)
  - idx_health_journeys_created_at (created_at DESC)

Row Level Security:
  - Users can only access their own journeys
  - Anonymous access via session_id
  - Authenticated access via user_id
```

## Event Tracking

### PostHog Events
```
journey_started
  ├─▶ When: User clicks "Begin Your Ascent"
  └─▶ Properties: none

journey_exited
  ├─▶ When: User returns to landing page
  └─▶ Properties: none

step_viewed
  ├─▶ When: User navigates to a step
  └─▶ Properties: { step: string }

journey_saved
  ├─▶ When: Auto-save completes successfully
  └─▶ Properties: { step: string }

journey_loaded
  ├─▶ When: Saved journey is restored
  └─▶ Properties: none

journey_completed
  ├─▶ When: User completes all steps
  └─▶ Properties: none

journey_save_failed
  ├─▶ When: Save operation fails
  └─▶ Properties: { error: string }
```

## State Management

### Local State (React useState)
```
CompassApp
  ├─▶ currentStep: string
  └─▶ formData: object
        ├─▶ visionStatement: string
        ├─▶ feelingState: string
        ├─▶ barriers: array
        ├─▶ habitsToImprove: array
        └─▶ ... (all form fields)
```

### Persistent State
```
Browser localStorage
  └─▶ health_journey_session_id: string
        (Used to identify anonymous users)

Supabase Database
  └─▶ health_journeys table
        (Stores complete journey data)
```

## Error Handling

### PostHog Errors
```
Missing API Key
  └─▶ Console warning in dev mode
  └─▶ App continues without tracking

Network Error
  └─▶ PostHog queues events
  └─▶ Retries automatically
  └─▶ App continues normally
```

### Supabase Errors
```
Missing Credentials
  └─▶ Console warning in dev mode
  └─▶ Falls back to localStorage
  └─▶ App continues normally

Save Error
  └─▶ Log error to console
  └─▶ Track 'journey_save_failed' event
  └─▶ User can retry

Load Error
  └─▶ Log error to console
  └─▶ Start with empty form
  └─▶ App continues normally
```

## Performance Optimizations

### Debouncing
```
Form input changes
  └─▶ Wait 1 second
  └─▶ Then save to Supabase
  └─▶ Prevents excessive API calls
```

### Lazy Loading
```
PostHog
  └─▶ Loads asynchronously
  └─▶ Doesn't block app rendering

Supabase
  └─▶ Loads on demand
  └─▶ Only when configured
```

### Caching
```
Session ID
  └─▶ Stored in localStorage
  └─▶ Reused across sessions

Form Data
  └─▶ Kept in React state
  └─▶ Only synced to DB periodically
```

## Security Layers

### Frontend
```
Environment Variables
  └─▶ API keys in .env
  └─▶ Never committed to git
  └─▶ Injected at build time

Input Masking
  └─▶ PostHog masks all inputs
  └─▶ data-private attribute for extra masking
  └─▶ No PII in recordings
```

### Backend (Supabase)
```
Row Level Security
  ├─▶ Users can only access own data
  ├─▶ Policies enforce access control
  └─▶ Anonymous access via session_id

Anon Key
  ├─▶ Safe to expose in frontend
  ├─▶ Limited permissions
  └─▶ RLS enforces security
```

## Deployment Architecture

### Development
```
Local Machine
  ├─▶ npm run dev
  ├─▶ Vite dev server (port 5174)
  ├─▶ .env file for secrets
  └─▶ Console logs enabled
```

### Production
```
Hosting Platform (Vercel/Netlify/etc)
  ├─▶ npm run build
  ├─▶ Static files served via CDN
  ├─▶ Environment variables from platform
  └─▶ Console logs disabled (except errors)
```

## Monitoring & Analytics

### PostHog Dashboard
```
Real-time Events
  └─▶ See events as they happen

Funnels
  └─▶ Track journey completion rate

Session Recordings
  └─▶ Watch user interactions

Insights
  └─▶ Custom analytics queries
```

### Supabase Dashboard
```
Table Editor
  └─▶ View and edit journey data

SQL Editor
  └─▶ Run custom queries

Logs
  └─▶ Monitor API calls and errors

Database
  └─▶ Check storage and performance
```

## Integration Points

### Optional Integrations
```
OpenAI API (existing)
  └─▶ AI-enhanced action plans
  └─▶ Independent of PostHog/Supabase

PostHog (new)
  └─▶ Analytics and tracking
  └─▶ Works independently

Supabase (new)
  └─▶ Data persistence
  └─▶ Works independently

All three can work:
  ├─▶ Together (full features)
  ├─▶ Separately (partial features)
  └─▶ None (basic features)
```

## Scalability

### PostHog
```
Free Tier: 1M events/month
  └─▶ Supports ~2,000-10,000 journeys

Paid Tier: Pay-as-you-go
  └─▶ Scales automatically
  └─▶ No infrastructure management
```

### Supabase
```
Free Tier: 500MB database
  └─▶ Supports ~100,000 journeys

Paid Tier: Pay-as-you-go
  └─▶ Scales automatically
  └─▶ Connection pooling
  └─▶ Read replicas available
```

## Future Enhancements

### Potential Additions
```
User Authentication
  └─▶ Link journeys to user accounts
  └─▶ Multiple journeys per user
  └─▶ Email notifications

Real-time Sync
  └─▶ Enable Supabase real-time
  └─▶ Multi-device live updates

Advanced Analytics
  └─▶ Custom PostHog dashboards
  └─▶ A/B testing with feature flags
  └─▶ Cohort analysis

Data Export
  └─▶ Export journey data
  └─▶ Share with health coaches
  └─▶ Integration with health apps
```
