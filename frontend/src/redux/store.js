//import redux store modules, and slicer files
import { configureStore } from '@reduxjs/toolkit'
import employeeReducer from './employeeSlice'
import localUserReducer from './localUserSlice'
import supplierReducer from './supplierSlice'

export const store = configureStore({
    reducer: {
        employeeReducer: employeeReducer,
        localUserReducer: localUserReducer,
        supplierReducer: supplierReducer
    }
})