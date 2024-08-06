//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useAddProduct = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addProduct = async (productState, supplierId) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postProduct = async () => {
            try {
                const res = await fetch(`/api/product/create`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(productState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new product details')
                }
                if (res.ok) {
                    // navigate client to supplier details page
                    navigate(`/EmpirePMS/supplier/${supplierId}`)
                
                    // push toast to notify successful login
                    toast.success(`Product added to supplier`, {
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
        postProduct();
    }

    return { addProduct, isLoadingState, errorState };
}