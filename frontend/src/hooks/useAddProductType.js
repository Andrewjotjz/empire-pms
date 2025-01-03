//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAddProductType = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addProductType = async (productTypeState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postProductType = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(productTypeState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error(data.error)
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/product-type`)

                    alert(`New product type created successfully!`);
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                // Check if the error is due to a duplicate name
                if (error.response?.status === 400 && error.response.data?.error) {
                  setErrorState(error.response.data.error); // Set the error message
                  setIsLoadingState(false);
                } else {
                  setErrorState(error.message); // Generic fallback error
                  setIsLoadingState(false);
                }
              }
        }
        postProductType();
    }

    return { addProductType, isLoadingState, errorState };
}