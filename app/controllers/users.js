const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
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

  /**
   * 获取所关注的人
   * @param ctx
   * @returns {Promise<void>}
   */
  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user.following
  }

  /**
   * 获取粉丝
   * @param ctx
   * @returns {Promise<void>}
   */
  async listFollowers (ctx) {
    ctx.body = await User.find({ following: ctx.params.id })
  }

  /**
   * 关注某人
   * @param ctx
   * @returns {Promise<void>}
   */
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

  /**
   * 取消关注某人
   * @param ctx
   * @returns {Promise<void>}
   */
  async unFollow (ctx) {
    const followId = ctx.params.id
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(followId)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
      ctx.status = 204
    } else {
      ctx.throw(409, 'You are already unFollowing this user')
    }
  }

  /**
   * 获取关注的话题
   * @param ctx
   * @returns {Promise<void>}
   */
  async listFollowingTopics (ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user.followingTopics
  }

  /**
   * 关注话题
   * @param ctx
   * @returns {Promise<void>}
   */
  async followTopic (ctx) {
    const followTopicId = ctx.params.id
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(id => id.toString()).includes(followTopicId)) {
      me.followingTopics.push(followTopicId)
      me.save()
      ctx.status = 204
    } else {
      ctx.throw(409, 'You are already followingTopic this user')
    }
  }

  /**
   * 取消关注话题
   * @param ctx
   * @returns {Promise<void>}
   */
  async unFollowTopic (ctx) {
    const followTopicId = ctx.params.id
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(id => id.toString()).indexOf(followTopicId)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
      ctx.status = 204
    } else {
      ctx.throw(409, 'You are already unFollowingTopic this user')
    }
  }

  /**
   * 列出问题列表
   * @param ctx
   * @returns {Promise<void>}
   */
  async listQuestions (ctx) {
    ctx.body = await Question.find({ questioner: ctx.params.id })
  }

  /**
   * 获取喜欢的答案列表
   * @param ctx
   * @returns {Promise<void>}
   */
  async listLikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user.likingAnswers
  }

  /**
   * 喜欢（赞）答案
   * @param ctx
   * @param next
   * @returns {Promise<void>}
   */
  async likeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消喜欢（赞）答案
   * @param ctx
   * @param next
   * @returns {Promise<void>}
   */
  async unlikeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }

  /**
   * 获取不喜欢（踩）的答案列表
   * @param ctx
   * @returns {Promise<void>}
   */
  async listDislikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user.dislikingAnswers
  }

  /**
   * 不喜欢（踩）答案
   * @param ctx
   * @param next
   * @returns {Promise<void>}
   */
  async dislikeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消不喜欢（踩）答案
   * @param ctx
   * @returns {Promise<void>}
   */
  async undislikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  /**
   * 获取收藏的答案列表
   * @param ctx
   * @returns {Promise<void>}
   */
  async listCollectingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user.collectingAnswers
  }

  /**
   * 收藏答案
   * @param ctx
   * @param next
   * @returns {Promise<void>}
   */
  async collectAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消收藏答案
   * @param ctx
   * @returns {Promise<void>}
   */
  async uncollectAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl()
