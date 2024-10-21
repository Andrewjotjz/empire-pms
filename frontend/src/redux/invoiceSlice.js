import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    invoiceState: null
}

export const invoiceSlice = createSlice({
    name: 'invoiceSlice',
    initialState,
    reducers: {
        setInvoiceState: (state, action) => {
            state.invoiceState = action.payload
        },
        clearInvoiceState: (state) => {
            state.invoiceState = null
        }
    }
})

export const { setInvoiceState, clearInvoiceState } = invoiceSlice.actions

export default invoiceSlice.reducer