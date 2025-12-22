/**
 * Format an array of day names into a readable string
 * Handles special cases: weekdays, weekends, and sorted individual days
 * @param {string[]} days - Array of day names (e.g., ['Monday', 'Tuesday'])
 * @returns {string} Formatted day string
 */
export const formatDaysDisplay = (days) => {
  if (!days || days.length === 0) return 'Not set'

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const weekends = ['Saturday', 'Sunday']
  const allDays = [...weekdays, ...weekends]

  // Sort days in proper order
  const sortedDays = [...days].sort((a, b) => {
    return allDays.indexOf(a) - allDays.indexOf(b)
  })

  // Check if all weekdays are selected
  const hasAllWeekdays = weekdays.every(day => sortedDays.includes(day))
  
  // Check if all weekends are selected
  const hasAllWeekends = weekends.every(day => sortedDays.includes(day))

  // All 7 days
  if (sortedDays.length === 7) {
    return 'Every day'
  }

  // All weekdays only
  if (hasAllWeekdays && sortedDays.length === 5) {
    return 'Weekdays'
  }

  // All weekends only
  if (hasAllWeekends && sortedDays.length === 2) {
    return 'Weekends'
  }

  // Weekdays + one weekend day
  if (hasAllWeekdays && sortedDays.length === 6) {
    const extraDay = sortedDays.find(day => !weekdays.includes(day))
    return `Weekdays and ${extraDay}`
  }

  // Weekends + some weekdays
  if (hasAllWeekends && sortedDays.length > 2 && sortedDays.length < 7) {
    const weekdayList = sortedDays.filter(day => weekdays.includes(day))
    if (weekdayList.length === 1) {
      return `Weekends and ${weekdayList[0]}`
    }
    return `Weekends and ${formatDaysList(weekdayList)}`
  }

  // Default: list individual days
  return formatDaysList(sortedDays)
}

/**
 * Format a list of days with proper grammar
 * @param {string[]} days - Sorted array of day names
 * @returns {string} Formatted list (e.g., "Mon, Wed, and Fri")
 */
const formatDaysList = (days) => {
  if (days.length === 1) {
    return days[0]
  } else if (days.length === 2) {
    return `${days[0]} and ${days[1]}`
  } else {
    return `${days.slice(0, -1).join(', ')}, and ${days[days.length - 1]}`
  }
}

/**
 * Convert short day names to full names
 * @param {string[]} shortDays - Array of short day names (e.g., ['Mon', 'Wed'])
 * @returns {string[]} Array of full day names
 */
export const convertShortToFullDays = (shortDays) => {
  const dayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  }
  return shortDays.map(day => dayMap[day] || day)
}
