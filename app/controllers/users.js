const jsonwebtoken = require('jsonwebtoken')
const { User } = require('../models/users')
const { secret } = require('../config')

class UsersCtl {
  async find (ctx) {
    ctx.body = await User.find()
  }

  async findById (ctx) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, `user isn't existed`)
    } else {
      ctx.body = user
    }
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
      age: { type: 'number', required: false },
    })
    const { name } = ctx.request.body
    const repeatUser = await User.findOne({ name })
    if (repeatUser) {
      ctx.throw(409, 'Username is already registered')
    }
    ctx.body = await new User(ctx.request.body).save()
  }

  async checkOwner (ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, 'no power')
    }
    await next()
  }

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      age: { type: 'number', required: false },
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
    if (!user) {
      ctx.throw(404, `user isn't existed`)
    } else {
      ctx.body = user
    }
  }

  async delete (ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, `user isn't existed`)
    } else {
      ctx.status = 204
    }
  }

  async login (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, 'Username or password is incorrect')
    } else {
      const { _id, name } = user
      const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
      ctx.body = { token }
    }
  }
}

module.exports = new UsersCtl()
