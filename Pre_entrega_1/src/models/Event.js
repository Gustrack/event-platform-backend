import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['conferencia', 'taller', 'seminario', 'networking', 'social', 'deportivo', 'cultural', 'educativo']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isVirtual: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
