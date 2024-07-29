//import modules and files
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { toast } from 'react-toastify';
import NavbarSkeleton  from '../pages/loaders/NavbarSkeleton'

const Navbar = () => {
  //Component state declaration
  const localUser = JSON.parse(localStorage.getItem('localUser'))

  //Component router
  const location = useLocation();

  //Component hooks
  const { logout } = useLogout();

  //Component functions and variables
  const handleLogOutClick = () => {
    // push toast to notify successful login
    toast.success(`Logout successful!`, {
      position: "bottom-right"
    });
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
        <nav className="bg-gray-900 p-2">
          <div className="container mx-auto flex justify-between items-center">
            <Link className="text-white text-lg font-bold" to="/EmpirePMS/dashboard">EmpirePMS</Link>
            <div className="flex items-center space-x-4">
              {localUser && (
                <span className="text-white">{localUser.employee_email}</span>
              )}
              {localUser && (
                <button className="bg-transparent text-white border border-white px-4 py-2 rounded hover:bg-red-500" onClick={handleLogOutClick}>Log out</button>
              )}
              {!localUser && (
                <Link className="text-white" to="/EmpirePMS/login">Sign In</Link>
              )}
            </div>
          </div>
        </nav>
      </header>) : ( <NavbarSkeleton /> )
  );
}

export default Navbar;
