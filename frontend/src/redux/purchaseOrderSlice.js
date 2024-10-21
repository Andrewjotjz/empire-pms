import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    purchaseOrderState: null
}

export const purchaseOrderSlice = createSlice({
    name: 'purchaseOrderSlice',
    initialState,
    reducers: {
        setPurchaseOrderState: (state, action) => {
            state.purchaseOrderState = action.payload
        },
        clearPurchaseOrderState: (state) => {
            state.purchaseOrderState = null
        }
    }
})

export const { setPurchaseOrderState, clearPurchaseOrderState } = purchaseOrderSlice.actions

export default purchaseOrderSlice.reducer