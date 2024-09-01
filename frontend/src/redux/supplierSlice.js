import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    supplierState: null
}

export const supplierSlice = createSlice({
    name: 'supplierSlice',
    initialState,
    reducers: {
        setSupplierState: (state, action) => {
            state.supplierState = action.payload
        },
        clearSupplierState: (state) => {
            state.supplierState = null
        }
    }
})

export const { setSupplierState, clearSupplierState } = supplierSlice.actions

export default supplierSlice.reducer