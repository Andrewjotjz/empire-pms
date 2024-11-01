// Import modules and files
import React, { useState, useEffect } from 'react';
import { useLogin } from "../../hooks/useLogin";
import logo from '../../empirelogo.png'

const Login = () => {
  // Use the custom login hook
  const { login, isLoading, error } = useLogin();

  // Local state for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for retrying login
  const [retry, setRetry] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setRetry(false); // Reset retry state on new attempt
    login(email, password);
  };

  // Handle retry logic
  useEffect(() => {
    let timer;
    if (isLoading) {
      // Set a timer to show the retry button after 8 seconds
      timer = setTimeout(() => {
        setRetry(true);
      }, 8000);
    }

    // Clear the timer if the component unmounts or if isLoading changes
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96 flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-24 rounded-full" />
        <form onSubmit={handleSubmit} className="w-full mt-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            <label className='text-red-400 italic text-sm'>Demo account: demo@empirecbs.com</label>
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            <label className='text-red-400 italic text-sm'>Demo password: demo123</label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full p-2 text-white rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {retry && (
            <button
              type="button"
              onClick={() => {window.location.reload()}}
              className="mt-4 w-full p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Retry Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
  
};

export default Login;
