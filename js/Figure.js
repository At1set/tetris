import Ceil from "./Ceil.js"

export default class Figure {
  constructor(Context, color="black") {
    this.Context = Context
    this.ctx = Context.ctx
    this.ceilWidth = Context.ceilWidth
    this.position = {
      x: 0,
      y: 0,
    }
    this.color = color
    this.stepCount = 0
    this.lifeTime = 2

    this.isPlaced = false
    this.tiles = []
    this.grid = Context.grid

    this.onPlace = null
    this.Angle = 0

    this.actions = {
      isMovingLeft: false,
      isMovingRight: false,
      isMovingDown: false,
      isFreeze: false,
      isRotating: false,
    }
  }

  render(isOnlyWorldPosUpdate=false) {
    this.tiles.forEach((tile) => {
      tile.updateWorldPos(this.position)
      if(!isOnlyWorldPosUpdate) tile.render()
    })
    this.drawPreview()
  }

  drawPreview(getTilesPreview=false) {
    if (!getTilesPreview) this.ctx.globalAlpha = 0.4
    const tiles_preview = this.tiles.map(
      (tile) => new Ceil(this.Context, { x: tile.position.x, y: tile.position.y}, this.color)
    )
    let fuse = 0
    while (!this.checkCollision(undefined, tiles_preview)) {
      if (fuse >= 30) return false
      fuse += 1
      tiles_preview.forEach(tile => {
        tile.position.y += 1
        tile.updateWorldPos(this.position)
      })
    }
    tiles_preview.forEach(tile => {
      tile.position.y -= 1
      tile.updateWorldPos(this.position)
      if (!getTilesPreview) tile.render()
    })
    if (!getTilesPreview) this.ctx.globalAlpha = 1
    return tiles_preview
  }

  moveLeft() {
    if (this.actions.isMovingLeft || this.actions.isFreeze) return

    this.actions.isMovingLeft = true
    if (this.isPlaced || this.checkCollision("left")) return this.actions.isMovingLeft = false
    this.position.x -= 1

    this.render(true)
    return this.actions.isMovingLeft = false
  }

  moveRight() {
    if (this.actions.isMovingRight || this.actions.isFreeze) return

    this.actions.isMovingRight = true
    if (this.isPlaced || this.checkCollision("right")) return this.actions.isMovingRight = false
    this.position.x += 1

    this.render(true)
    return this.actions.isMovingRight = false
  }

  moveDown() {
    if (this.isPlaced || this.actions.isMovingDown || this.actions.isFreeze) return
    this.actions.isMovingDown = true

    this.stepCount += 1
    if (this.checkCollision("down")) {
      this.stepCount -= 1

      if (this.lifeTime > 0) {
        this.lifeTime -= 1
        this.actions.isMovingDown = false
        return
      }

      this.place()

      this.actions.isMovingDown = false
      return true
    }

    this.position.y += 1
    this.render(true)
    this.actions.isMovingDown = false
  }

  immediateFall(figureMoveDown) {
    if (this.actions.isFreeze) return
    this.actions.isFreeze = true
    const tiles_preview = this.drawPreview(true)
    if (!tiles_preview) return this.actions.isFreeze = false

    let fuse = 0
    function animation() {
      const isStop = this.tiles[0].worldPos.y >= tiles_preview[0].worldPos.y
      if (isStop) return animation_end.call(this)
      fuse += 1
      if (fuse >= 1200) return
      this.tiles.forEach((tile) => {
        tile.offsetWorldPos.y += 30
        tile.updateWorldPos(this.position)
        tile.render()
      })
      setTimeout(() => {
        animation.call(this)
      }, 10);
    }

    function animation_end() {
      this.tiles = tiles_preview
      this.actions.isFreeze = false
      this.lifeTime = 0
      this.stepCount = 1
      this.tiles.forEach(tile => {
        if (tile.worldPos.y <= 0 - this.ceilWidth) this.stepCount = 0
      })
      return figureMoveDown()
    }
    return animation.call(this)
  }

  checkCollision(direction, newTiles) {
    if (direction && !["left", "right", "down"].includes(direction))
      throw new Error("Указано неверное направление!")

    // Collision for check is rotate available
    if (newTiles) {
      for (let i = 0; i < newTiles.length; i++) {
        const tile = newTiles[i]

        if (
          tile.worldPos.x < 0 ||
          tile.worldPos.x + this.ceilWidth > this.Context.canvas.offsetWidth
        )
          return true
        if (
          tile.worldPos.y + this.ceilWidth > this.Context.canvas.offsetHeight
        )
          return true

        for (let i = 0; i < this.grid.length; i++) {
          const ceil = this.grid[i]
          if (
            ceil.worldPos.x === tile.worldPos.x &&
            ceil.worldPos.y === tile.worldPos.y
          )
            return true
        }
      }

      return false
    }
    // Collision for check is rotate available

    // Game field collision
    const tiles = this.tiles
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      const tileX = tile.worldPos.x
      const tileY = tile.worldPos.y

      if (direction === "left" && tileX - this.ceilWidth < 0) return true
      else if (direction === "right" && tileX + this.ceilWidth >= this.Context.canvas.offsetWidth) return true
      else if (direction === "down" && tileY + this.ceilWidth >= this.Context.canvas.offsetHeight) return true
    }

    if (this.stepCount === 0 && direction !== "down") return false

