const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    amount: Number,
    note: String,
    label: String,
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-CA"),
    },
  },
  { _id: true, timestamps: true },
);

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    notifications: { type: [notificationSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Person", personSchema);
