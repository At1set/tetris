import { Cube, Triangle, Plank, Stairs, LCorner, RCorner, LSnake, RSnake } from "./Figure.js";

window.onload = () => {
  const canvas = document.getElementById("canvas")

  const ctx = canvas.getContext("2d")
  const ceilWidth = 40

  const preview = document.querySelector(".preview")
  preview.style.opacity = 0

  const score = document.getElementById("score")
  let score_count = 0
  const linesDestroyed = document.getElementById("lines-destroyed")
  let linesDestroyed_count = 0
  const record = document.getElementById("record")
  let record_count = +localStorage.getItem("record") || 0
  record.innerText = `Best result: ${record_count}`
  const time = document.getElementById("time")
  let time_count = 0

  ctx.imageSmoothingEnabled = false
  ctx.lineWidth = 1

  let grid = []
  const colors = [
    "red",
    "green",
    "blue",
    "yellow",
  ]
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const color = colors[randomIndex];
    return color
  }

  let Context = {
    ctx,
    ceilWidth,
    canvas,
    grid,
  }

  let currentFigure = null
  // currentFigure = new Plank(Context, "blue")

  const sequence = [1, 2, 3, 4, 5, 6, 7, 8]
  let sequence_index = 0
  let rand_sequence = sequence.slice().sort(() => Math.random() - 0.5)
  let rand_figure = rand_sequence[0]

  const tetris_theme = new Audio("../src/audio/Tetris theme.mp3")
  tetris_theme.onended = tetris_theme.play

  let isGameStarted = false
  drawGrid()
  drawStart()

  function main() {
    if (!isGameStarted) {
      isGameStarted = true
      getNewFigure()
      preview.style.opacity = 1
      tetris_theme.play()
    }
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    drawGrid()
    currentFigure?.render()
    drawCeils()
    
    requestAnimationFrame(main)
  }

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
        
        if (rowCeilCount >= 11) {
          destroyed += 1
          grid = grid.filter(ceil => ceil.worldPos.y != +row)
          Context.grid = grid
          grid.forEach(ceil => {
            if (ceil.worldPos.y < +row) ceil.worldPos.y += ceilWidth
          })
        }
      }
    }

    if (destroyed > 0) {
      linesDestroyed_count += destroyed
      linesDestroyed.innerText = "Lines destroyed: " + linesDestroyed_count.toString()
      return addScore(destroyed)
    }
  }

  function drawGrid() {
    ctx.strokeStyle = "gray"
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
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

  function drawStart() {
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    ctx.fillStyle = "white"
    ctx.font = "50px Arial"
    ctx.fillText(`Старт`, canvas.offsetWidth / 2 - 70, canvas.offsetHeight / 2)
    ctx.font = "15px Arial"
    ctx.fillText(`press Space to start play`, canvas.offsetWidth / 2 - 80, canvas.offsetHeight / 2 + 25)
  }

  function drawCeils() {
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
      return true
    }
    return false
  }

  function getNewFigure() {
    console.log(rand_sequence);
    sequence_index += 1
    
    const random_color = getRandomColor()

    if (rand_figure === 1) {
      currentFigure = new Cube(Context, random_color)
      preview.classList.remove("Cube")
    }
    if (rand_figure === 2) {
      currentFigure = new Triangle(Context, random_color)
      preview.classList.remove("Triangle")
    }
    if (rand_figure === 3) {
      currentFigure = new Plank(Context, random_color)
      preview.classList.remove("Plank")
    }
    if (rand_figure === 4) {
      currentFigure = new Stairs(Context, random_color)
      preview.classList.remove("Stairs")
    }
    if (rand_figure === 5) {
      currentFigure = new LCorner(Context, random_color)
      preview.classList.remove("LCorner")
    }
    if (rand_figure === 6) {
      currentFigure = new RCorner(Context, random_color)
      preview.classList.remove("RCorner")
    }
    if (rand_figure === 7) {
      currentFigure = new LSnake(Context, random_color)
      preview.classList.remove("LSnake")
    }
    if (rand_figure === 8) {
      currentFigure = new RSnake(Context, random_color)
      preview.classList.remove("RSnake")
    }
    currentFigure.onPlace = onFigurePlace

    if (sequence_index === rand_sequence.length - 2) {
      sequence_index = 0
      const newSequence = sequence.slice().sort(() => Math.random() - 0.5)
      rand_sequence = [rand_sequence[rand_sequence.length-1]].concat(newSequence)
    }
    rand_figure = rand_sequence[sequence_index]

    if (rand_figure === 1) preview.classList.add("Cube")
    if (rand_figure === 2) preview.classList.add("Triangle")
    if (rand_figure === 3) preview.classList.add("Plank")
    if (rand_figure === 4) preview.classList.add("Stairs")
    if (rand_figure === 5) preview.classList.add("LCorner")
    if (rand_figure === 6) preview.classList.add("RCorner")
    if (rand_figure === 7) preview.classList.add("LSnake")
    if (rand_figure === 8) preview.classList.add("RSnake")
  }

  const gameCycle = setInterval(() => {
    if (!isGameStarted) return
    figureMoveDown()
  }, 500)
  const timer = setInterval(() => {
    if (!isGameStarted) return
    time.innerText = "Time: " + (time_count++).toString()
  }, 1000);

  window.addEventListener("keydown", (e) => {
    // console.log(e.code)
    if (e.code === "KeyA" || e.code === "ArrowLeft") currentFigure?.moveLeft()
    else if (e.code === "KeyD" || e.code === "ArrowRight") currentFigure?.moveRight()
    else if (e.code === "KeyS" || e.code === "ArrowDown") figureMoveDown()
    else if (e.code === "Space" && !isGameStarted) main()
    else if (e.code === "Space") {
      currentFigure?.immediateFall(figureMoveDown.bind(this))
    }
  })
  window.addEventListener("keyup", (e) => {
    if (e.code === "KeyW" || e.code === "ArrowUp") currentFigure?.doRotate()
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