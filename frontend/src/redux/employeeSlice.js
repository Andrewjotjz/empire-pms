import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    employeeState: null
}

export const employeeSlice = createSlice({
    name: 'employeeSlice',
    initialState,
    reducers: {
        setEmployeeDetails: (state, action) => {
            state.employeeState = action.payload
        },
        clearEmployeeDetails: (state) => {
            state.employeeState = null
        }
    }
})

export const { setEmployeeDetails, clearEmployeeDetails } = employeeSlice.actions

export default employeeSlice.reducer