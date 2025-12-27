import { configureStore } from '@reduxjs/toolkit'
import variableReducer from './variableSlice'

export const store = configureStore({
  reducer: {
    variable: variableReducer
  },
})