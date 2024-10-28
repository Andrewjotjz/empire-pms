//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useAddSupplier = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addSupplier = async (supplierState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postSupplier = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/supplier/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(supplierState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new supplier details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/supplier/`)
                
                    // push toast to notify successful login
                    toast.success(`Supplier added to company successfully!`, {
                        position: "bottom-right"
                    });
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        postSupplier();
    }

    return { addSupplier, isLoadingState, errorState };
}