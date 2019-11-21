const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config/baseConfig')
const router = new Router({ prefix: '/users' })
const usersCtl = require('../controllers/users')
const topicCtl = require('../controllers/topics')
const answerCtl = require('../controllers/answers')

const auth = jwt({ secret })

router.get('/', usersCtl.find)
router.post('/', usersCtl.create)
router.get('/:id', usersCtl.findById)
router.patch('/:id', auth, usersCtl.checkOwner, usersCtl.update)
router.delete('/:id', auth, usersCtl.checkOwner, usersCtl.delete)
router.post('/login', usersCtl.login)

//关注与粉丝
router.get('/:id/following', usersCtl.listFollowing)
router.get('/:id/followers', usersCtl.listFollowers)
router.put('/following/:id', auth, usersCtl.follow)
router.delete('/following/:id', auth, usersCtl.unFollow)

//关注的话题相关
router.get('/:id/followingTopics', usersCtl.listFollowingTopics)
router.put('/followingTopics/:id', auth, topicCtl.checkTopicExist, usersCtl.followTopic)
router.delete('/followingTopics/:id', auth, topicCtl.checkTopicExist, usersCtl.unFollowTopic)
router.get('/:id/likingAnswers', usersCtl.listLikingAnswers)

//赞踩答案相关
router.put('/likingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.likeAnswer, usersCtl.undislikeAnswer)
router.delete('/likingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.unlikeAnswer)
router.get('/:id/dislikingAnswers', usersCtl.listDislikingAnswers)
router.put('/dislikingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.dislikeAnswer, usersCtl.unlikeAnswer)
router.delete('/dislikingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.undislikeAnswer)

router.get('/:id/collectingAnswers', usersCtl.listCollectingAnswers)
router.put('/collectingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.collectAnswer)
router.delete('/collectingAnswers/:id', auth, answerCtl.checkAnswerExist, usersCtl.uncollectAnswer)
module.exports = router
