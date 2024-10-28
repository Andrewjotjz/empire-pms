import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAddProductPrice = () => {
    // Component's hook state declaration
    const [isAddPriceLoadingState, setAddPriceIsLoadingState] = useState(false);
    const [addPriceErrorState, setAddPriceErrorState] = useState(null);

    // Component's function
    const addPrice = async (newProductPriceState) => {
        setAddPriceIsLoadingState(true);
        setAddPriceErrorState(null);

        const postProductPrice = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/productprice/create`, {
                    credentials: 'include', method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProductPriceState)
                });

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                if (!res.ok) {
                    throw new Error('Failed to create new product price.');
                }
                if (res.ok) {
                    // push toast to notify successful creation
                    toast.success(`New product price created successfully!`, {
                        position: "bottom-right"
                    });

                    // update loading state
                    setAddPriceIsLoadingState(false);

                    return data._id
                }
            } catch (error) {
                setAddPriceErrorState(error.message);
                setAddPriceIsLoadingState(false);
            }
        };

        return postProductPrice();
    };

    return { addPrice, isAddPriceLoadingState, addPriceErrorState };
};
