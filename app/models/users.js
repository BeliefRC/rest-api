const mongoose = require('mongoose')
const { Schema, model } = mongoose

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true ,select:false},
  age: { type: Number, default: 0, required: false },
})

const User = model('User', userSchema)
module.exports = {User}

