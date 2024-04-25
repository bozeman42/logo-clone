class Layer {
  constructor(width, height) {
    this._height = height
    this._width = width
    this._setupCanvas()
  }

  _setupCanvas() {
    const { _width: w, _height: h} = this
    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    this.ctx = this.canvas.getContext('2d')
  }

  clear() {
    this.ctx.beginPath()
    this.ctx.clearRect(0,0,this._width, this._height)
  }
  draw(ctx) {
    ctx.drawImage(this.canvas, 0, 0)
  }
}

export default Layer
