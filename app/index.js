const path = require('path')
const Koa = require('koa')
const mongoose = require('mongoose')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const koaLogger = require('koa-logger')
const logger = require('./utils/logger')
const routesMap = require('./routes')
const { connectionStr } = require('./config/baseConfig')
const app = new Koa()

mongoose.connect(connectionStr,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
).then(() => {
  logger.info('MongoDB connect success!')
  console.log('MongoDB connect success!')
}).catch(error => {
  logger.error(error)
  console.error(JSON.stringify(error, null, 4))
})

app.use(koaLogger())
app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
  postFormat: (e, { stack, ...rest }) => {
    logger.error({ stack, ...rest })
    return process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
  }

}))

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true,
  }
}))

app.use(parameter(app))

routesMap(app)

app.listen(
  3000
  , () => {console.log(`server is listening 3000`)})