    // Ceils collision
    for (let i = 0; i < this.grid.length; i++) {
      const ceil = this.grid[i]
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i]
        if (
          tile.worldPos.x === ceil.worldPos.x &&
          tile.worldPos.y === ceil.worldPos.y
        )
          return true
        if (direction === "left") {
          if (
            tile.worldPos.y === ceil.worldPos.y &&
            tile.worldPos.x - this.ceilWidth === ceil.worldPos.x
          ) {
            return true
          }
        } else if (direction === "right") {
          if (
            tile.worldPos.y === ceil.worldPos.y &&
            tile.worldPos.x + this.ceilWidth === ceil.worldPos.x
          ) {
            return true
          }
        } else if (direction === "down") {
          if (
            tile.worldPos.x === ceil.worldPos.x &&
            tile.worldPos.y + this.ceilWidth === ceil.worldPos.y
          ) {
            return true
          }
        }
      }
    }

    return false
  }

  place() {
    this.isPlaced = true
    this.tiles.forEach((tile) => {
      this.grid.push(tile)
    })
    if (this.onPlace) this.onPlace()
  }

  rotate() {}

  doRotate() {
    if (this.actions.isFreeze || this.actions.isRotating) return
    this.actions.isRotating = true
    this.rotate()
    return this.actions.isRotating = false
  }
}

export class Cube extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        this.tiles.push(new Ceil(this.Context, { x, y }, this.color))
      }
    }

    this.position = {
      x: 4,
      y: -2
    }
  }

  rotate() {
    return
  }
}



export class Triangle extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        if (x === 1 && y === 0) continue
        this.tiles.push(new Ceil(this.Context, { x, y }, this.color))
      }
    }

    this.position = {
      x: 4,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 3) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    
    const isCollision = this.checkCollision(undefined, rotateTiles)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}



export class Plank extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 4; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 0 }, this.color))
    }

    this.position = {
      x: 3,
      y: 0,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 1) this.Angle = 0
    let rotateTiles = []

    if (this.Angle === 0) {
      for (let x = 0; x < 4; x++) {
        rotateTiles.push(new Ceil(this.Context,{ x, y: 0 }, this.color))
      }
    } else if (this.Angle === 1) {
      for (let y = 0; y < 4; y++) {rotateTiles.push(new Ceil(this.Context, { x: 1, y }, this.color))}
      rotateTiles.forEach((tile) => tile.updateWorldPos(this.position))
      let isAvailable = true
      console.log(this.checkCollision(undefined, rotateTiles))
      if (this.checkCollision(undefined, rotateTiles)) {
        isAvailable = false
        for (let x = 0; x < 4; x++) {
          if (isAvailable) break
          if (x === 1) continue
          rotateTiles = []
          for (let y = 0; y < 4; y++) {
            rotateTiles.push(new Ceil(this.Context, { x, y }, this.color))
            rotateTiles.forEach((tile) => tile.updateWorldPos(this.position))
            isAvailable = !this.checkCollision(undefined, rotateTiles)
          }
        }
      }
      if (!isAvailable) return (this.Angle -= 1)
    }
    
    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))

    if (this.Angle !== 1) {
      const isCollision = this.checkCollision(undefined, rotateTiles)
      if (isCollision) return (this.Angle -= 1)
    }
    
    return this.tiles = rotateTiles
  }
}

export class Stairs extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 3; x++) {
      this.tiles = [
        new Ceil(this.Context, {x: 0, y: 1}, this.color),
        new Ceil(this.Context, {x: 1, y: 1}, this.color),
        new Ceil(this.Context, {x: 2, y: 1}, this.color),
        new Ceil(this.Context, {x: 1, y: 0}, this.color),
      ]
    }

    this.position = {
      x: 3,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 3) this.Angle = 0
    const rotateTiles = []
    
    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
    }
    else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))

    const isCollision = this.checkCollision(undefined, rotateTiles)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}



export class LCorner extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 3; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 1 }, this.color))
    }
    this.tiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))

    this.position = {
      x: 4,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 3) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }, this.color))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }, this.color))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))

    const isCollision = this.checkCollision(undefined, rotateTiles)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}


export class RCorner extends Figure {
  constructor(Context, color) {
    super(Context, color)

    for (let x = 0; x < 3; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 1 }, this.color))
    }
    this.tiles.push(new Ceil(this.Context, { x: 2, y: 0 }, this.color))

    this.position = {
      x: 4,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 3) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }, this.color))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }, this.color))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }, this.color))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))

    const isCollision = this.checkCollision(undefined, rotateTiles)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}


export class LSnake extends Figure {
  constructor(Context, color) {
    super(Context, color)

    this.tiles = [
      new Ceil(this.Context, {x: 0, y: 0}, this.color),
      new Ceil(this.Context, {x: 1, y: 0}, this.color),
      new Ceil(this.Context, {x: 1, y: 1}, this.color),
      new Ceil(this.Context, {x: 2, y: 1}, this.color),
    ]

    this.position = {
      x: 4,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 1) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, {x: 0, y: 0}, this.color))
      rotateTiles.push(new Ceil(this.Context, {x: 1, y: 0}, this.color))
      rotateTiles.push(new Ceil(this.Context, {x: 1, y: 1}, this.color))
      rotateTiles.push(new Ceil(this.Context, {x: 2, y: 1}, this.color))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    const isCollision = this.checkCollision(undefined, rotateTiles)
    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}



export class RSnake extends Figure {
  constructor(Context, color) {
    super(Context, color)

    this.tiles = [
      new Ceil(this.Context, { x: 0, y: 1 }, this.color),
      new Ceil(this.Context, { x: 1, y: 1 }, this.color),
      new Ceil(this.Context, { x: 1, y: 0 }, this.color),
      new Ceil(this.Context, { x: 2, y: 0 }, this.color),
    ]

    this.position = {
      x: 4,
      y: -2,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 1) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }, this.color))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }, this.color))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }, this.color))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))

    const isCollision = this.checkCollision(undefined, rotateTiles)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}