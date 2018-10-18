const initialState = {
  prngSeed: 1,
  tStep: 1e0,
  tStart: 0,
  tEnd: 50 * (2 * Math.PI),
  brushKey: 'line',
  posJitter: 5,
}

const reducer = (state = initialState, action) => {
  if (action.type === 'setAppState') {
    state = {...state, ...action.payload}
  }
  return state
}

export default reducer
