//import redux store modules, and slicer files
import { configureStore } from '@reduxjs/toolkit'
import employeeReducer from './employeeSlice'
import localUserReducer from './localUserSlice'

export const store = configureStore({
    reducer: {
        employeeReducer: employeeReducer,
        localUserReducer: localUserReducer
    }
})