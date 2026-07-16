/**
 * Calculates the geodetic distance between two coordinates in kilometers.
 * Uses the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // round to 2 decimal places
}

/**
 * Parses time string (HH:MM:SS) into total seconds.
 */
export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Calculates time difference in minutes between two HH:MM:SS strings,
 * accounting for potential day wrap-around (assuming the second event is after the first).
 */
export function calculateTimeDifferenceInMinutes(time1: string, time2: string): number {
  const sec1 = parseTimeToSeconds(time1);
  const sec2 = parseTimeToSeconds(time2);
  
  let diffSec = sec2 - sec1;
  if (diffSec < 0) {
    // Wrap around 24 hours
    diffSec += 24 * 3600;
  }
  
  return Math.max(0.1, Math.round((diffSec / 60) * 10) / 10); // at least 0.1 min, rounded to 1 decimal
}

/**
 * Calculates the speed in km/h required to travel a distance in a given time in minutes.
 */
export function calculateRequiredSpeed(distanceKm: number, timeMinutes: number): number {
  if (timeMinutes <= 0) return 9999;
  const hours = timeMinutes / 60;
  return Math.round((distanceKm / hours) * 10) / 10;
}

/**
 * Checks if a speed is physically impossible for standard terrestrial vehicles.
 * Threshold is typically set to 180 km/h (allowing for some speeding, but anything above is extreme).
 * For highway / city cameras, average speed limit is 80 km/h, so anything >160 km/h is highly suspect.
 */
export function isSpeedPhysicallyImpossible(speedKmh: number, threshold = 180): boolean {
  return speedKmh > threshold;
}
