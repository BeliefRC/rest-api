class HomeCtl {
  index (ctx) {
    ctx.body = 'home'
  }
}

module.exports = new HomeCtl()
