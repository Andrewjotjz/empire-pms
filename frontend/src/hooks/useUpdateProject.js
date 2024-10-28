//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';


export const useUpdateProject = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const update = async (projectState, message) => {
        setIsLoadingState(true)
        setErrorState(null)

        const putProject = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectState._id}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({...projectState})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT project details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/project/${projectState._id}`)
                
                    // push toast to notify successful login
                    toast.success(message ? message: "Project updated successfully", {
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
        putProject();
    }

    return { update, isLoadingState, errorState };
}