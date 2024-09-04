export default class Ceil {
  constructor (Context, position, color="black") {
    this.ctx = Context.ctx
    this.ceilWidth = Context.ceilWidth
    this.position = position
    this.worldPos = { x: 0, y: 0 }
    this.offsetWorldPos = { x: 0, y: 0 }
    this.color = color
  }

  updateWorldPos(figurePos) {
    this.worldPos.x = (figurePos.x + this.position.x) * this.ceilWidth + this.offsetWorldPos.x
    this.worldPos.y = (figurePos.y + this.position.y) * this.ceilWidth + this.offsetWorldPos.y
    return this.worldPos
  }

  render () {
    this.ctx.strokeStyle = "white"
    this.ctx.fillStyle = this.color
    this.ctx.beginPath()
    this.ctx.fillRect(this.worldPos.x, this.worldPos.y, this.ceilWidth, this.ceilWidth)
    this.ctx.strokeRect(this.worldPos.x, this.worldPos.y, this.ceilWidth, this.ceilWidth)
    this.ctx.closePath()
  }
}