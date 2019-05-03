(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  const { cos, sin, PI } = Math;

  class Vec2 {
    constructor(x = 0, y = 0) {
      this._x = x;
      this._y = y;
    }

    setByAngLen(angle = 0, length = 1) {
      this._x = length * cos(angle / 360 * 2 * PI);
      this._y = length * sin(angle / 360 * 2 * PI);
    }

    get x() {
      return this._x
    }
    get y() {
      return this._y
    }

    get angle() {
      return 
    }

    rotate(angle) {
      const { _x, _y } = this;
      const { PI, cos, sin } = Math;
      const rad = angle * ( PI / 180 );
      this.setVec(_x * cos(rad) - _y * sin(rad), _x * sin(rad) + _y * cos(rad));
    }

    setVec (x, y) {
      this._x = x,
      this._y = y;
    }

    get coords () {
      return [ this.x, this.y ]
    }

    get magnitude() {
      const { x, y } = this;
      return Math.sqrt(Math.pow(x, 2) + Math.pow(y,2))
    }

    set magnitude(length) {
      this.setVec(length * (this._x / this.magnitude), length * (this._y / this.magnitude));
    }

    direction (length = 1) {
      return [
        length * (this._x / this.magnitude),
        length * (this._y / this.magnitude)
      ]
    }

    translate(x,y) {
      this._x += x;
      this._y += y;
    }
  }

  class Turtle {
    constructor(x, y, angle, size = 25, processingInterval = 10, drawingLayer) {
      this.position = new Vec2(x,y);
      this.size = size;
      this.direction = new Vec2(0,0);
      this.color = 'black';
      this.setAngle(angle);
      this._drawingLayer = drawingLayer;
      this.penDown = true;
      this.commandList = [];
      this.processing = false;
      this.processingInterval = processingInterval;
      this.commandTimer = null;
      this.dupleCmds = ['fd', 'bk', 'lt', 'rt'];
      this.singleCmds = ['pu', 'pd'];
    }
    
    
    setAngle(angle) {
      const { size } = this;
      this.angle = angle;
      this.direction.setByAngLen(this.angle - 90, size + size / 5);
      return this
    }

    setProcessingInterval(time, layer) {
      this.processingInterval = time;
      clearInterval(this.commandTimer);
      this.processing = false;
      this.process('', layer);
    }

    rt(angle) {
      this.setAngle(this.angle + angle);
      return this
    }

    lt(angle) {
      this.rt(-angle);
      return this
    }

    setSize(size) {
      this.size = size;
      return this
    }

    fd(length) {
      const [ dx, dy ] = this.direction.direction(length);
      if (this.penDown) {
        const [ x, y ] = this.position.coords;
        const { ctx } = this._drawingLayer;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
      this.position.translate(dx, dy);
      return this
    }

    bk(length) {
      this.fd(-length);
      return this
    }

    pu() {
      this.penDown = false;
      return this
    }

    pd() {
      this.penDown = true;
      return this
    }

    draw(ctx) {
      const { position, direction, size } = this;
      const [x,y] = position.coords;
      const [ dirX, dirY ] = direction.direction(size);
      const drawVec = new Vec2(dirX, dirY);
      ctx.beginPath();
      ctx.arc(x,y,size,0,Math.PI * 2);
      ctx.stroke();
      
      drawVec.rotate(45);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        let [legx, legy] = drawVec.direction(size + size / 4);
        ctx.arc(x + legx, y + legy, size / 4, 0, Math.PI * 2);
        ctx.stroke();
        drawVec.rotate(90);
      }
      drawVec.rotate(-45);
      ctx.beginPath();
      const [headX, headY] = drawVec.direction(size + size / 3.5);
      ctx.arc(x + headX, y + headY, size / 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.drawImage(this._drawingLayer.canvas, 0,0);
      return this
    }

    process(cmdStr, layer) {
      const tokens = cmdStr.split(' ').map(token => token.toLowerCase());
      try {
        while (tokens.length) {
          if (validSingle(tokens[0], this)) {
            this.commandList = [
              ...this.commandList,
              { command: tokens.shift() }
            ];
          } else if (validDuple(tokens[0], tokens[1], this)) {
            this.commandList = [
              ...this.commandList,
              {
                command: tokens.shift(),
                argument: parseInt(tokens.shift())
              }
            ];
          } else {
            console.error(`Invalid token: ${tokens.shift()}`);
          }
        }
      } catch (error) {
        console.error(error);
      }

      // use this for maximum speed processing
      // this.commandList.forEach(cmd => {
      //   const { command, argument } = cmd
      //   this[command](argument)
      // })

      
      if (!this.processing) {
        this.processing = true;
        this.commandTimer = setInterval(() => {
          const command = this.commandList.shift();
          console.log(command);
          if (command) {
            this[command.command](command.argument);
            layer.clear();
            this.draw(layer.ctx);
          } else {
            this.processing = false;
            clearInterval(this.commandTimer);
          }
        }, this.processingInterval);
      }
      return this
    }

  }

  function validDuple(cmd, val, turtle) {
    const { dupleCmds } = turtle;
    return dupleCmds.includes(cmd) && !isNaN(parseInt(val))
  }

  function validSingle(cmd, turtle) {
    const { singleCmds } = turtle;
    return singleCmds.includes(cmd)
  }

  class Layer {
    constructor(width, height) {
      this._height = height;
      this._width = width;
      this._setupCanvas();
    }

    _setupCanvas() {
      const { _width: w, _height: h} = this;
      this.canvas = document.createElement('canvas');
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx = this.canvas.getContext('2d');
    }

    clear() {
      this.ctx.clearRect(0,0,this._width, this._height);
    }
    draw(ctx) {
      ctx.drawImage(this.canvas, 0, 0);
    }
  }

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const input = document.getElementById('input');
  const execute = document.getElementById('execute');
  const canvasDiv = document.getElementById('logo');
  const clearButton = document.getElementById('clear');
  const sizeInput = document.getElementById('size-input');
  const durationInput = document.getElementById('duration-input');


  const turtleLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT);
  const { canvas, ctx } = turtleLayer;

  canvasDiv.appendChild(canvas);

  const drawLayer = new Layer(CANVAS_WIDTH, CANVAS_HEIGHT);
  const turtle = new Turtle(400, 300, 0, parseInt(sizeInput.value), parseInt(durationInput.value), drawLayer);
  turtle.draw(ctx);

  sizeInput.oninput = e => {
    turtle.setSize(parseInt(e.target.value));
    turtleLayer.clear();
    turtle.draw(ctx);
  };

  durationInput.oninput = e => {
    turtle.setProcessingInterval(parseInt(e.target.value), turtleLayer);
  };

  clearButton.onclick = () => {
    turtleLayer.clear();
    drawLayer.clear();
    turtle.draw(ctx);
  };

  execute.onclick = e => {
    const commandStr = input.value;
    turtle.process(commandStr, turtleLayer);
    turtleLayer.clear();
    turtle.draw(ctx);
  };

  canvasDiv.onclick = e => {
    turtleLayer.clear();
    turtle.position.setVec(e.offsetX, e.offsetY);
    turtle.draw(ctx);
  };

}));
