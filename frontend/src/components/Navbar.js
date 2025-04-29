//import modules and files
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import NavbarSkeleton  from '../pages/loaders/NavbarSkeleton'
import { useState } from 'react';

const Navbar = () => {
  //Component state declaration
  const localUser = JSON.parse(localStorage.getItem('localUser'))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //Component router
  const location = useLocation();
  const navigate = useNavigate();

  //Component hooks
  const { logout } = useLogout();

  //Component functions and variables
  const handleAccountClick = () => {
    navigate('/EmpirePMS/account')
  }

  const handleLogOutClick = () => {
    alert("Logout succesfully")
    logout();
  };

  //Display DOM
  //Check if the current path is "/EmpirePMS/login"
  if (location.pathname === "/EmpirePMS/login" || location.pathname === "/EmpirePMS/employee/reset-password" ) {
    return (
    <header>
      <nav className="bg-gray-900 p-2">
        <div className="container mx-auto">
          <Link className="text-white text-lg font-bold" to="/EmpirePMS/login">EmpirePMS</Link>
        </div>
      </nav>
    </header>)
  }

  return (
    localUser && Object.keys(localUser).length > 0 ? (
      <header>
        <nav className="bg-gray-900 p-2 w-full px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link className="text-white text-2xl font-bold" to="/EmpirePMS/home">
              EmpirePMS
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-4">
              {localUser && (
                <span className="text-white cursor-pointer" onClick={handleAccountClick}>
                  {localUser.employee_email}
                </span>
              )}
              {localUser && (
                <button
                  className="bg-gray-900 text-white border border-white px-4 py-2 rounded hover:bg-red-700 hover:scale-95 ease-out duration-75 hover:font-bold"
                  onClick={handleLogOutClick}
                >
                  Logout
                </button>
              )}
              {!localUser && (
                <Link className="text-white" to="/EmpirePMS/login">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-2 space-y-2">
              {localUser && (
                <span className="text-white block cursor-pointer" onClick={handleAccountClick}>
                  {localUser.employee_email}
                </span>
              )}
              {localUser && (
                <button
                  className="bg-gray-900 text-white border border-white w-full px-4 py-2 rounded hover:bg-red-700 hover:scale-95 ease-out duration-75 hover:font-bold"
                  onClick={handleLogOutClick}
                >
                  Logout
                </button>
              )}
              {!localUser && (
                <Link className="text-white block" to="/EmpirePMS/login">
                  Sign In
                </Link>
              )}
            </div>
          )}
        </nav>
      </header>
    ) : (
      <NavbarSkeleton />
    )
  );
}

export default Navbar;
