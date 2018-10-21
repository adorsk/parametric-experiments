import Offset from 'polygon-offset'


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
pathGenerators.expandingLissajous.isParametric = true

pathGenerators.nestedRects = ({drawCtx}) => {
  const paths = []
  const bbox = drawCtx.bbox
  const outerVerts = [
    [bbox.x, bbox.y],
    [bbox.x, bbox.y + bbox.height],
    [bbox.x + bbox.width, bbox.y + bbox.height],
    [bbox.x + bbox.width, bbox.y],
    [bbox.x, bbox.y]
  ]
  const offsetFactory = new Offset().data([outerVerts])
  const numInnerPaths = 30
  const bufferSize = (drawCtx.bbox.width / 2) / numInnerPaths
  for (let i = 0; i < numInnerPaths; i++) {
    try {
      const innerVertsSet = offsetFactory.padding(bufferSize * i)
      for (let innerVerts of innerVertsSet) { 
        const points = innerVerts.map((p) => ({x: p[0], y: p[1]}))
        const path = {points}
        paths.push(path)
      }
    } catch (e) {}
  }
  return paths
}
pathGenerators.nestedRects.isParametric = false


pathGenerators.nestedRando = ({drawCtx, prng}) => {
  const paths = []
  const bbox = drawCtx.bbox
  prng.randomInt({min: 3, max: 12})
  const numVerts = prng.randomInt({min: 3, max: 12})
  const outerVerts = Object.keys([...Array(numVerts)]).map((i) => {
    return [
      prng.randomInt({max: bbox.width}),
      prng.randomInt({max: bbox.height})
    ]
  })
  outerVerts.push(outerVerts[0])
  // make inner paths
  const offsetFactory = new Offset().data([outerVerts])
  const numInnerPaths = 30
  const bufferSize = (drawCtx.bbox.width / 2) / numInnerPaths
  for (let i = 0; i < numInnerPaths; i++) {
    try {
      const innerVertsSet = offsetFactory.padding(bufferSize * i)
      for (let innerVerts of innerVertsSet) { 
        const points = innerVerts.map((p) => ({x: p[0], y: p[1]}))
        const path = {points}
        paths.push(path)
      }
    } catch (e) { break }
  }
  return paths
}
pathGenerators.nestedRando.isParametric = false

export default pathGenerators
