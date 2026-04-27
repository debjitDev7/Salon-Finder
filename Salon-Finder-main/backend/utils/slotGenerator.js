/**
 * Slot Generator Utility
 * Generates time slots based on salon's working hours
 */

/**
 * Parse time string "HH:MM" to minutes from midnight
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {number} Minutes from midnight
 */
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Convert minutes from midnight to "HH:MM" format
 * @param {number} minutes - Minutes from midnight
 * @returns {string} Time in "HH:MM" format
 */
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get day name from date
 * @param {Date} date - Date object
 * @returns {string} Day name (lowercase)
 */
const getDayName = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

/**
 * Generate slots for a specific date based on salon's working hours
 * @param {Object} salon - Salon document with workingHours
 * @param {Date} date - Date to generate slots for
 * @returns {Array} Array of slot objects
 */
const generateSlotsForDate = (salon, date) => {
    const slots = [];
    const dayName = getDayName(date);
    const dayHours = salon.workingHours[dayName];

    // Skip if salon is closed on this day
    if (!dayHours || dayHours.isClosed) {
        return slots;
    }

    const openMinutes = timeToMinutes(dayHours.open);
    const closeMinutes = timeToMinutes(dayHours.close);
    const slotDuration = salon.slotDuration || 30;

    // Generate slots from open to close
    for (let start = openMinutes; start + slotDuration <= closeMinutes; start += slotDuration) {
        slots.push({
            salon: salon._id,
            date: new Date(date.setHours(0, 0, 0, 0)), // Normalize to start of day
            startTime: minutesToTime(start),
            endTime: minutesToTime(start + slotDuration),
            isAvailable: true,
            isEnabled: true
        });
    }

    return slots;
};

/**
 * Generate slots for a date range
 * @param {Object} salon - Salon document
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of slot objects
 */
const generateSlotsForRange = (salon, startDate, endDate) => {
    const slots = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const daySlots = generateSlotsForDate(salon, new Date(currentDate));
        slots.push(...daySlots);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
};

module.exports = {
    generateSlotsForDate,
    generateSlotsForRange,
    timeToMinutes,
    minutesToTime,
    getDayName
};
