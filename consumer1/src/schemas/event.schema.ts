import { Schema, model } from 'mongoose';

const EventSchema = new Schema({
  userId: { type: String, required: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  ipAddress: { type: String, required: false },
});

export const EventModel = model('Event', EventSchema);
