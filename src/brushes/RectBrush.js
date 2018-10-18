export class RectBrush {
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
      this.ctx.fillRect(
        e.pos.x - (e.pressure / 2),
        e.pos.y - (e.pressure / 2),
        e.pressure,
        e.pressure
      )
    }
	}
}

export default RectBrush
