import { createStore, applyMiddleware } from "redux"
import logger from 'redux-logger'

import thunk from "redux-thunk"

import reducer from "./reducer"

export default function configureStore(preloadedState) {
  const store = createStore(
    reducer,
    preloadedState,
    applyMiddleware(thunk, logger)
  )

  if(process.env.NODE_ENV !== "production") {
    if(module.hot) {
      module.hot.accept("./reducer", () =>{
        const newReducer = require("./reducer").default
        store.replaceReducer(newReducer)
      })
    }
  }
  return store
}
