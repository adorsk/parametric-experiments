export class RectBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke (opts) {
    const { stroke, pressure, color } = {
      pressure: (e) => e.pressure,
      color: () => 'black',
      ...opts
    }
    for (let i = 0; i < stroke.events.length; i++) {
      const e = stroke.events[i]
      const styleFnParams = {e: e, idx: i}
      const size = pressure(styleFnParams)
      this.ctx.fillStyle = color(styleFnParams)
      this.ctx.fillRect(
        e.pos.x - (size / 2),
        e.pos.y - (size / 2),
        size,
        size 
      )
    }
	}
}

export default RectBrush
