const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions' })
const QuestionsCtl = require('../controllers/questions')

const { secret } = require('../config/baseConfig')

const auth = jwt({ secret })

router.get('/', QuestionsCtl.find)
router.post('/', auth, QuestionsCtl.create)
router.get('/:id', QuestionsCtl.checkQuestionExist, QuestionsCtl.findById)
router.patch('/:id', auth, QuestionsCtl.checkQuestionExist, QuestionsCtl.checkQuestioner, QuestionsCtl.update)
router.delete('/:id', auth, QuestionsCtl.checkQuestionExist, QuestionsCtl.checkQuestioner, QuestionsCtl.delete)

module.exports = router
