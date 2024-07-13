//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux'
import { setLocalUser } from '../redux/localUserSlice'

export const useLogin = () => {
  //Component's hook state declaration
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const dispatch = useDispatch();

  //Component's hook router
  const navigate = useNavigate();

  //Component's hook functions and variables
  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)

    if (email === ""){
      setError("Please input email.")
      setIsLoading(false)
      return
    }
    if (password === ""){
      setError("Please input password.")
      setIsLoading(false)
      return
    }

    const response = await fetch('/api/employee/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ employee_email: email, employee_password: password })
    })
    //returns a 'Promise' that resolves to a JavaScript object. This object is the result of parsing the JSON body text from the response.
    const promise = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      if(promise.errors){
        setError("Email or password is incorrect")
      }
    }
    if (response.ok) {
      // save the user to local storage
      localStorage.setItem('localUser', JSON.stringify(promise))

      // update the localUserState
      dispatch(setLocalUser(promise))

      // navigate client to dashboard page
      navigate('/EmpirePMS/dashboard')

      // push toast to notify successful login
      toast.success(`Login successful!`, {
        position: "bottom-right"
      });

      // update loading state
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}