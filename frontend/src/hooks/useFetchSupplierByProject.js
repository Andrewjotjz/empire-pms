//import modules and files
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setSupplierState } from '../redux/supplierSlice';

export const useFetchSupplierByProject = () => {
    //Component's hook state declaration
    const [isFetchSupplierLoading, setIsFetchSupplierLoading] = useState(false);
    const [fetchSupplierError, setFetchSupplierError] = useState(null);

    //Hook declaration
    const dispatch = useDispatch();

    //Component's function
    const fetchSupplierByProject = async (id) => {
        setIsFetchSupplierLoading(true)
        setFetchSupplierError(null)

        const getSuppliers = async () => {
            try {
                const res = await fetch(`/api/project/${id}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to GET supplier')
                }
                if (res.ok) {
                    //get project's supplier and store in supplier state
                    dispatch(setSupplierState(data[0].suppliers))
                    setIsFetchSupplierLoading(false)
                }
            } catch (error) {
                setFetchSupplierError(error.message);
                setIsFetchSupplierLoading(false);
            }
        }
        getSuppliers();
    }

    return { fetchSupplierByProject, isFetchSupplierLoading, fetchSupplierError };
}
