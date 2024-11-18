import mongoose, { Schema } from "mongoose";

const EventSchema = new Schema(
  {
    name: { type: String, required: true },
    datetime: { type: Date, required: true },
    duration: { type: Number, required: true },
    endTime: { type: Date, required: true },
    tag: { type: String, required: true },
    googleEventId: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", EventSchema);
