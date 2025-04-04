//! THIS FILE IS CURRENTLY NOT IN USED

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const Loading = () => {
    //Component router
    const navigate = useNavigate();

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
        navigate('/EmpirePMS/home');
    };

    //Display DOM
    return (
        <div className="container text-center mt-5">
            {idle ? (
                <div>
                    <h1 className="display-4">Oops! I'm sorry...</h1>
                    <p className="lead">It seems like something went wrong. Please try again.</p>
                    <p className="lead">If this frequently occurs, please contact it.admin@empirecbs.com for more support.</p>
                    <button className="btn btn-primary" onClick={handleClick}>
                        Go to Home
                    </button>
                </div>
            ) : (
                <div>
                    <h1 className="display-4">Loading...</h1>
                    <p className="lead">Hang in there! This won't take long.</p>
                    <div className="spinner-border" role="status">
                        <span className="sr-only"></span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loading;
