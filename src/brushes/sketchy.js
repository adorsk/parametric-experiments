const BRUSH_SIZE = 1
const BRUSH_PRESSURE = 1

class SketchyBrush {
  constructor (ctx) {
    this.ctx = ctx
	}

  startStroke ({point}) {
    this.prevPoint = point
	}

	stroke ({point}) {
		this.ctx.lineWidth = BRUSH_SIZE
		this.ctx.beginPath()
		this.ctx.moveTo(this.prevPoint.x, this.prevPoint.y)
		this.ctx.lineTo(point.x, point.y)
		this.ctx.stroke()
		this.prevPoint = point
	},

	endStroke: function() {
	}
}
