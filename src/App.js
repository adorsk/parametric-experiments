import { connect } from 'react-redux'

import React from 'react'

import Prng from './Prng.js'
import LineBrush from './brushes/LineBrush.js'


class App extends React.Component {
  constructor (opts) {
    super(opts)
    this.state = {
      prngSeed: 1,
      tStep: .01,
      tStart: 0,
      tEnd: 50 * (2 * Math.PI),
    }
    this.canvasRef = React.createRef()
    this.prng = new Prng({seed: this.state.prngSeed})
    this._frameCounter = 0
  }

  clearCanvas () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  componentDidMount () {
    this.ctx = this.canvasRef.current.getContext('2d')
    this.drawCtx = this.setupDrawCtx()
    this.drawRange()
  }

  setupDrawCtx () {
    const drawCtx = {}
    drawCtx.center = {
      x: this.ctx.canvas.width / 2,
      y: this.ctx.canvas.height / 2
    }
    drawCtx.prevPoint = drawCtx.center
    drawCtx.brush = new LineBrush({ctx: this.ctx})
    return drawCtx
  }

  render() {
    this.prng.setSeed(this.state.prngSeed)
    return (
      <div>
        <div>
          prng seed
          <input type="number"
            value={this.state.prngSeed}
            onChange={(e) => {
              this.setState({prngSeed: parseInt(e.target.value, 10)})
            }}
          />
        </div>
        <div>
          {['tStep', 'tStart', 'tEnd'].map((key) => {
            return (
              <span key={key}>
                {key}
                <input type="number"
                  value={this.state[key]}
                  onChange={(e) => {
                    try {
                      const nextVal = parseFloat(e.target.value)
                      if (isNaN(nextVal)) { return }
                      if (key === 'tStep' && nextVal === 0) { return }
                      this.setState({[key]: nextVal})
                    } catch (e) {}
                  }}
                />
              </span>
            )
          })}
        </div>
        <canvas
          width={300}
          height={300}
          ref={this.canvasRef}
        />
      </div>
    )
  }

  componentDidUpdate () {
    this.drawRange()
  }

  drawRange () {
    const { tStart, tEnd, tStep } = this.state
    this.clearCanvas()

    const pathPoints = []
    for (let t = tStart; t < tEnd; t += tStep) {
      pathPoints.push(this.pathFn({t}))
    }

    const strokes = []
    for (let i = 0; i < pathPoints.length - 1; i++) {
      strokes.push({
        start: pathPoints[i],
        end: pathPoints[i + 1]
      })
    }

    this.brushStrokes({strokes, brush: this.drawCtx.brush})
  }

  pathFn ({t, maxJitter = 1 }) {
    const { center } = this.drawCtx
    const jitter = () => this.prng.randomFloat({min: -maxJitter, max: maxJitter})
    return {
      x: center.x + (t * Math.cos(t)) + jitter(),
      y: center.y + (t * Math.sin(t)) + jitter(),
    }
  }

  brushStrokes ({strokes, brush}) {
    const { center } = this.drawCtx
    for (let stroke of strokes) {
      const strokeCenter = this.getCentroid({points: [stroke.start, stroke.end]})
      const bearing = this.getBearing(center, strokeCenter)
      const angularT = bearing / 360
      const colorT = Math.floor(255 * angularT)
      const rgb = [
        colorT % 255,
        (128 + colorT) % 255,
        (64 + colorT) % 255
      ]
      const color = `rgb(${rgb.join(',')})`
      brush.startStroke({point: stroke.start})
      brush.continueStroke({
        point: stroke.end,
        pressure: this.prng.random(),
        color 
      })
      brush.endStroke()
    }
  }

  getCentroid ({points}) {
    const sums = {x: 0, y: 0}
    for (let point of points) {
      sums.x += point.x
      sums.y += point.y
    }
    return {
      x: sums.x / points.length,
      y: sums.y / points.length
    }
  }

  getBearing (p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

export default connect(mapStateToProps)(App)
