const mongoose = require('mongoose')

const { Schema } = mongoose

const topicSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  avatar_url: { type: String },
  introduction: { type: String, select: false },
}, { timestamps: true })
const Topic = mongoose.model('Topic', topicSchema)
module.exports = Topic
