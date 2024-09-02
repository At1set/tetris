import Ceil from "./Ceil.js"

export default class Figure {
  constructor(Context, figures, grid) {
    this.Context = Context
    this.ctx = Context.ctx
    this.ceilWidth = Context.ceilWidth
    this.position = {
      x: 0,
      y: 0,
    }
    this.stepCount = 0
    this.lifeTime = 2
    this.figures = figures
    figures.push(this)

    this.isPlaced = false
    this.tiles = []
    this.grid = grid

    this.onPlace = null
    this.Angle = 0

    this.actions = {
      isMovingLeft: false,
      isMovingRight: false,
      isMovingDown: false,
    }
  }

  render(isOnlyWorldPosUpdate=false) {
    this.tiles.forEach((tile) => {
      tile.updateWorldPos(this.position)
      if(!isOnlyWorldPosUpdate) tile.render()
    })
    this.drawPreview()
  }

  drawPreview() {
    this.ctx.globalAlpha = 0.4
    const tiles_preview = this.tiles.map(
      (tile) => new Ceil(this.Context, { x: tile.position.x, y: tile.position.y })
    )
    let fuse = 0
    while (!this.checkCollision(undefined, tiles_preview)) {
      if (fuse >= 30) return
      fuse += 1
      tiles_preview.forEach(tile => {
        tile.position.y += 1
        tile.updateWorldPos(this.position)
      })
    }
    tiles_preview.forEach(tile => {
      tile.position.y -= 1
      tile.updateWorldPos(this.position)
      tile.render(true)
    })
    this.ctx.globalAlpha = 1
  }

  moveLeft() {
    if (this.actions.isMovingLeft) return

    this.actions.isMovingLeft = true
    if (this.isPlaced || this.checkCollision("left")) return this.actions.isMovingLeft = false
    this.position.x -= 1

    this.render(true)
    return this.actions.isMovingLeft = false
  }

  moveRight() {
    if (this.actions.isMovingRight) return

    this.actions.isMovingRight = true
    if (this.isPlaced || this.checkCollision("right")) return this.actions.isMovingRight = false
    this.position.x += 1

    this.render(true)
    return this.actions.isMovingRight = false
  }

  moveDown() {
    if (this.isPlaced || this.actions.isMovingDown) return
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
          tile.worldPos.y < 0 ||
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
      const tileX = tile.position.x + this.position.x
      const tileY = tile.position.y + this.position.y

      if (direction === "left" && tileX - 1 < 0) return true
      else if (direction === "right" && tileX + 1 >= 10) return true
      else if (direction === "down" && tileY + 1 > 16) return true
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
          tile.worldPos.x === ceil.worldPos.x &&
            console.log(tile.worldPos.y + this.ceilWidth, ceil.worldPos.y)
          
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
}

export class Cube extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        this.tiles.push(new Ceil(this.Context, { x, y }))
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
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        if (x === 1 && y === 0) continue
        this.tiles.push(new Ceil(this.Context, { x, y }))
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
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].worldPos);
    
    
    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}



export class Plank extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 4; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 0 }))
    }

    this.position = {
      x: 3,
      y: 0,
    }
  }

  rotate() {
    this.Angle += 1
    if (this.Angle > 1) this.Angle = 0
    const rotateTiles = []

    if (this.Angle === 0) {
      for (let x = 0; x < 4; x++) {
        rotateTiles.push(new Ceil(this.Context,{ x, y: 0 }))
      }
    } else if (this.Angle === 1) {
      for (let y = 0; y < 4; y++) {
        rotateTiles.push(new Ceil(this.Context,{ x: 1, y }))
      }
    }
    
    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].worldPos);
    

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}

export class Stairs extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 3; x++) {
      this.tiles = [
        new Ceil(this.Context, {x: 0, y: 1}),
        new Ceil(this.Context, {x: 1, y: 1}),
        new Ceil(this.Context, {x: 2, y: 1}),
        new Ceil(this.Context, {x: 1, y: 0}),
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
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
    }
    else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].worldPos);
    

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}



export class LCorner extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 3; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 1 }))
    }
    this.tiles.push(new Ceil(this.Context, { x: 0, y: 0 }))

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
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].worldPos);
    

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}


export class RCorner extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    for (let x = 0; x < 3; x++) {
      this.tiles.push(new Ceil(this.Context, { x, y: 1 }))
    }
    this.tiles.push(new Ceil(this.Context, { x: 2, y: 0 }))

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
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }))
    } else if (this.Angle === 2) {
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }))
    } else if (this.Angle === 3) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 2 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 0 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].worldPos);
    

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}


export class LSnake extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    this.tiles = [
      new Ceil(this.Context, {x: 0, y: 0}),
      new Ceil(this.Context, {x: 1, y: 0}),
      new Ceil(this.Context, {x: 1, y: 1}),
      new Ceil(this.Context, {x: 2, y: 1}),
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
      rotateTiles.push(new Ceil(this.Context, {x: 0, y: 0}))
      rotateTiles.push(new Ceil(this.Context, {x: 1, y: 0}))
      rotateTiles.push(new Ceil(this.Context, {x: 1, y: 1}))
      rotateTiles.push(new Ceil(this.Context, {x: 2, y: 1}))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 2 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].position);

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log("Коллизия: ", isCollision)

    if (isCollision) return this.Angle -= 1
    
    return this.tiles = rotateTiles
  }
}



export class RSnake extends Figure {
  constructor(ctx, ceilWidth, figures, grid) {
    super(ctx, ceilWidth, figures, grid)

    this.tiles = [
      new Ceil(this.Context, { x: 0, y: 1 }),
      new Ceil(this.Context, { x: 1, y: 1 }),
      new Ceil(this.Context, { x: 1, y: 0 }),
      new Ceil(this.Context, { x: 2, y: 0 }),
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
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 2, y: 0 }))
    } else if (this.Angle === 1) {
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 0 }))
      rotateTiles.push(new Ceil(this.Context, { x: 1, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 1 }))
      rotateTiles.push(new Ceil(this.Context, { x: 0, y: 2 }))
    }

    rotateTiles.forEach(tile => tile.updateWorldPos(this.position))
    console.log(rotateTiles[0].position);
    

    const isCollision = this.checkCollision(undefined, rotateTiles)
    console.log(isCollision);

    if (isCollision) return this.Angle -= 1
    console.log(this.tiles[0].worldPos.x);
    
    return this.tiles = rotateTiles
  }
}