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
    const user_json = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      if(user_json.errors){
        setError("Email or password is incorrect")
      }
    }
    if (response.ok) {
      // save the user to local storage
      localStorage.setItem('localUser', JSON.stringify(user_json))

      // update the localUserState
      dispatch(setLocalUser(user_json))

      // navigate client to dashboard page
      navigate('/EmpirePMS/dashboard')

      // push toast to notify successful login
      toast.success(`Login successful!`, {
        position: "top-right"
      });

      // update loading state
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}