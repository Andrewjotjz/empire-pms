import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projectState: null
}

export const projectSlice = createSlice({
    name: 'projectSlice',
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projectState = action.payload
        },
        clearProjects: (state) => {
            state.projectState = null
        }
    }
})

export const { setProjects, clearProjects } = projectSlice.actions

export default projectSlice.reducer