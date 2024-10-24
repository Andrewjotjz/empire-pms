//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux'

export const useChangePassword = () => {
  //Component's hook state declaration
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const employeeState = useSelector((state) => state.employeeReducer.employeeState);

  //Component's hook router
  const navigate = useNavigate();

  //Component's hook functions and variables
  const changePassword = async (newPassword) => {
    setIsLoading(true)
    setError(null)

    if (newPassword === ""){
      setError("Please input password.")
      setIsLoading(false)
      return
    }

    const response = await fetch(`https://empire-pms.onrender.com/api/employee/${employeeState._id}/change-password`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({employee_password: newPassword})
    })
    //returns a 'Promise' that resolves to a JavaScript object. This object is the result of parsing the JSON body text from the response.
    const promise = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      if(promise.error){
        setError("Unable to update target account password. Please check API.")
      }
    }
    if (response.ok) {
      // navigate client to dashboard page
      navigate(`/EmpirePMS/employee/${employeeState._id}`)

      // push toast to notify successful login
      toast.success(`Target account password updated successfully!`, {
        position: "bottom-right"
      });

      // update loading state
      setIsLoading(false)
    }
  }

  return { changePassword, isLoading, error }
}