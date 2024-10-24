import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAddAlias = () => {
    // Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    // Component's function
    const addAlias = async (value) => {
        setIsLoadingState(true);
        setErrorState(null);

        const postAlias = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/alias/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alias_name: value })
                });

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                if (!res.ok) {
                    throw new Error('Failed to create new alias. Alias already existed in database. Otherwise, please check your network.');
                }
                if (res.ok) {
                    // push toast to notify successful creation
                    toast.success(`New alias created successfully!`, {
                        position: "bottom-right"
                    });

                    // update loading state
                    setIsLoadingState(false);

                    return data._id;
                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
                throw error; // rethrow the error to be handled by the caller
            }
        };

        return postAlias(); // return the promise from postAlias
    };

    return { addAlias, isLoadingState, errorState };
};
