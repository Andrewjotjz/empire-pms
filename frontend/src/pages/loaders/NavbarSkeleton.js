import { useState, useEffect } from "react";
import { useLogout } from '../../hooks/useLogout'

const NavbarSkeleton = () => {
    //Component hooks
    const { logout } = useLogout();

    //Component state declaration
    const [idle, setIdleState] = useState(false);

    //Component side effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setIdleState(true);
        }, 20000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        logout()
    };

    //Display DOM
    return (
        <header>
        {idle ? (
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container-fluid">
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                <button className="btn btn-primary" onClick={handleClick}>Go to Login</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
        ) : (
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container-fluid">
                        <span className="navbar-brand skeleton skeleton-button"></span>
                        <button className="navbar-toggler" type="button" disabled>
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <button className="btn btn-outline-light skeleton skeleton-button" disabled></button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light skeleton skeleton-button" disabled></button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light skeleton skeleton-button" disabled></button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
        )}
        </header>
    );
};

export default NavbarSkeleton;
