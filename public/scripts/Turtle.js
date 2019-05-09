import { Vec2 } from './math.js'

class Turtle {
  constructor(x, y, angle, size = 25, processingInterval = 10, drawingLayer, commandDisplay) {
    this.position = new Vec2(x,y)
    this.size = size
    this.direction = new Vec2(0,0)
    this.color = 'black'
    this.setAngle(angle)
    this._drawingLayer = drawingLayer
    this.penDown = true
    this.commandList = []
    this.processing = false
    this.processingInterval = processingInterval
    this.commandTimer = null
    this.commandDisplay = commandDisplay
    this.dupleCmds = ['fd', 'bk', 'lt', 'rt']
    this.singleCmds = ['pu', 'pd', 'cs']
  }
  
  
  setAngle(angle) {
    const { size } = this
    this._angle = angle
    this.direction.setByAngLen(this._angle - 90, size + size / 5)
    return this
  }

  setProcessingInterval(time, layer) {
    this.processingInterval = time
    clearInterval(this.commandTimer)
    this.processing = false
    this.process('', layer)
  }

  rt(angle) {
    this.setAngle(this._angle + angle)
    return this
  }

  lt(angle) {
    this.rt(-angle)
    return this
  }

  setSize(size) {
    this.size = size
    return this
  }

  cs () {
    this._drawingLayer.clear()
    this._drawingLayer.ctx.stroke()
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
    return this
  }

  bk(length) {
    this.fd(-length)
    return this
  }

  pu() {
    this.penDown = false
    return this
  }

  pd() {
    this.penDown = true
    return this
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
    return this
  }

  displayCommands() {
    this.commandDisplay.innerHTML = ''
    const list = document.createElement('ul')
    const count = document.createElement('p')
    count.innerText = `Commands queued: ${this.commandList.length}`
    this.commandDisplay.appendChild(count)
    this.commandList.forEach((cmd, index) => {
      const item = document.createElement('li')
      let textType
      if (index === 0) {
        textType = document.createElement('h2')
      } else {
        textType = document.createElement('p')
      }
      const { command, argument } = cmd
      const text = `${command}${(argument ? ` ${argument}` : null)}`
      textType.innerText = text
      item.appendChild(textType)
      list.appendChild(item)
    })
    this.commandDisplay.appendChild(list)
  }

  process(cmdStr, layer) {
    const tokens = cmdStr.split(' ').map(token => token.toLowerCase())
    try {
      while (tokens.length) {
        if (validSingle(tokens[0], this)) {
          this.commandList = [
            ...this.commandList,
            { command: tokens.shift() }
          ]
        } else if (validDuple(tokens[0], tokens[1], this)) {
          this.commandList = [
            ...this.commandList,
            {
              command: tokens.shift(),
              argument: parseInt(tokens.shift())
            }
          ]
        } else {
          console.error(`Invalid token: ${tokens.shift()}`)
        }
      }
      this.displayCommands()
    } catch (error) {
      console.error(error)
    }
    if (!this.processing) {
      this.processing = true
      this.commandTimer = setInterval(() => {
        const command = this.commandList.shift()
        console.log(command)
        if (command) {
          this[command.command](command.argument)
          layer.clear()
          this.draw(layer.ctx)
          this.displayCommands()
        } else {
          this.processing = false
          clearInterval(this.commandTimer)
        }
      }, this.processingInterval)
    }
    return this
  }
}

function validDuple(cmd, val, turtle) {
  const { dupleCmds } = turtle
  return dupleCmds.includes(cmd) && !isNaN(parseInt(val))
}

function validSingle(cmd, turtle) {
  const { singleCmds } = turtle
  return singleCmds.includes(cmd)
}

export default Turtle
