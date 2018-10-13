import { connect } from 'react-redux'

import React from 'react'

import Prng from './Prng.js'


class App extends React.Component {
  constructor (opts) {
    super(opts)
    this.state = {
      prngSeed: 1,
    }
    this.canvasRef = React.createRef()
    this.prng = new Prng({seed: this.state.prngSeed})
  }

  componentDidMount () {
    this.ctx = this.canvasRef.current.getContext('2d')
    this.updateCanvas()
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
              this.setState({prngSeed: parseInt(e.currentTarget.value, 10)})
            }}
          />
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
    this.updateCanvas()
  }

  updateCanvas () {
    const rgb = [Math.floor(255 * Math.random()), 255, 255]
    this.ctx.fillStyle = `rgb(${rgb.join(',')})`
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

export default connect(mapStateToProps)(App)
