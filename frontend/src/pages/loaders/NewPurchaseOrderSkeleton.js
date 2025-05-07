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
        navigate('/EmpirePMS/home');
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
        <form className="w-full px-2 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Left Column */}
                <div className="bg-white rounded-lg shadow-md p-3 space-y-2 lg:col-span-1">
                <h2 className="text-base font-semibold border-b pb-1">Order Information</h2>

                {/* Project Dropdown */}
                <div className="space-y-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-100 rounded" />
                </div>

                {/* Supplier Dropdown */}
                <div className="space-y-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-100 rounded" />
                </div>

                {/* PO Number Input */}
                <div className="space-y-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-9 bg-gray-100 rounded" />
                    <div className="space-y-1 mt-1">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    </div>
                </div>

                {/* Order Date */}
                <div className="space-y-1">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-9 bg-gray-100 rounded" />
                </div>

                {/* Delivery Date/Time */}
                <div className="space-y-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-9 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>

                {/* Product Search */}
                <div className="border rounded-lg overflow-hidden mt-3">
                    <div className="bg-gray-50 p-2 border-b space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-100 rounded" />
                    <div className="h-9 bg-gray-100 rounded" />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded" />
                    ))}
                    </div>
                </div>
                </div>

                {/* Right Column */}
                <div className="bg-white rounded-lg shadow-md p-3 lg:col-span-3">
                <h2 className="text-base font-semibold border-b pb-1 mb-2">Order Items</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                        {[...Array(7)].map((_, i) => (
                            <th key={i} className="px-2 py-2 text-left text-xs text-gray-500">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, i) => (
                        <tr key={i} className="bg-gray-50">
                            {[...Array(7)].map((_, j) => (
                            <td key={j} className="px-2 py-2">
                                <div className="h-4 bg-gray-100 rounded w-full" />
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100">
                        <td colSpan={7} className="px-2 py-2">
                            <div className="h-6 bg-gray-200 rounded w-1/4 ml-auto" />
                        </td>
                        </tr>
                    </tfoot>
                    </table>
                </div>
                </div>
            </div>
            </form>
    )}
</div>

    );
};

export default NewPurchaseOrderSkeleton;
