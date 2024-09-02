import { Cube, Triangle, Plank, Stairs, LCorner, RCorner, LSnake, RSnake } from "./Figure.js";

window.onload = () => {
  const canvas = document.getElementById("canvas")

  const ctx = canvas.getContext("2d")
  const ceilWidth = 40
  const Context = {
    ctx, 
    ceilWidth,
    canvas,
  }

  const preview = document.querySelector(".preview")

  const score = document.getElementById("score")
  let score_count = 0
  const record = document.getElementById("record")
  let record_count = +localStorage.getItem("record") || 0
  record.innerText = `Best result: ${record_count}`
  const time = document.getElementById("time")
  let time_count = 0

  ctx.imageSmoothingEnabled = false
  ctx.lineWidth = 1

  const figures = []
  let grid = []

  let currentFigure = null


  // currentFigure = new LSnake(Context, figures, grid)

  let rand_figure = Math.floor(Math.random() * 8) + 1
  getNewFigure(rand_figure)

  function main() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    drawGrid()
    currentFigure?.render()
    drawCeils()
    
    requestAnimationFrame(main)
  }

  requestAnimationFrame(main)

  function onFigurePlace() {
    if (this.stepCount === 0) endGame()
    
    let destroyed = 0
    const rows = {}

    grid.forEach(ceil => {
      if (!rows[ceil.worldPos.y]) return rows[ceil.worldPos.y] = 1
      rows[ceil.worldPos.y] += 1
    })
    
    for (const row in rows) {
      if (Object.prototype.hasOwnProperty.call(rows, row)) {
        const rowCeilCount = rows[row]
        
        if (rowCeilCount >= 10) {
          destroyed += 1
          grid = grid.filter(ceil => ceil.worldPos.y != +row)
          grid.forEach(ceil => {
            if (ceil.worldPos.y < +row) ceil.worldPos.y += ceilWidth
          })
        }
      }
    }

    return addScore(destroyed)
  }

  function drawGrid() {
    ctx.strokeStyle = "black"
    for (let x = 0; x <= canvas.offsetWidth; x += ceilWidth) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.offsetHeight)
      ctx.stroke()
      ctx.closePath()
    }

    for (let y = 0; y <= canvas.offsetHeight; y += ceilWidth) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.offsetWidth, y)
      ctx.stroke()
      ctx.closePath()
    }
  }

  function drawCeils() {
    ctx.strokeStyle = "white"
    grid.forEach((ceil) => {
      ceil.render()
    })
  }

  function addScore(destroyed) {
    let newScore = 100 * destroyed

    if (destroyed == 2) newScore += 100
    if (destroyed == 3) newScore += 200
    if (destroyed == 4) newScore += 500

    score_count += newScore
    score.innerText = "Score: " + score_count.toString()
  }

  function saveRecord() {
    if (record_count >= score_count) return
    localStorage.setItem("record", score_count.toString())
  }

  function figureMoveDown() {
    const is_place = currentFigure?.moveDown()
    if (is_place) {
      getNewFigure()
    }
  }

  function getNewFigure() {
    if (rand_figure === 1) {
      currentFigure = new Cube(Context, figures, grid)
      preview.classList.remove("Cube")
    }
    if (rand_figure === 2) {
      currentFigure = new Triangle(Context, figures, grid)
      preview.classList.remove("Triangle")
    }
    if (rand_figure === 3) {
      currentFigure = new Plank(Context, figures, grid)
      preview.classList.remove("Plank")
    }
    if (rand_figure === 4) {
      currentFigure = new Stairs(Context, figures, grid)
      preview.classList.remove("Stairs")
    }
    if (rand_figure === 5) {
      currentFigure = new LCorner(Context, figures, grid)
      preview.classList.remove("LCorner")
    }
    if (rand_figure === 6) {
      currentFigure = new RCorner(Context, figures, grid)
      preview.classList.remove("RCorner")
    }
    if (rand_figure === 7) {
      currentFigure = new LSnake(Context, figures, grid)
      preview.classList.remove("LSnake")
    }
    if (rand_figure === 8) {
      currentFigure = new RSnake(Context, figures, grid)
      preview.classList.remove("RSnake")
    }
    currentFigure.onPlace = onFigurePlace

    rand_figure = Math.floor(Math.random() * 8) + 1

    if (rand_figure === 1) preview.classList.add("Cube")
    if (rand_figure === 2) preview.classList.add("Triangle")
    if (rand_figure === 3) preview.classList.add("Plank")
    if (rand_figure === 4) preview.classList.add("Stairs")
    if (rand_figure === 5) preview.classList.add("LCorner")
    if (rand_figure === 6) preview.classList.add("RCorner")
    if (rand_figure === 7) preview.classList.add("LSnake")
    if (rand_figure === 8) preview.classList.add("RSnake")

    return rand_figure
  }

  const gameCycle = setInterval(() => {
    figureMoveDown()
  }, 500)
  const timer = setInterval(() => {
    time.innerText = "Time: " + (time_count++).toString()
  }, 1000);

  window.addEventListener("keydown", (e) => {
    // console.log(e.code)
    if (e.code === "KeyA" || e.code === "ArrowLeft") currentFigure?.moveLeft()
    else if (e.code === "KeyD" || e.code === "ArrowRight") currentFigure?.moveRight()
    else if (e.code === "KeyS" || e.code === "ArrowDown") figureMoveDown()
  })
  window.addEventListener("keyup", (e) => {
    if (e.code === "KeyW" || e.code === "ArrowUp") currentFigure?.rotate()
  })

  function endGame() {
    clearInterval(gameCycle)
    clearInterval(timer)
    saveRecord()
    setTimeout(() => {
      location.reload()
    }, 0.2)
    alert("Конец игры")
  }
}