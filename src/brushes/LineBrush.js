export class LineBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke (opts) {
    const { stroke, pressure, color } = {
      pressure: ({e}) => e.pressure,
      color: () => 'black',
      ...opts
    }
    const events = stroke.events
    for (let i = 0; i < events.length - 1; i++) {
      const [e1, e2] = [events[i], events[i + 1]]
      const styleFnParams = {e: e1, idx: i}
      this.ctx.beginPath()
      this.ctx.moveTo(e1.pos.x, e1.pos.y)
      this.ctx.lineTo(e2.pos.x, e2.pos.y)
      this.ctx.lineWidth = pressure(styleFnParams)
      this.ctx.strokeStyle = color(styleFnParams)
      this.ctx.stroke()
    }
	}
}

export default LineBrush
