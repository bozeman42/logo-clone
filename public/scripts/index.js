import Turtle from './Turtle.js'
import Layer from './Layer.js'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const input = document.getElementById('input')
const execute = document.getElementById('execute')
const canvasDiv = document.getElementById('logo')
const clearButton = document.getElementById('clear')
const sizeInput = document.getElementById('size-input')
const durationInput = document.getElementById('duration-input')
const display = document.getElementById('commandQueue')

const turtleLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT)
const { canvas, ctx } = turtleLayer

canvasDiv.appendChild(canvas)

const drawLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT)
const turtle = new Turtle(400, 300, 0, parseInt(sizeInput.value), parseInt(durationInput.value), drawLayer, display)
turtle.draw(ctx)

sizeInput.oninput = e => {
  turtle.setSize(parseInt(e.target.value))
  turtleLayer.clear()
  turtle.draw(ctx)
}

durationInput.oninput = e => {
  turtle.setProcessingInterval(parseInt(e.target.value), turtleLayer)
}

clearButton.onclick = () => {
  turtleLayer.clear()
  drawLayer.clear()
  turtle.draw(ctx)
}

execute.onclick = e => {
  const commandStr = input.value
  turtle.process(commandStr, turtleLayer)
  turtleLayer.clear()
  turtle.draw(ctx)
}

canvasDiv.onclick = e => {
  turtleLayer.clear()
  turtle.position.setVec(e.offsetX, e.offsetY)
  turtle.draw(ctx)
}