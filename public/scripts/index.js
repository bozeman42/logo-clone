import Turtle from './Turtle.js'
import { Vec2 } from './math.js'
import Layer from './Layer.js'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const input = document.getElementById('input')
const execute = document.getElementById('execute')
const canvasDiv = document.getElementById('logo')
const clearButton = document.getElementById('clear')

const mainLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT)
const { canvas, ctx } = mainLayer

canvasDiv.appendChild(canvas)

const drawLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT)
const turtle = new Turtle(400, 300, 0, 6, drawLayer)
turtle.draw(ctx)

clearButton.onclick = () => {
  mainLayer.clear()
  drawLayer.clear()
  turtle.draw(ctx)
}

execute.onclick = e => {
  const commandStr = input.value
  turtle.process(commandStr)
  mainLayer.clear()
  turtle.draw(ctx)
}

canvasDiv.onclick = e => {
  mainLayer.clear()
  turtle.position.setVec(e.offsetX, e.offsetY)
  turtle.draw(ctx)
}