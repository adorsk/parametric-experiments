import { connect } from 'react-redux'

import React from 'react'

import Prng from './Prng.js'
import LineBrush from './brushes/LineBrush.js'


class App extends React.Component {
  constructor (opts) {
    super(opts)
    this.state = {
      prngSeed: 1,
      isPlaying: false,
      tStep: .01,
      tStart: 0,
      tEnd: 10 * (2 * Math.PI),
    }
    this.canvasRef = React.createRef()
    this.prng = new Prng({seed: this.state.prngSeed})
    this._frameCounter = 0
    this._boundFns = {
      onAnimationFrame: this.onAnimationFrame.bind(this),
      reset: () => {
        this.clearCanvas()
        this._frameCounter = 0
      },
    }
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
          playing?
          <input type="checkbox"
            checked={this.state.isPlaying}
            onChange={(e) => {
              this.setState({isPlaying: e.target.checked})
            }}
          />
        </div>
        <div>
          <button onClick={this._boundFns.reset}>
            reset
          </button>
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
    if (this.state.isPlaying) {
      requestAnimationFrame(this._boundFns.onAnimationFrame)
    } else {
      this.drawRange()
    }
  }

  drawRange () {
    const { tStart, tEnd, tStep } = this.state
    this.clearCanvas()
    this.drawCtx.prevPoint = this.pathFn({t: tStart})
    for (let t = tStart; t < tEnd; t += tStep) {
      this.draw({t})
    }
  }

  onAnimationFrame () {
    if (! this.state.isPlaying) { return }
    this._frameCounter++
    this.draw({t: .05 * this._frameCounter})
    requestAnimationFrame(this._boundFns.onAnimationFrame)
  }

  draw ({t}) {
    const { prevPoint, brush } = this.drawCtx
    const nextPoint = this.pathFn({t})
    const angle = t % (2 * Math.PI)
    const angularT = angle / (2 * Math.PI)
    const colorT = (t * Math.floor(255 * angularT) + this.prng.randomInt({max: 5})) % 255
    const rgb = [
      colorT % 255,
      (128 + colorT) % 255,
      (64 + colorT) % 255
    ]
    const color = `rgb(${rgb.join(',')})`
    brush.startStroke({point: prevPoint})
    brush.continueStroke({
      point: nextPoint,
      pressure: this.prng.random(),
      color 
    })
    brush.endStroke()
    this.drawCtx.prevPoint = nextPoint
  }

  pathFn ({t}) {
    const { center } = this.drawCtx
    return {
      x: center.x + (t * Math.cos(t)),
      y: center.y + (t * Math.sin(t)),
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

export default connect(mapStateToProps)(App)
