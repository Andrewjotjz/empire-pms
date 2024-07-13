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
  if (location.pathname === "/EmpirePMS/login") {
    return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/EmpirePMS/dashboard">EmpirePMS</Link>
        </div>
      </nav>
    </header>)
  }

  return (
    localUser && Object.keys(localUser).length > 0 ? (
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/EmpirePMS/dashboard">EmpirePMS</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {localUser && (
                  <li className="nav-item">
                    <span className="nav-link">Welcome {localUser.employee_first_name}!</span>
                  </li>
                )}
                {localUser && (
                  <li className="nav-item">
                    <button className="btn btn-outline-light" onClick={handleLogOutClick}>Log out</button>
                  </li>
                )}
                {!localUser && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/EmpirePMS/login">Sign In</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>) : ( <NavbarSkeleton /> )
  );
}

export default Navbar;
