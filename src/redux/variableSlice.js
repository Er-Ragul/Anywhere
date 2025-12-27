import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: "0"
}

export const variableSlice = createSlice({
    name: 'variable',
    initialState,
    reducers: {
        add: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { add } = variableSlice.actions
export default variableSlice.reducer