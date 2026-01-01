import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    vpn: null
}

export const variableSlice = createSlice({
    name: 'variable',
    initialState,
    reducers: {
        loadConfig: (state, action) => {
            state.vpn = action.payload
        }
    }
})

export const { loadConfig } = variableSlice.actions
export default variableSlice.reducer