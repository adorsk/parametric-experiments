const colorMaps = {}

const hslToColorStr = ({hsl}) => {
  return `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`
}

colorMaps.hslWheel = ({t}) => {
  const hsl = {
    h: t,
    s: .5,
    l: .5
  }
  return hslToColorStr({hsl})
}

colorMaps.grayscale = ({t}) => {
  const hsl = {
    h: 0,
    s: 0,
    l: t
  }
  return hslToColorStr({hsl})
}

colorMaps.redGreen = ({t, random = Math.random}) => {
  const numSegments = 36
  const hsl = {
    h: ((
      (Math.round(t * numSegments) % 2) ? 0 : .5
      + (0.1 * random())
    ) % 1),
    s: .5,
    l: .5
  }
  return hslToColorStr({hsl})
}

export default colorMaps
