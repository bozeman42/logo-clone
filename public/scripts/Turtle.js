import { Vec2 } from './math.js'

class Turtle {
  constructor(x, y, angle, size = 25, drawingLayer) {
    this.position = new Vec2(x,y)
    this.size = size
    this.direction = new Vec2(0,0)
    this.color = 'black'
    this.setAngle(angle)
    this._drawingLayer = drawingLayer
    this.penDown = true
  }
  
  static dupleCmds = ['fd', 'bk', 'lt', 'rt']
  static singleCmds = ['pu', 'pd']
  
  setAngle(angle) {
    const { size } = this
    this.angle = angle
    this.direction.setByAngLen(this.angle - 90, size + size / 5)
  }

  rt(angle) {
    this.setAngle(this.angle + angle)
  }

  lt(angle) {
    this.rt(-angle)
  }

  fd(length) {
    const [ dx, dy ] = this.direction.direction(length)
    if (this.penDown) {
      const [ x, y ] = this.position.coords
      const { ctx } = this._drawingLayer
      ctx.beginPath()
      ctx.moveTo(x,y)
      ctx.lineTo(x + dx, y + dy)
      ctx.stroke()
    }
    this.position.translate(dx, dy)
  }

  bk(length) {
    this.fd(-length)
  }

  pu() {
    this.penDown = false
  }

  pd() {
    this.penDown = true
  }

  draw(ctx) {
    const { position, direction, size } = this
    const [x,y] = position.coords
    const [ dirX, dirY ] = direction.direction(size)
    const drawVec = new Vec2(dirX, dirY)
    ctx.beginPath()
    ctx.arc(x,y,size,0,Math.PI * 2)
    ctx.stroke()
    
    drawVec.rotate(45)
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      let [legx, legy] = drawVec.direction(size + size / 4)
      ctx.arc(x + legx, y + legy, size / 4, 0, Math.PI * 2)
      ctx.stroke()
      drawVec.rotate(90)
    }
    drawVec.rotate(-45)
    ctx.beginPath()
    const [headX, headY] = drawVec.direction(size + size / 3.5)
    ctx.arc(x + headX, y + headY, size / 3.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.drawImage(this._drawingLayer.canvas, 0,0)
  }

  process(cmdStr) {
    const tokens = cmdStr.split(' ')
    let commandList = []
    try {
      while (tokens.length) {
        if (validSingle(tokens[0])) {
          commandList = [
            ...commandList,
            { command: tokens.shift() }
          ]
        } else if (validDuple(tokens[0], tokens[1])) {
          commandList = [
            ...commandList,
            {
              command: tokens.shift(),
              argument: parseInt(tokens.shift())
            }
          ]
        } else {
          console.error(`Invalid token: ${tokens.shift()}`)
        }
      }
    } catch (error) {
      console.error(error)
    }
    commandList.forEach(cmd => {
      const { command, argument } = cmd
      this[command](argument)
    })
  }

}

function drawTurtle(turtle, ctx) {
  const size = dirVec.magnitude
  ctx.beginPath()
  ctx.arc(x,y,size,0,Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x,y)
  const [x1,y1] = dirVec.direction(size + (size / 5))
  ctx.lineTo(x + x1,y + y1)
  ctx.stroke()

}

function validDuple(cmd, val) {
  const { dupleCmds } = Turtle
  return dupleCmds.includes(cmd) && !isNaN(parseInt(val))
}

function validSingle(cmd) {
  const { singleCmds } = Turtle
  return singleCmds.includes(cmd)
}

export default Turtle
