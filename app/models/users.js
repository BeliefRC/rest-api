const mongoose = require('mongoose')
const { Schema, model } = mongoose

const userSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, default: 0, required: false },
})

const userModel = model('User', userSchema)
module.exports = userModel
