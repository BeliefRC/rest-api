const jsonwebtoken = require('jsonwebtoken')
const { User } = require('../models/users')
const { secret } = require('../config/baseConfig')

class UsersCtl {
  async find (ctx) {
    let { pageSize = 10 } = ctx.query
    const pageNum = Math.max(ctx.query.pageNum, 1) - 1
    pageSize = Math.max(pageSize, 1)
    ctx.body = await User.find()
      .find({ name: new RegExp(ctx.query.q) })
      .limit(pageSize).skip(pageNum * pageSize)
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('')
    const user = await User.findById(ctx.params.id).select(selectFields)
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

  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user.following
  }

  async listFollowers (ctx) {
    ctx.body = await User.find({ following: ctx.params.id })
  }

  async follow (ctx) {
    const followId = ctx.params.id
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(id => id.toString()).includes(followId)) {
      me.following.push(followId)
      me.save()
      ctx.status = 204
    } else {
      ctx.throw(409, 'You are already following this user')
    }
  }

  async unFollow (ctx) {
    const followId = ctx.params.id
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(followId)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
      ctx.status = 204
    } else {
      ctx.throw(409, 'You are already unfollowing this user')
    }
  }
}

module.exports = new UsersCtl()
