const pathGenerators = {}

pathGenerators.spiral = ({t, center}) => {
  return {
    x: center.x + (t * Math.cos(t)),
    y: center.y + (t * Math.sin(t)),
  }
}
pathGenerators.spiral.isParametric = true

pathGenerators.expandingLissajous = ({t, center}) => {
  const a = 1
  const b = 1
  const kx = 3
  const ky = 5
  const point = {
    x: (
      center.x + 
      (.5 * t * a * Math.cos(kx * t))
    ),
    y: (
      center.y +
      (.5 * t * b * Math.sin(ky * t))
    ),
  }
  return point
}

export default pathGenerators
