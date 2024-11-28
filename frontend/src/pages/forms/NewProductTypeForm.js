// Import modules
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProductType } from '../../hooks/useAddProductType'; 
 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const NewProductTypeForm = () => {
    // router
    const navigate = useNavigate();

    // hook
    const { addProductType, isLoadingState, errorState } = useAddProductType();

    // state
    const [productTypeState, setProductTypeState] = useState({
        type_name: '',
        type_categories: [
            {
            category_name: '',
            subcategories: [
                {
                subcategory_name: ''
                }]
            }
        ]
    });

    // functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    // Handle back click
    const handleBackClick = () => navigate(`/EmpirePMS/product-type`);

    // Handle changes for type name
    const handleTypeChange = (e) => {
        setProductTypeState({ ...productTypeState, type_name: e.target.value });
    };

    // Handle changes for category name
    const handleCategoryChange = (index, value) => {
        const updatedCategories = [...productTypeState.type_categories];
        updatedCategories[index].category_name = value;
        setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
    };

    // Handle changes for subcategory name
    const handleSubcategoryChange = (catIndex, subIndex, value) => {
        const updatedCategories = [...productTypeState.type_categories];
        updatedCategories[catIndex].subcategories[subIndex].subcategory_name = value;
        setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
    };
    
    // Add a new category
    const addCategory = () => {
      setProductTypeState({
        ...productTypeState,
        type_categories: [
          ...productTypeState.type_categories,
          { category_name: '', subcategories: [{ subcategory_name: '' }] }
        ]
      });
    };

    // Add a new subcategory to a specific category
    const addSubcategory = (catIndex) => {
        const updatedCategories = [...productTypeState.type_categories];
        updatedCategories[catIndex].subcategories.push({ subcategory_name: '' });
        setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
    };

    // Remove a category
    const removeCategory = (index) => {
        const updatedCategories = productTypeState.type_categories.filter((_, i) => i !== index);
        setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
    };

    // Remove a subcategory
    const removeSubcategory = (catIndex, subIndex) => {
        const updatedCategories = [...productTypeState.type_categories];
        updatedCategories[catIndex].subcategories = updatedCategories[catIndex].subcategories.filter(
        (_, i) => i !== subIndex
        );
        setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
    };

    // Remove input with empty string
    const cleanObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj
          .map(cleanObject) // Process each element
          .filter((item) => item && Object.keys(item).length > 0); // Remove empty objects
      } else if (typeof obj === 'object' && obj !== null) {
        const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
          const cleanedValue = cleanObject(value); // Clean nested values
          if (
            cleanedValue !== '' && // Remove empty strings
            (typeof cleanedValue !== 'object' || Object.keys(cleanedValue).length > 0) // Remove empty objects
          ) {
            acc[key] = cleanedValue;
          }
          return acc;
        }, {});
        return cleaned;
      }
      return obj; // Return primitive values unchanged
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanedData = cleanObject(productTypeState); // Clean the data by removing empty strings from input

        addProductType(cleanedData)

        setProductTypeState({
        type_name: '',
        type_categories: [{ category_name: '', subcategories: [{ subcategory_name: '' }] }]
        });
    };

    // component
    if (isLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
              <h1 className=" text-xs sm:text-xl font-bold text-white">NEW PRODUCT TYPE</h1>
            </div>
            <form className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">* Product Type Name</label>
                <input
                  type="text"
                  value={productTypeState.type_name}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  required
                />
                <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: Plasterboard, Framing Wall, Framing Wall (Accessories), Ceiling Tiles, Rigid Insulation, Speedpanel (Accessories)</label>
              </div>
    
              {productTypeState.type_categories.map((category, catIndex) => (
                <div key={catIndex} className="space-y-2 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Category Name</label>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIndex)}
                      className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 sm:size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={category.category_name}
                    onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
                    placeholder='Category Name'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                  <label className='hidden sm:inline text-xs italic text-gray-400'>Ex: 13mm RE, 16mm FR, 64mm Stud 3m 0.5BMT, 92mm Stud 3m 0.75BMT</label>
    
                  {category.subcategories.map((subcategory, subIndex) => (
                    <div key={subIndex} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => removeSubcategory(catIndex, subIndex)}
                        className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={subcategory.subcategory_name}
                        onChange={(e) => handleSubcategoryChange(catIndex, subIndex, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out w-full"
                        placeholder="Sub-category Name"
                      />
                    </div>
                  ))}
                  <div className='mt-0'>
                    <label className='hidden sm:inline-block text-xs italic text-gray-400 ml-8'>Ex: 64mm Track, 64mm Nogging, 64mm Stud, 64mm DH Track</label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => addSubcategory(catIndex)}
                    className="inline-flex items-center px-3 py-2 border border-transparent leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-xs sm:text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Sub-category
                  </button>
                </div>
              ))}
    
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-xs sm:text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Category
              </button>
    
              <div className='grid grid-cols-2'>
                <div className='grid grid-cols-3'>
                    <button
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition duration-150 ease-in-out text-xs sm:text-sm"
                    onClick={handleBackClick}
                    >
                    CANCEL
                    </button>
                </div>
                <div className='grid grid-cols-3'>
                    <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out col-start-3 text-xs sm:text-sm"
                    >
                    SUBMIT
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
    ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default NewProductTypeForm;
