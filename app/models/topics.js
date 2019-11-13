const mongoose = require('mongoose')

const { Schema, model } = mongoose

const topicSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  avatar_url: { type: String },
  introduction: { type: String, select: false },
}, { timestamps: true })
const Topic = model('Topic', topicSchema)
module.exports = { Topic }
