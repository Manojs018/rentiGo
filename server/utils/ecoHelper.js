const Booking = require('../models/Booking');
const User = require('../models/User');

const calculateEcoStatsForBooking = (booking) => {
  // Only completed bookings count towards points/offset
  if (booking.status !== 'completed') {
    return { points: 0, co2Offset: 0, trees: 0 };
  }

  const vehicle = booking.vehicle;
  if (!vehicle) return { points: 0, co2Offset: 0, trees: 0 };

  const durationDays = booking.durationDays || 1;
  const distance = durationDays * 120; // 120 km average per day

  let pointsPerKm = 0.5; // default for petrol
  let co2SavedPerKm = 0; // grams of CO2 saved compared to petrol baseline (150g/km)

  switch (vehicle.fuelType) {
    case 'electric':
      pointsPerKm = 3.0;
      co2SavedPerKm = 150; // 150g CO2 saved per km
      break;
    case 'cng':
      pointsPerKm = 2.0;
      co2SavedPerKm = 70; // 70g CO2 saved per km (emission = 80g/km)
      break;
    case 'hybrid':
      pointsPerKm = 1.5;
      co2SavedPerKm = 60; // 60g CO2 saved per km (emission = 90g/km)
      break;
    case 'petrol':
      pointsPerKm = 0.5;
      co2SavedPerKm = 0;
      break;
    case 'diesel':
      pointsPerKm = 0.1;
      co2SavedPerKm = 0;
      break;
    default:
      pointsPerKm = 0.5;
      co2SavedPerKm = 0;
  }

  const points = Math.round(distance * pointsPerKm);
  // co2Offset in kg, rounded to 2 decimal places
  const co2Offset = Math.round((distance * co2SavedPerKm) / 10) / 100;
  // 1 tree absorbs ~20kg CO2/year. We use 20kg of saved CO2 as 1 tree equivalent
  const trees = Math.round((co2Offset / 20) * 100) / 100;

  return { points, co2Offset, trees };
};

const updateUserEcoStats = async (userId) => {
  try {
    const bookings = await Booking.find({ customer: userId, status: 'completed' })
      .populate('vehicle');

    let totalPoints = 0;
    let totalCo2Offset = 0;
    let totalTrees = 0;

    bookings.forEach(booking => {
      if (booking.vehicle) {
        const stats = calculateEcoStatsForBooking(booking);
        totalPoints += stats.points;
        totalCo2Offset += stats.co2Offset;
        totalTrees += stats.trees;
      }
    });

    // Round total offset & trees to 2 decimal places
    totalCo2Offset = Math.round(totalCo2Offset * 100) / 100;
    totalTrees = Math.round(totalTrees * 100) / 100;

    await User.findByIdAndUpdate(userId, {
      ecoPoints: totalPoints,
      co2Offset: totalCo2Offset,
      treesPlanted: totalTrees
    });

    return {
      ecoPoints: totalPoints,
      co2Offset: totalCo2Offset,
      treesPlanted: totalTrees
    };
  } catch (error) {
    console.error('Error updating user eco stats:', error);
    return null;
  }
};

const getDiscountPercentage = (points) => {
  if (points >= 3000) return 15; // 15% discount for Platinum Earth-Guardian
  if (points >= 1500) return 10; // 10% discount for Gold Eco-Hero
  if (points >= 500) return 5;   // 5% discount for Silver Eco-Explorer
  return 0;                      // 0% for Bronze
};

module.exports = {
  calculateEcoStatsForBooking,
  updateUserEcoStats,
  getDiscountPercentage
};
