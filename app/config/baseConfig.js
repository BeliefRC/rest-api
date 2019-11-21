module.exports = {
  //连接密码写在了启动命令的环境变量中
  connectionStr: `mongodb://localhost/restApi`,
  // connectionStr: `mongodb+srv://rc:${process.env.mongoPWD}@zhihu-ziwqe.mongodb.net/test?retryWrites=true&w=majority`
  secret: process.env.secret

}
