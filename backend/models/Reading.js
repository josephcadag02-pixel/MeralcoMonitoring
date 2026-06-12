import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  reading: {
    type: Number,
    required: true
  },
  previousReading: {
    type: Number,
    required: true
  }
});

const Reading = mongoose.models.Reading || mongoose.model('Reading', readingSchema);
export default Reading;
