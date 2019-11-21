const Question = require('../models/questions')

class QuestionsCtl {
  async find (ctx) {
    let { pageSize = 10 } = ctx.query
    const pageNum = Math.max(ctx.query.pageNum, 1) - 1
    pageSize = Math.max(pageSize, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Question
    //匹配标题或者描述
      .find({ $or: [{ title: q }, { description: q }] })
      .limit(pageSize).skip(pageNum * pageSize)
  }

  async checkQuestionExist (ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    if (!question) { ctx.throw(404, '问题不存在') }
    ctx.state.question = question
    await next()
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    ctx.body = await Question.findById(ctx.params.id)
      .select(selectFields)
      .populate('questioner topics')
  }

  async create (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
    })
    ctx.body = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
  }

  async checkQuestioner (ctx, next) {
    const { question } = ctx.state
    if (question.questioner.toString() !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
    await next()
  }

  async update (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
    })
    await ctx.state.question.updateOne(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async delete (ctx) {
    await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new QuestionsCtl()
