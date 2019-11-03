const fs = require('fs')
/**
 * 自动引入routes文件夹的路由文件，并注册中间件
 * @param app Koa实例
 */
module.exports = app => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file !== 'index.js') {
      const router = require(`./${file}`)
      app.use(router.routes()).use(router.allowedMethods())
    }
  })
}
