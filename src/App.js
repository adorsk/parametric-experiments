import { connect } from 'react-redux'

import React from 'react'

import Prng from './Prng.js'
import Brushes from './brushes/index.js'



class App extends React.Component {
  constructor (opts) {
    super(opts)
    this.canvasRef = React.createRef()
    this.prng = new Prng({seed: this.props.prngSeed})
    this._frameCounter = 0
  }

  _setState (updates) {
    this.props.dispatch({type: 'setAppState', payload: updates})
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
    return drawCtx
  }

  render() {
    this.prng.setSeed(this.props.prngSeed)
    return (
      <div>
        {this.renderInputs()}
        <canvas
          width={300}
          height={300}
          ref={this.canvasRef}
        />
      </div>
    )
  }

  renderInputs () {
    return (
      <div>
        <div>
          prng seed
          <input
            type="number"
            value={this.props.prngSeed}
            onChange={(e) => {
              this._setState({prngSeed: parseInt(e.target.value, 10)})
            }}
          />
        </div>
        <div>
          {['tStep', 'tStart', 'tEnd'].map((key) => {
            return (
              <span key={key}>
                {key}
                <input type="number"
                  value={this.props[key]}
                  onChange={(e) => {
                    try {
                      const nextVal = parseFloat(e.target.value)
                      if (isNaN(nextVal)) { return }
                      if (key === 'tStep' && nextVal === 0) { return }
                      this._setState({[key]: nextVal})
                    } catch (e) {}
                  }}
                />
              </span>
            )
          })}
          <div>
            brush
            <select
              value={this.props.brushKey}
              onChange={(e) => {
                this._setState({brushKey: e.target.value})
              }}
            >
              {
                Object.keys(Brushes).sort().map((key) => {
                  return (
                    <option key={key} value={key}>{key}</option>
                  )
                })
              }
            </select>
          </div>
        </div>
      </div>
    )
  }

  componentDidUpdate () {
    this.drawRange()
  }

  drawRange () {
    const { tStart, tEnd, tStep } = this.props
    this.clearCanvas()

    const pathPoints = []
    for (let t = tStart; t < tEnd; t += tStep) {
      pathPoints.push(this.pathFn({t}))
    }

    const strokes = []
    const pointsToPathShape = ({startPoint, endPoint}) => {
      return {
        path: (
          [
            `M${startPoint.x} ${startPoint.y}`,
            `L${endPoint.x} ${endPoint.y}`,
          ].join(' ')
        ),
        centroid: this.getCentroid({points: [startPoint, endPoint]}),
      }
    }
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const stroke = {
        shape: pointsToPathShape({
          startPoint: pathPoints[i],
          endPoint: pathPoints[i + 1],
        })
      }
      strokes.push(stroke)
    }

    this.brushStrokes({strokes})
  }

  pathFn ({t, maxJitter = 1 }) {
    const { center } = this.drawCtx
    const jitter = () => this.prng.randomFloat({min: -maxJitter, max: maxJitter})
    return {
      x: center.x + (t * Math.cos(t)) + jitter(),
      y: center.y + (t * Math.sin(t)) + jitter(),
    }
  }

  brushStrokes ({strokes}) {
    const { brushKey } = this.props
    const { center } = this.drawCtx
    const brush = new Brushes[brushKey]({ctx: this.ctx})
    for (let stroke of strokes) {
      const bearing = this.getBearing(center, stroke.shape.centroid)
      const angularT = bearing / 360
      const colorT = Math.floor(255 * angularT)
      const rgb = [
        colorT % 255,
        (128 + colorT) % 255,
        (64 + colorT) % 255
      ]
      const color = `rgb(${rgb.join(',')})`
      brush.stroke({
        ...stroke,
        color,
        pressure: this.prng.randomFloat({min: 1, max: 2}),
      })
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
  return state.app || {}
}

export default connect(mapStateToProps)(App)
