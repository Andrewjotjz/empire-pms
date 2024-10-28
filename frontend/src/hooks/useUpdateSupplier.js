//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useUpdateSupplier = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const update = async (supplierState, message) => {
        setIsLoadingState(true)
        setErrorState(null)

        const putSupplier = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/supplier/${supplierState._id}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({...supplierState})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT supplier details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/supplier/${supplierState._id}`)
                
                    // push toast to notify successful login
                    toast.success(message ? message: "Supplier updated successfully", {
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
        putSupplier();
    }

    return { update, isLoadingState, errorState };
}