import { connect } from 'react-redux'
import _ from 'lodash'

import React from 'react'

import Prng from './Prng.js'
import Brushes from './brushes/index.js'
import colorMaps from './colorMaps.js'
import pathGenerators from './pathGenerators.js'



class App extends React.Component {
  constructor (opts) {
    super(opts)
    this.canvasRef = React.createRef()
    this.bgCanvasRef = React.createRef()
    this.prng = new Prng({seed: this.props.prngSeed})
    this._frameCounter = 0
    this._debounced = {
      drawRange: _.debounce(this.drawRange.bind(this), 200),
    }
  }

  _setState (updates) {
    this.props.dispatch({type: 'setAppState', payload: updates})
  }

  clearCanvas () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  componentDidMount () {
    this.ctx = this.canvasRef.current.getContext('2d')
    this.bgCtx = this.bgCanvasRef.current.getContext('2d')
    this.drawCtx = this.setupDrawCtx()
    this.updateBg()
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
    const canvasDims = {width: 300, height: 300}
    return (
      <div>
        {this.renderInputs()}
        <div
          style={{
            position: 'relative',
            ...canvasDims,
          }}
        >
          <canvas
            {...canvasDims}
            ref={this.bgCanvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          />
          <canvas
            {...canvasDims}
            ref={this.canvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          />
        </div>
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
          bgColor
          <input
            type="color"
            value={this.props.bgColor}
            onChange={(e) => {
              this._setState({bgColor: e.target.value})
            }}
          />
        </div>
        <div>
          {['posJitter', 'tStep', 'tStart', 'tEnd'].map((key) => {
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
          <div>
            colorMap
            <select
              value={this.props.colorMap}
              onChange={(e) => {
                this._setState({colorMap: e.target.value})
              }}
            >
              {
                Object.keys(colorMaps).sort().map((key) => {
                  return (
                    <option key={key} value={key}>{key}</option>
                  )
                })
              }
            </select>
          </div>
          <div>
            pathGeneratorKey
            <select
              value={this.props.pathGeneratorKey}
              onChange={(e) => {
                this._setState({pathGeneratorKey: e.target.value})
              }}
            >
              {
                Object.keys(pathGenerators).sort().map((key) => {
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

  componentDidUpdate (prevProps) {
    let dirtyKeys = []
    for (let key of Object.keys(this.props)) {
      if (this.props[key] !== prevProps[key]) {
        dirtyKeys[key] = key
      }
    }
    const onlyChangedBg = (dirtyKeys.length === 1 && dirtyKeys[0] === 'bgColor')
    this.updateBg()
    if (! onlyChangedBg) {
      this._debounced.drawRange()
    }
  }

  updateBg () {
    this.bgCtx.fillStyle = this.props.bgColor
    this.bgCtx.fillRect(0, 0, this.bgCtx.canvas.width, this.bgCtx.canvas.height)
  }

  drawRange () {
    this.clearCanvas()
    const pathPoints = this.generatePathPoints()
    const strokes = this.pathPointsToStrokes({pathPoints})
    this.brushStrokes({strokes})
  }

  generatePathPoints () {
    const { tStart, tEnd, tStep, posJitter, pathGeneratorKey } = this.props
    const pathPoints = []
    const pathGenerator = pathGenerators[pathGeneratorKey]
    const pathFn = ({t}) => pathGenerator({t, center: this.drawCtx.center})
    const jitterFn = () => this.prng.randomFloat({min: -posJitter, max: posJitter})
    for (let t = tStart; t < tEnd; t += tStep) {
      const point = pathFn({t})
      point.x += jitterFn()
      point.y += jitterFn()
      pathPoints.push(point)
    }
    return pathPoints
  }

  pathFn ({t, center }) {
    return {
      x: center.x + (t * Math.cos(t)),
      y: center.y + (t * Math.sin(t)),
    }
  }

  pathPointsToStrokes ({pathPoints}) {
    const { posJitter } = {posJitter: 5, ...this.props}
    const strokes = []
    const pressure = 1
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const [startPoint, endPoint] = [pathPoints[i], pathPoints[i + 1]]
      const events = [{pos: startPoint, pressure}]
      const dx = endPoint.x - startPoint.x
      const dy = endPoint.y - startPoint.y
      const d = Math.pow((Math.pow(dx, 2) + Math.pow(dy, 2)), .5)
      const velocity = 1e0
      const numPoints = d / velocity
      const stepSizes = {x: dx / numPoints, y: dy / numPoints}
      const genJitter = () => (
        this.prng.randomFloat({
          min: -posJitter,
          max: posJitter
        })
      )
      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints
        events.push({
          pos: {
            x: startPoint.x + (i * stepSizes.x) + genJitter(),
            y: startPoint.y + (i * stepSizes.y) + genJitter(),
          },
          pressure: this.pressureFn({t})
        })
      }
      events.push({pos: endPoint, pressure})
      const stroke = { events }
      strokes.push(stroke)
    }
    return strokes
  }

  pressureFn ({t}) {
    // return this.prng.random()
    return (
      .2 + 
      Math.abs(2 * Math.cos(t * 2 * Math.PI))
      + this.prng.randomFloat({min: -.1, max: .1})
    )
  }

  getDistance(p1, p2) {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.pow((Math.pow(dx, 2) + Math.pow(dy, 2)), .5)
  }

  brushStrokes ({strokes}) {
    const { brushKey } = this.props
    const featuresForStrokes = this.getFeaturesForStrokes({strokes})
    const brush = new Brushes[brushKey]({ctx: this.ctx})
    const colorMap = colorMaps[this.props.colorMap]
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i]
      const features = featuresForStrokes[i]
      const strokeColor = colorMap({
        t: features.bearing / 360,
        random: () => this.prng.randomFloat({min: -1, max: 1})
      })
      brush.stroke({
        stroke,
        color: () => strokeColor,
        pressure: (
          ({e}) => 3 * (features.distanceFromCenter * e.pressure) / this.ctx.canvas.height
        ),
      })
    }
  }

  getFeaturesForStrokes ({strokes}) {
    const { center } = this.drawCtx
    const featuresForStrokes = []
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i]
      const features = {}
      const startPos = stroke.events[0].pos
      const endPos = stroke.events[stroke.events.length - 1].pos
      features.bearing = this.getBearing(center, startPos)
      features.distanceFromCenter = this.getDistance(center, startPos)
      features.distanceTraveled = this.getDistance(startPos, endPos)
      featuresForStrokes.push(features)
    }
    return featuresForStrokes
  }

  getBearing (p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI
  }
}


const mapStateToProps = (state, ownProps) => {
  return state.app || {}
}

export default connect(mapStateToProps)(App)
