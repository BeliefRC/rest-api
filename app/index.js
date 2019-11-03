const path = require('path')
const Koa = require('koa')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const fs = require('fs-extra')
const bodyParser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const app = new Koa()
const routesMap = require('./routes')
const { connectionStr } = require('./config')

mongoose.connect(connectionStr,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  () => {
    logger.info('MongoDB connect success!')
    console.log('MongoDB connect success!')
  })
mongoose.connection.on('error', error => {
  logger.error(error)
  console.error(error)
})

app.use(error({
  postFormat: (e, { stack, ...rest }) => {
    logger.error({ stack, ...rest })
    return process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
  }

}))

app.use(bodyParser())

app.use(parameter(app))

routesMap(app)

app.listen(
  3000
  , () => {console.log(`server is listening 3000`)})

