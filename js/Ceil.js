export default class Ceil {
  constructor (Context, position) {
    this.ctx = Context.ctx
    this.ceilWidth = Context.ceilWidth
    this.position = position
    this.worldPos = {x: 0, y: 0}
  }

  updateWorldPos(figurePos) {    
    this.worldPos.x = (figurePos.x + this.position.x) * this.ceilWidth
    this.worldPos.y = (figurePos.y + this.position.y) * this.ceilWidth
    return this.worldPos
  }

  render () {
    this.ctx.strokeStyle = "white"
    this.ctx.beginPath()
    this.ctx.fillRect(this.worldPos.x, this.worldPos.y, this.ceilWidth, this.ceilWidth)
    this.ctx.strokeRect(this.worldPos.x, this.worldPos.y, this.ceilWidth, this.ceilWidth)
    this.ctx.closePath()
  }
}