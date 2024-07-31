import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    aliasState: null
}

export const aliasSlice = createSlice({
    name: 'aliasSlice',
    initialState,
    reducers: {
        setAliases: (state, action) => {
            state.aliasState = action.payload
        },
        clearAliases: (state) => {
            state.aliasState = null
        }
    }
})

export const { setAliases, clearAliases } = aliasSlice.actions

export default aliasSlice.reducer