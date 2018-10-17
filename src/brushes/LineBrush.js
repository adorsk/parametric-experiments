const BRUSH_SIZE = 1


class LineBrush {
  constructor ({ctx}) {
    this.ctx = ctx
	}

  startStroke ({point}) {
    this.prevPoint = point
	}

	continueStroke ({point, color = 'black', pressure = 1}) {
		this.ctx.beginPath()
		this.ctx.moveTo(this.prevPoint.x, this.prevPoint.y)
		this.ctx.lineTo(point.x, point.y)
    this.ctx.lineWidth = BRUSH_SIZE + (2 * pressure)
    this.ctx.strokeStyle = color
		this.ctx.stroke()
		this.prevPoint = point
	}

	endStroke () {
	}
}

export default LineBrush
