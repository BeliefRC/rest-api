const Comment = require('../models/comments')

class CommentsCtl {

  async checkCommentExist (ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if (!comment) { ctx.throw(404, '评论不存在') }
    if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }
    if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId) {
      ctx.throw(404, '该答案下没有此评论')
    }
    ctx.state.comment = comment
    await next()
  }

  async checkCommentator (ctx, next) {
    const { comment } = ctx.state
    if (comment.commentator.toString() !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
    await next()
  }

  async find (ctx) {
    let { pageSize = 10 } = ctx.query
    const pageNum = Math.max(ctx.query.pageNum, 1) - 1
    pageSize = Math.max(pageSize, 1)
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params
    const { rootCommentId } = ctx.query
    ctx.body = await Comment
      .find({ content: q, questionId, answerId, rootCommentId })
      .limit(pageSize).skip(pageNum * pageSize)
      .populate('commentator replyTo')
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    ctx.body = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
  }

  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    })
    const commentator = ctx.state.user._id
    const { questionId, answerId } = ctx.params
    ctx.body = await new Comment({ ...ctx.request.body, commentator, questionId, answerId }).save()
  }

  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    const { content } = ctx.request.body
    await ctx.state.comment.update({ content })
    ctx.body = ctx.state.comment
  }

  async delete (ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new CommentsCtl()
