import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NewPurchaseOrderSkeleton = () => {
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
        navigate('/EmpirePMS/dashboard');
    };

    //Display DOM
    return (
        <div className="container mt-5">
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
            <>
            <div className='mx-4 mt-4 p-2 text-center font-bold text-xl bg-slate-800 text-white rounded-t-lg'>
                NEW PURCHASE ORDER
            </div>
            <div className="grid grid-cols-2 mx-4 mb-4">
                <div className="border rounded-b-lg p-4"> 
                    {/* SELECT SUPPLIER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                        <div className="mb-1">
                            <label className="form-label font-bold">*Purchase Order No:</label>
                            <div className="skeleton-input h-8 w-full"></div>
                        </div>

                        <div className="mb-1">
                            <label className="form-label font-bold">*Project:</label>
                            <div className="skeleton-select h-8 w-full"></div>
                        </div>

                        <div className="mb-1">
                            <label className="form-label font-bold">*Supplier:</label>
                            <div className="skeleton-select h-8 w-full"></div>
                        </div>

                        <div className='col-span-2 mb-3'>
                            <label className="text-xs italic text-gray-400 mb-2">
                                Previous order numbers:
                            </label>
                            <div className="skeleton-text h-4 w-full"></div>
                        </div>
                    </div>

                    {/* ***** SEARCH ITEM TABLE ****** */}
                    <div className="container p-0 border-2 shadow-md bg-slate-50">
                        <div className="grid grid-cols-3 m-2 gap-x-1">
                            <div className="skeleton-input h-8 w-full"></div>
                            <div>
                                <div className="skeleton-select h-8 w-full"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-sm">
                            <div className='p-1'>
                                <div className="skeleton-text h-4 w-full"></div>
                            </div>
                            <div className='p-1'>
                                <div className="skeleton-text h-4 w-full"></div>
                            </div>
                            <div className='p-1'>
                                <div className="skeleton-text h-4 w-full"></div>
                            </div>
                            <div className='p-1'>
                                <div className="skeleton-text h-4 w-full"></div>
                            </div>
                            <div className='grid grid-cols-3 gap-2 p-1'>
                                <div className="col-span-2">
                                    <div className="skeleton-text h-4 w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-b-lg p-4">
                    {/* ***** ADDED ITEM TABLE ****** */}
                    <label className="font-bold">Order Items:</label>
                    <div className='bg-gray-100 border rounded-lg shadow-sm'>
                        <div className="border-0 rounded-lg">
                            <div className="skeleton-table h-32"></div>
                        </div>

                        {/* ADD CUSTOM BUTTON */}
                        <div className='bg-white border-b-2'>
                            <div className="flex justify-center p-2">
                                <div className='skeleton-button h-8 w-32'></div>
                            </div>
                        </div>
                    </div>

                    {/* ********************* ITEM CALCULATION ******************** */}
                    <div className="flex justify-end">
                        <div>
                            <div className="skeleton-text h-4 w-32 mb-2"></div>
                            <div className="skeleton-text h-4 w-32 mb-2"></div>
                            <div className="skeleton-text h-4 w-32 mb-2"></div>
                        </div>
                    </div>

                    {/* ***** ORDER DATE ****** */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 my-2">
                        <div>
                            <label className="form-label font-bold">*Order Date:</label>
                            <div className="skeleton-input h-8 w-full"></div>
                        </div>

                        <div>
                            <label className="form-label font-bold">*EST Date and Time:</label>
                            <div className="skeleton-input h-8 w-full"></div>
                            <label className="text-xs italic text-gray-400">(EST) - Delivery estimate time of arrival</label>
                        </div>
                    </div>

                    {/* ***** INTERNAL COMMENTS ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Internal comments:</label>
                        <div className="skeleton-textarea h-16 w-full"></div>
                    </div>

                    {/* ***** NOTES TO SUPPLIER ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <div className="skeleton-textarea h-16 w-full"></div>
                    </div>

                    {/* ***** BUTTONS ***** */}
                    <div className="flex justify-between mb-3">
                        <div className="skeleton-button h-8 w-24"></div>
                        <div className="skeleton-button h-8 w-32"></div>
                        <div className="skeleton-button h-8 w-32"></div>
                    </div>
                </div>
            </div>
            </>
        )}
        </div>
    );
};

export default NewPurchaseOrderSkeleton;
