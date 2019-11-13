const { Topic } = require('../models/topics')
const { User } = require('../models/users')

class TopicsCtl {
  async find (ctx) {
    let { pageSize = 10 } = ctx.query
    const pageNum = Math.max(ctx.query.pageNum, 1) - 1
    pageSize = Math.max(pageSize, 1)
    ctx.body = await Topic
      .find({ name: new RegExp(ctx.query.q) })
      .limit(pageSize).skip(pageNum * pageSize)
  }

  async checkTopicExist (ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) { ctx.throw(404, '话题不存在') }
    await next()
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    ctx.body = await Topic.findById(ctx.params.id).select(selectFields)
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    ctx.body = await new Topic(ctx.request.body).save()
  }

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    ctx.body = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
  }

  async listFollowers (ctx) {
    ctx.body = await User.find({ followingTopics: ctx.params.id })
  }

}

module.exports = new TopicsCtl()
