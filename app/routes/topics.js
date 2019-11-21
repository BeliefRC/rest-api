const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/topics' })
const TopicsCtl = require('../controllers/topics')

const { secret } = require('../config/baseConfig')

const auth = jwt({ secret })

router.get('/', TopicsCtl.find)
router.post('/', auth, TopicsCtl.create)
router.get('/:id', TopicsCtl.checkTopicExist, TopicsCtl.findById)
router.patch('/:id', auth, TopicsCtl.checkTopicExist, TopicsCtl.update)
router.get('/:id/followers', TopicsCtl.checkTopicExist, TopicsCtl.listTopicFollowers)
router.get('/:id/questions', TopicsCtl.checkTopicExist, TopicsCtl.listQuestions)

module.exports = router
