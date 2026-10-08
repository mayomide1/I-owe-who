const mongoose = require("mongoose")

const personSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        amount: {
            type: Number,
            default: 0
        },
        notifications: {
            type: Array,
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Person", personSchema);