const mongoose = require('mongoose')

const { Schema } = mongoose
const answerSchema = new Schema({
  __v: { type: Number, select: false },
  content: { type: String, required: true },
  answerer: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
  questionId: { type: String, required: true },
  voteCount: { type: Number, required: true, default: 0 },
}, { timestamps: true })
const Answer = mongoose.model('Answer', answerSchema)
module.exports = Answer
