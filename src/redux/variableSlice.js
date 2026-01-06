import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    duration: '0',
    transfer: {Rx: [0, 'B'], Tx: [0, 'B']}
}

export const variableSlice = createSlice({
    name: 'variable',
    initialState,
    reducers: {
        updateDuration: (state, action) => {
            state.duration = action.payload
        },
        updateTransfer: (state, action) => {
            state.transfer = {
                Rx: action.payload.Rx,
                Tx: action.payload.Tx
            }
        }
    }
})

export const { updateDuration, updateTransfer } = variableSlice.actions
export default variableSlice.reducer