import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Save, Loader2, Edit2, CheckCircle } from 'lucide-react'
import { getCurrentWeekHabits, deleteHabitsForWeek, saveHabitsForWeek } from '../services/habitService'
import { getCurrentWeekNumber, getCurrentWeekDateRange } from '../utils/weekCalculator'

export default function Habits() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [weekNumber, setWeekNumber] = useState(1)
  const [weekDateRange, setWeekDateRange] = useState('')
  const [dayCommitments, setDayCommitments] = useState({})
  const [timePreferences, setTimePreferences] = useState({})

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayMap = {
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6,
    'Sun': 0
  }

  const timeOfDayOptions = [
    { label: 'Early Morning (6-8am)', value: 'early-morning', hour: 7 },
    { label: 'Mid-Morning (8-10am)', value: 'mid-morning', hour: 9 },
    { label: 'Lunch Time (12-1pm)', value: 'lunch', hour: 12 },
    { label: 'Early Afternoon (1-3pm)', value: 'early-afternoon', hour: 14 },
    { label: 'Afternoon (3-5pm)', value: 'afternoon', hour: 16 },
    { label: 'After Work (5-7pm)', value: 'after-work', hour: 18 },
    { label: 'Before Bedtime (9-10pm)', value: 'bedtime', hour: 21 }
  ]

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    setLoading(true)
    const week = getCurrentWeekNumber()
    const dateRange = getCurrentWeekDateRange()
    setWeekNumber(week)
    setWeekDateRange(dateRange)

    const { success, data } = await getCurrentWeekHabits()
    if (success && data && data.length > 0) {
      setHabits(data)
      
      // Group habits by habit name and extract day/time info
      const habitGroups = {}
      const dayCommits = {}
      const timePrefs = {}
      
      data.forEach(habit => {
        if (!habitGroups[habit.habit_name]) {
          habitGroups[habit.habit_name] = []
        }
        habitGroups[habit.habit_name].push(habit)
      })

      // Convert to format for display
      Object.entries(habitGroups).forEach(([habitName, habitList], index) => {
        const selectedDays = habitList.map(h => {
          const dayName = Object.keys(dayMap).find(key => dayMap[key] === h.day_of_week)
          return dayName
        }).filter(Boolean)
        
        dayCommits[index] = selectedDays

        // Get time preference from first habit
        if (habitList[0]?.reminder_time) {
          const time = habitList[0].reminder_time
          const [hours] = time.split(':')
          const hour = parseInt(hours)
          
          // Find matching time slot
          const matchingSlot = timeOfDayOptions.find(opt => opt.hour === hour)
          timePrefs[index] = matchingSlot?.value || 'mid-morning'
        } else {
          timePrefs[index] = 'mid-morning'
        }
      })

      setDayCommitments(dayCommits)
      setTimePreferences(timePrefs)
    }
    setLoading(false)
  }

  const toggleDayCommitment = (habitIndex, day) => {
    setDayCommitments(prev => {
      const current = prev[habitIndex] || []
      const updated = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
      return { ...prev, [habitIndex]: updated }
    })
  }

  const handleTimePreferenceChange = (habitIndex, value) => {
    setTimePreferences(prev => ({
      ...prev,
      [habitIndex]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Delete existing habits for this week
      await deleteHabitsForWeek(weekNumber)

      // Get unique habit names
      const habitGroups = {}
      habits.forEach(habit => {
        if (!habitGroups[habit.habit_name]) {
          habitGroups[habit.habit_name] = habit
        }
      })

      const uniqueHabitNames = Object.keys(habitGroups)

      // Create new habits array based on selections
      const newHabits = []
      uniqueHabitNames.forEach((habitName, index) => {
        const selectedDays = dayCommitments[index] || []
        const timeSlot = timePreferences[index] || 'mid-morning'
        const timeOption = timeOfDayOptions.find(opt => opt.value === timeSlot)
        const reminderTime = `${String(timeOption.hour).padStart(2, '0')}:00:00`

        selectedDays.forEach(day => {
          newHabits.push({
            habit_name: habitName,
            day_of_week: dayMap[day],
            reminder_time: reminderTime,
            timezone: 'America/Chicago'
          })
        })
      })

      // Save new habits
      const { success } = await saveHabitsForWeek(weekNumber, newHabits)
      
      if (success) {
        await loadHabits()
        setIsEditing(false)
      } else {
        alert('Failed to save habits. Please try again.')
      }
    } catch (error) {
      console.error('Error saving habits:', error)
      alert('Failed to save habits. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadHabits() // Reload to reset changes
  }

  // Group habits by name for display
  const getGroupedHabits = () => {
    const groups = {}
    habits.forEach(habit => {
      if (!groups[habit.habit_name]) {
        groups[habit.habit_name] = []
      }
      groups[habit.habit_name].push(habit)
    })
    return Object.entries(groups)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center">
        <p className="text-stone-600">Loading habits...</p>
      </div>
    )
  }

  const groupedHabits = getGroupedHabits()

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            
            {!isEditing && groupedHabits.length > 0 && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Habits
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Weekly Habits</h1>
          <p className="text-stone-600">
            Week {weekNumber} ({weekDateRange})
          </p>
        </div>

        {groupedHabits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Target className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">
              No Habits Set for This Week
            </h2>
            <p className="text-stone-600 mb-6">
              Create your vision and build your habit plan to get started.
            </p>
            <button
              onClick={() => navigate('/vision')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Create Your Plan
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Habit Experiments</h2>
                {isEditing && (
                  <p className="text-sm text-stone-600 mt-1">
                    Update your days and times, then save your changes.
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>Nice!</strong> Let's lock in when you'll try this—take a quick look at your calendar and choose days that realistically work for you.
                </p>
                <p className="text-sm text-green-800 mt-2">
                  People are far more likely to follow through when they decide <em>when</em> they'll act, not just <em>what</em> they'll do.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {groupedHabits.map(([habitName, habitList], index) => {
                const committedDays = dayCommitments[index] || []
                const timeSlot = timePreferences[index] || 'mid-morning'

                return (
                  <div key={index} className="border border-stone-200 rounded-lg p-5">
                    <p className="font-semibold text-stone-900 mb-4">{habitName}</p>
                    
                    {isEditing ? (
                      <>
                        <div className="mb-3">
                          <label className="block text-sm font-normal text-stone-900 mb-2">
                            When will you do this?
                          </label>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          {/* Day Commitment Chips */}
                          <div className="flex flex-wrap gap-2">
                            {days.map(day => (
                              <button
                                key={day}
                                onClick={() => toggleDayCommitment(index, day)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all border ${
                                  committedDays.includes(day)
                                    ? 'bg-green-50 text-green-700 border-green-600'
                                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                          
                          {/* Time of Day Selector */}
                          <div className="w-full lg:w-auto lg:flex-shrink-0">
                            <select
                              value={timeSlot}
                              onChange={(e) => handleTimePreferenceChange(index, e.target.value)}
                              className="w-full lg:min-w-[200px] px-4 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            >
                              {timeOfDayOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-stone-700">
                        <p className="mb-1">
                          <strong>Days:</strong> {committedDays.length > 0 ? committedDays.join(', ') : 'Not set'}
                        </p>
                        <p>
                          <strong>Time:</strong> {timeOfDayOptions.find(opt => opt.value === timeSlot)?.label || 'Not set'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-stone-200">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 text-stone-600 hover:text-stone-700 hover:bg-stone-100 font-semibold rounded-lg border-2 border-stone-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
