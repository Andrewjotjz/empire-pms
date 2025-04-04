//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 

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
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
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
                    // navigate client to home page
                    navigate(`/EmpirePMS/supplier/`)
                
                    alert(`Supplier added to company successfully!`);
                
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