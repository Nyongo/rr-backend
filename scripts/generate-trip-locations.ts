import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate geolocation points for a school trip
 * Creates intermediate points along a route between start and end locations
 */
async function generateTripLocations() {
  const tripId = '28b18231-d743-4d4a-96a9-cf8dbd43169d';
  
  // Coordinates for 360 Apartments Phase 1, Nairobi
  const startLat = -1.2921; // Approximate location
  const startLng = 36.8219;
  
  // Coordinates for JKIA (Jomo Kenyatta International Airport)
  const endLat = -1.3191;
  const endLng = 36.9277;
  
  // Number of points to generate
  const numberOfPoints = 50;
  
  // Generate intermediate points along a linear route
  const locations = [];
  const startTime = new Date();
  startTime.setHours(7, 0, 0, 0); // 7:00 AM start time
  
  for (let i = 0; i <= numberOfPoints; i++) {
    const progress = i / numberOfPoints; // 0 to 1
    
    // Linear interpolation between start and end
    const latitude = startLat + (endLat - startLat) * progress;
    const longitude = startLng + (endLng - startLng) * progress;
    
    // Add some realistic variation to the route
    const variation = 0.002; // Small random variation
    const finalLat = latitude + (Math.random() - 0.5) * variation;
    const finalLng = longitude + (Math.random() - 0.5) * variation;
    
    // Calculate time (assuming 45-minute trip, spread points over time)
    const tripDuration = 45 * 60 * 1000; // 45 minutes in milliseconds
    const timestamp = new Date(startTime.getTime() + tripDuration * progress);
    
    // Calculate speed (faster in the middle, slower at start/end)
    // Average speed around 50-60 km/h, slower at start/end
    const speedVariation = Math.sin(progress * Math.PI); // 0 at ends, 1 in middle
    const speed = 30 + speedVariation * 40; // 30-70 km/h
    
    // Heading (direction from current to next point)
    const heading = (Math.atan2(endLng - startLng, endLat - startLat) * 180) / Math.PI;
    
    // GPS accuracy (better on highways, worse in city)
    const accuracy = 10 + (1 - speedVariation) * 20; // 10-30 meters
    
    locations.push({
      tripId,
      latitude: finalLat,
      longitude: finalLng,
      timestamp,
      speed: Math.round(speed * 10) / 10,
      heading: Math.round(heading),
      accuracy: Math.round(accuracy * 10) / 10,
    });
  }
  
  try {
    // Check if trip exists
    const trip = await prisma.schoolTrip.findUnique({
      where: { id: tripId },
    });
    
    if (!trip) {
      console.error(`Trip with ID ${tripId} not found`);
      process.exit(1);
    }
    
    console.log(`Found trip: ${trip.id}`);
    console.log(`Status: ${trip.status}`);
    console.log(`Generating ${locations.length} location points...`);
    
    // Insert locations in batches to avoid overwhelming the database
    const batchSize = 20;
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      await prisma.schoolTripLocation.createMany({
        data: batch,
        skipDuplicates: true,
      });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(locations.length / batchSize)}`);
    }
    
    console.log(`\n✅ Successfully generated ${locations.length} location points for trip ${tripId}`);
    console.log(`📍 Route: 360 Apartments Phase 1 → JKIA`);
    console.log(`⏱️  Duration: ${(numberOfPoints * 0.9 / 60).toFixed(1)} minutes (simulated)`);
    
  } catch (error) {
    console.error('Error generating locations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateTripLocations();

