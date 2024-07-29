//import redux store modules, and slicer files
import { configureStore } from '@reduxjs/toolkit'
import employeeReducer from './employeeSlice'
import localUserReducer from './localUserSlice'
import supplierReducer from './supplierSlice'
import productReducer from './productSlice'
import aliasReducer from './aliasSlice'
import productPriceReducer from './productPriceSlice'

export const store = configureStore({
    reducer: {
        employeeReducer: employeeReducer,
        localUserReducer: localUserReducer,
        supplierReducer: supplierReducer,
        productReducer: productReducer,
        aliasReducer: aliasReducer,
        productPriceReducer: productPriceReducer
    }
})