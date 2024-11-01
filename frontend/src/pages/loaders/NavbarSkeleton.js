import { useState, useEffect } from "react";
import { useLogout } from '../../hooks/useLogout';

const NavbarSkeleton = () => {
    // Component hooks
    const { logout } = useLogout();

    // Component state declaration
    const [idle, setIdleState] = useState(false);

    // Component side effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setIdleState(true);
        }, 10000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        logout();
    };

    // Display DOM
    return (
        <header>
            {idle ? (
                <header>
                    <nav className="bg-gray-900 p-2 w-screen px-4">
                    <div className="flex justify-between items-center">
                        <button
                            className="px-4 py-2 bg-gray-600 rounded text-white cursor-not-allowed"
                            disabled
                        >Access denied</button>
                        <div className="flex items-center space-x-4">
                        <button
                            className="px-4 py-2  bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={handleClick}
                        >Go to Login</button>
                        </div>
                    </div>
                    </nav>
                </header>
            ) : (
                <header>
                    <nav className="bg-gray-900 p-2 w-screen px-4">
                    <div className="flex justify-between items-center">
                        <button
                            className="px-4 py-2 bg-gray-600 rounded animate-pulse h-10 w-28"
                            disabled
                        ></button>
                        <div className="flex items-center space-x-4">
                        <button
                            className="px-4 py-2 bg-gray-600 rounded animate-pulse h-10 w-28"
                            disabled
                        ></button>
                        <button
                            className="px-4 py-2 bg-gray-600 rounded animate-pulse h-10 w-28"
                            disabled
                        ></button>
                        </div>
                    </div>
                    </nav>
                </header>
            )}
        </header>
    );
};

export default NavbarSkeleton;
