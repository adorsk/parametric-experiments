export class CircleBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke (opts) {
    const { stroke, pressure, color } = {
      pressure: ({e}) => e.pressure,
      color: () => '#000000',
      ...opts
    }
    for (let i = 0; i < stroke.events.length; i++) {
      const e = stroke.events[i]
      const styleFnParams = {e, idx: i}
      this.ctx.beginPath()
      this.ctx.arc(e.pos.x, e.pos.y, pressure(styleFnParams), 0, Math.PI * 2)
      this.ctx.fillStyle = color(styleFnParams)
      this.ctx.fill()
    }
	}
}

export default CircleBrush
