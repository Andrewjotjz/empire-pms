import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NewPurchaseOrderSkeleton = () => {
    // Component router
    const navigate = useNavigate();

    // Component state declaration
    const [idle, setIdleState] = useState(false);

    // Component side effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setIdleState(true);
        }, 20000);

        // Cleanup the timeout if the component unmounts before the timer is done
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        navigate('/EmpirePMS/dashboard');
    };

    // Display DOM
    return (
        <div className="container mt-5">
    {idle ? (
        <div className="text-center px-4 sm:px-8 lg:px-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Oops! I'm sorry...</h1>
            <p className="text-base sm:text-lg lg:text-xl">It seems like something went wrong. Please try again.</p>
            <p className="text-base sm:text-lg lg:text-xl">
                If this frequently occurs, please contact <a href="mailto:it.admin@empirecbs.com" className="text-blue-600 underline">it.admin@empirecbs.com</a> for more support.
            </p>
            <button className="btn btn-primary mt-4" onClick={handleClick}>
                Go to Home
            </button>
        </div>
    ) : (
        <>
            <div className="mx-4 mt-4 p-2 text-center font-bold text-lg sm:text-xl lg:text-2xl bg-slate-800 text-white rounded-t-lg">
                <div className="card-header bg-dark text-white">
                    <h1 className="skeleton skeleton-text"><span className="visually-hidden">EMPLOYEE ACCOUNT</span></h1>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-4 mb-4">
                
                <div className="border rounded-b-lg p-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                        <div className="mb-1">
                            <label className="form-label font-bold">*Purchase Order No:</label>
                            <div className="skeleton skeleton-input"></div>
                        </div>
                        <div className="mb-1">
                            <label className="form-label font-bold">*Project:</label>
                            <div className="skeleton skeleton-select"></div>
                        </div>
                        <div className="mb-1">
                            <label className="form-label font-bold">*Supplier:</label>
                            <div className="skeleton skeleton-select"></div>
                        </div>
                        <div className="col-span-2 mb-3">
                            <label className="text-xs italic text-gray-400 mb-2">Previous order numbers:</label>
                            <div className="skeleton skeleton-text"></div>
                        </div>
                    </div>

                    
                    <div className="container p-0 border-2 shadow-md bg-slate-50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 m-2 gap-x-1">
                            <div className="skeleton skeleton-input"></div>
                            <div>
                                <div className="skeleton skeleton-select"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-sm">
                            <div className="p-1"><div className="skeleton skeleton-text"></div></div>
                            <div className="p-1"><div className="skeleton skeleton-text"></div></div>
                            <div className="p-1"><div className="skeleton skeleton-text"></div></div>
                            <div className="p-1"><div className="skeleton skeleton-text"></div></div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                                <div className="col-span-2"><div className="skeleton skeleton-text"></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="border rounded-b-lg p-4">
                
                    <label className="font-bold">Order Items:</label>
                    <div className="bg-gray-100 border rounded-lg shadow-sm">
                        <div className="border-0 rounded-lg">
                            <div className="skeleton skeleton-table"></div>
                        </div>
                        <div className="bg-white border-b-2">
                            <div className="flex justify-center p-2">
                                <div className="skeleton skeleton-button"></div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="flex justify-end">
                        <div>
                            <div className="skeleton skeleton-text mb-2"></div>
                            <div className="skeleton skeleton-text mb-2"></div>
                            <div className="skeleton skeleton-text mb-2"></div>
                        </div>
                    </div>

                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 my-2">
                        <div>
                            <label className="form-label font-bold">*Order Date:</label>
                            <div className="skeleton skeleton-input"></div>
                        </div>
                        <div>
                            <label className="form-label font-bold">*EST Date and Time:</label>
                            <div className="skeleton skeleton-input"></div>
                            <label className="text-xs italic text-gray-400">(EST) - Delivery estimate time of arrival</label>
                        </div>
                    </div>

                    
                    <div className="my-2">
                        <label className="form-label font-bold">Internal comments:</label>
                        <div className="skeleton skeleton-textarea"></div>
                    </div>
                    <div className="my-2">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <div className="skeleton skeleton-textarea"></div>
                    </div>

                    
                    <div className="flex flex-col sm:flex-row justify-between mb-3 space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="skeleton skeleton-button"></div>
                        <div className="skeleton skeleton-button"></div>
                        <div className="skeleton skeleton-button"></div>
                    </div>
                </div>
            </div>
        </>
    )}
</div>

    );
};

export default NewPurchaseOrderSkeleton;
