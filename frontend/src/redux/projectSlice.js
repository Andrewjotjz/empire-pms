import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projectState: null
}

export const projectSlice = createSlice({
    name: 'projectSlice',
    initialState,
    reducers: {
        setProjectState: (state, action) => {
            state.projectState = action.payload
        },
        clearProjectState: (state) => {
            state.projectState = null
        }
    }
})

export const { setProjectState, clearProjectState } = projectSlice.actions

export default projectSlice.reducer