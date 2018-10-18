export class LineBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke ({stroke}) {
    const { events, pressure, color } = {
      color: 'black',
      ...stroke
    }
    this.ctx.strokeStyle = color
    for (let i = 0; i < events.length - 1; i++) {
      const [e1, e2] = [events[i], events[i + 1]]
      this.ctx.beginPath()
      this.ctx.moveTo(e1.pos.x, e1.pos.y)
      this.ctx.lineTo(e2.pos.x, e2.pos.y)
      this.ctx.lineWidth = pressure
      this.ctx.stroke()
    }
	}
}

export default LineBrush
