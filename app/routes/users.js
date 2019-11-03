const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const usersCtl = require('../controllers/users')
router.get('/', usersCtl.find)
router.post('/', usersCtl.create)
router.get('/:id', usersCtl.findById)
router.put('/:id', usersCtl.update)
router.delete('/:id', usersCtl.delete)
module.exports = router
