const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  city: String,
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// Static method to get avg rating and update vehicle
ReviewSchema.statics.getAverageRating = async function (vehicleId) {
  const obj = await this.aggregate([
    {
      $match: { vehicle: vehicleId }
    },
    {
      $group: {
        _id: '$vehicle',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Vehicle').findByIdAndUpdate(vehicleId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewCount: obj[0].reviewCount
      });
    } else {
      await mongoose.model('Vehicle').findByIdAndUpdate(vehicleId, {
        rating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    console.error('Error updating vehicle rating:', err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.vehicle);
});

// Call getAverageRating before remove
ReviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.vehicle);
});

module.exports = mongoose.model('Review', ReviewSchema);
