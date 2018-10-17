export class CircleBrush {
  constructor ({ctx}) {
    this.ctx = ctx
    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	}

  stroke (opts) {
    const { shape, pressure, color } = {
      pressure: 1, 
      color: 'black',
      ...opts
    }
    const radius = pressure
    this.ctx.fillStyle = color
    this.pathEl.setAttribute('d', shape.path)
    const length = this.pathEl.getTotalLength()
    for (let t = 0; t < length; t += radius) {
      const point = this.pathEl.getPointAtLength(t)
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }
	}
}

export default CircleBrush
