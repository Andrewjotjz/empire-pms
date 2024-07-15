import { useState } from "react"
import { useLogin } from "../../hooks/useLogin"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, error, isLoading} = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    await login(email, password)
  }

  return (
    <div className="container mt-5">
      <form className="login" onSubmit={handleSubmit}>
        <h3 className="mb-3">Sign In</h3>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address:</label>
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}

export default Login;