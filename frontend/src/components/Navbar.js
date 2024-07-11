//import modules and files
import { useEffect }from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
// import { useAuthContext } from '../hooks/useAuthContext';
import { useSelector, useDispatch } from 'react-redux'
import { setLocalUser } from '../redux/localUserSlice'

const Navbar = () => {
  //Component state declaration
  const localUser = useSelector((state) => state.localUserReducer.localUserState)
  const dispatch = useDispatch();

  //Component router
  const location = useLocation();

  //Component hooks
  const { logout } = useLogout();

  //Component functions and variables
  const handleClick = () => {
    logout();
  };


  //Render component
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    if (localUser) {
        dispatch(setLocalUser(localUser)) 
    }
  }, [dispatch])

  //Display DOM
  // Hide Navbar if the current path is "/EmpirePMS/login"
  if (location.pathname === "/EmpirePMS/login") {
    return null;
  }

  return (
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
                  <span className="nav-link">Welcome {localUser.employee.employee_first_name}!</span>
                </li>
              )}
              {localUser && (
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={handleClick}>Log out</button>
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
    </header>
  );
}

export default Navbar;
