const BRUSH_SIZE = 1


export class LineBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  stroke (opts) {
    const { shape, pressure, color } = {
      pressure: 1, 
      color: 'black',
      ...opts
    }
    this.ctx.lineWidth = BRUSH_SIZE + (2 * pressure)
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
		this.ctx.stroke(new Path2D(shape.path))
	}
}

export default LineBrush
