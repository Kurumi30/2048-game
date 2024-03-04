import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")
const grid = new Grid(gameBoard)

const defeatMessage = "Fim de jogo! Você perdeu ;-;"
const info = "Para iniciar um novo jogo, recarregue a página :)"
const notyf = new Notyf({
  duration: 4000,
  position: {
    x: "center",
    y: "top",
  },
  ripple: true,
  types: [
    {
      type: 'info',
      background: 'blue',
      icon: false,
    }
  ]
})

function notification(message, type) {
  notyf.open({
    type: type,
    message: message,
  })
}

grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)

setupInput()

function setupInput() {
  if (isMobile()) {
    notification("Deslize para mover as peças", "info")
  } else {
    notification("Use as setas ou as teclas WASD para mover as peças", "info")
  }

  window.addEventListener("keydown", handleInput, { once: true })
  window.addEventListener("swiped", handleMobileInput, { once: true })
}

async function handleMobileInput(e) {
  switch (e.detail.dir) {
    case "up":
      if (!canMoveUp()) {
        setupInput()

        return
      }

      await moveUp()
      break
    case "down":
      if (!canMoveDown()) {
        setupInput()

        return
      }

      await moveDown()
      break
    case "left":
      if (!canMoveLeft()) {
        setupInput()

        return
      }

      await moveLeft()
      break
    case "right":
      if (!canMoveRight()) {
        setupInput()

        return
      }

      await moveRight()
      break
    default:
      setupInput()

      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)

  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(async () => {
      notification(defeatMessage, "error")

      await delay()

      notification(info, "success")
    })

    return
  }

  setupInput()
}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      if (!canMoveUp()) {
        setupInput()

        return
      }

      await moveUp()
      break
    case "ArrowDown":
    case "s":
      if (!canMoveDown()) {
        setupInput()

        return
      }

      await moveDown()
      break
    case "ArrowLeft":
    case "a":
      if (!canMoveLeft()) {
        setupInput()

        return
      }

      await moveLeft()
      break
    case "ArrowRight":
    case "d":
      if (!canMoveRight()) {
        setupInput()

        return
      }

      await moveRight()
      break
    default:
      setupInput()

      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)

  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(async () => {
      notification(defeatMessage, "error")

      await delay()

      notification(info, "success")
    })

    return
  }

  setupInput()
}

function moveUp() {
  return slideTiles(grid.cellsByColumn)
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
  return slideTiles(grid.cellsByRow)
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const promises = []

      for (let i = 1; i < group.length; i++) {
        const cell = group[i]

        if (cell.tile == null) continue

        let lastValidCell

        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]

          if (!moveToCell.canAccept(cell.tile)) break

          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())

          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }

          cell.tile = null
        }
      }

      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false

      const moveToCell = group[index - 1]

      return moveToCell.canAccept(cell.tile)
    })
  })
}

function delay(ms = 1500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}
