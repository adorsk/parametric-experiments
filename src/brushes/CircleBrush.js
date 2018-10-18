export class CircleBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke ({stroke}) {
    const { events, color } = {
      color: 'black',
      ...stroke
    }
    this.ctx.fillStyle = color
    for (let e of events) {
      // @TODO: improve performance here?
      this.ctx.beginPath()
      this.ctx.arc(e.pos.x, e.pos.y, e.pressure, 0, Math.PI * 2)
      this.ctx.fill()
    }
	}
}

export default CircleBrush
