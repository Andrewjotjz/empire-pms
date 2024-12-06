import React, { useState, useEffect } from 'react';

import LoadingScreen from "../loaders/LoadingScreen";
import SessionExpired from "../../components/SessionExpired"


const NewBudgetForm = () => {
  const [budget, setBudget] = useState({
    budget_name: '',
    project: '',
    budget_location: '',
    entries: [
      {
        product_type_obj_ref: {
          type_id: '',
          type_total_m2: 0,
          type_rate: 0,
          type_total_amount: 0,
          category_obj_ref: [],
        },
      },
    ],
  });
  const [productTypeState, setProductTypeState] = useState([]);
  const [isFetchTypeLoading, setIsFetchTypeLoading] = useState(false);
  const [fetchTypeError, setFetchTypeError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget((prevBudget) => ({
      ...prevBudget,
      [name]: value,
    }));
  };

  const handleTypeChange = (entryIndex, field, value) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref[field] = value;
    setBudget({ ...budget, entries: newEntries });
  };

  const handleCategoryChange = (entryIndex, categoryIndex, field, value, entry, category) => {
    const newEntries = [...budget.entries];
  
    // Update the specified field with the new value
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex][field] = value;
  
    if (field === "category_id"){
    // Reset subcategories for the category
    const subcategories = productTypeState
      .find(type => type._id === entry.product_type_obj_ref.type_id)
      ?.type_categories
      .find(cat => cat._id === category.category_id)
      ?.subcategories.map(subcat => ({
        subcategory_id: subcat._id,
        subcategory_total_m2: 0,
        subcategory_rate: 0,
        subcategory_total_amount: 0,
      })) || [];
  
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref = subcategories;
    }
  
    // Update the budget state
    setBudget({ ...budget, entries: newEntries });
  };
  

  const handleSubcategoryChange = (entryIndex, categoryIndex, subcategoryIndex, field, value) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref[subcategoryIndex][field] = value;
    setBudget({ ...budget, entries: newEntries });
  };

  const addCategory = (entryIndex) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref.push({
      category_id: '',
      category_total_m2: 0,
      category_rate: 0,
      category_total_amount: 0,
      subcategory_obj_ref: [],
    });
    setBudget({ ...budget, entries: newEntries });
  };

  const addSubcategory = (entryIndex, categoryIndex, entry, category) => {
    const newEntries = [...budget.entries];
    
    productTypeState
      .find(type => type._id === entry.product_type_obj_ref.type_id)
      ?.type_categories
      .find(cat => cat._id === category.category_id)
      ?.subcategories.forEach((subcat) => {
        newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref.push({
          subcategory_id: subcat._id,
          subcategory_total_m2: 0,
          subcategory_rate: 0,
          subcategory_total_amount: 0,
        });
      });
  
    setBudget({ ...budget, entries: newEntries });
  };
  

  const removeEntry = (entryIndex) => {
    setBudget((prevBudget) => ({
      ...prevBudget,
      entries: prevBudget.entries.filter((_, index) => index !== entryIndex),
    }));
  };

  const removeCategory = (entryIndex, categoryIndex) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref = 
      newEntries[entryIndex].product_type_obj_ref.category_obj_ref.filter(
        (_, index) => index !== categoryIndex
      );
    setBudget({ ...budget, entries: newEntries });
  };
  
  const removeSubcategory = (entryIndex, categoryIndex, subcategoryIndex) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref = 
      newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref.filter(
        (_, index) => index !== subcategoryIndex
      );
    setBudget({ ...budget, entries: newEntries });
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Budget submitted:', budget);
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchProductTypes = async () => {
        setIsFetchTypeLoading(true); // Set loading state to true at the beginning
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, { signal , credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});
            if (!res.ok) {
                throw new Error('Failed to fetch');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }
            
            setIsFetchTypeLoading(false);
            setProductTypeState(data);
            // setProductTypes(data.map(type => ({id: type.type_id, name: type.type_name})))
            setFetchTypeError(null);
        } catch (error) {
            if (error.name === 'AbortError') {
                // do nothing
            } else {
                setIsFetchTypeLoading(false);
                setFetchTypeError(error.message);
            }
        }
    };

    fetchProductTypes();

    return () => {
        abortController.abort(); // Cleanup
    };
}, []);

if (isFetchTypeLoading) { return (<LoadingScreen />); }

if (fetchTypeError) {
    if(fetchTypeError.includes("Session expired") || fetchTypeError.includes("jwt expired") || fetchTypeError.includes("jwt malformed")){
        return(<div><SessionExpired /></div>)
    }
    return (<div>Error: {fetchTypeError}</div>);
}


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-3">Create Budget</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="budget_name" className="block text-sm font-medium text-gray-700">
            Budget Name
          </label>
          <input
            type="text"
            id="budget_name"
            name="budget_name"
            value={budget.budget_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <input
            type="text"
            id="project"
            name="project"
            value={budget.project}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <label htmlFor="budget_location" className="block text-sm font-medium text-gray-700">
            Budget Location
          </label>
          <input
            type="text"
            id="budget_location"
            name="budget_location"
            value={budget.budget_location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Entries</h3>
          {budget.entries.map((entry, entryIndex) => (
            <div key={entryIndex} className="border px-6 pb-6 pt-1 rounded-md mb-3 bg-gray-50">
              <div className='w-full flex justify-end'>
                <button
                  type="button"
                      title='Remove whole entry'
                  onClick={() => removeEntry(entryIndex)}
                  className="px-3 py-1 text-sm rounded-md text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition ease-in-out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* <h4 className="font-medium mb-1 text-lg text-gray-700">Product Type</h4> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-1">
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select
                    value={entry.product_type_obj_ref.type_id}
                    onChange={(e) => handleTypeChange(entryIndex, 'type_id', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">Select Product Type</option>
                    {productTypeState.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total m²</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_total_m2}
                    onChange={(e) => handleTypeChange(entryIndex, 'type_total_m2', parseFloat(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_rate}
                    onChange={(e) => handleTypeChange(entryIndex, 'type_rate', parseFloat(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_total_amount}
                    onChange={(e) => handleTypeChange(entryIndex, 'type_total_amount', parseFloat(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              {/* <h5 className="font-medium mb-2 mt-6 text-gray-700">Categories</h5> */}
              {entry.product_type_obj_ref.category_obj_ref.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border-l-2 border-purple-200 mb-1 px-3 pb-3 py-1 bg-purple-100 bg-opacity-50">
                  <div className='w-full flex justify-end'>
                    <button
                      type="button"
                      title='Remove category'
                      onClick={() => removeCategory(entryIndex, categoryIndex)}
                      className="px-2 py-1 text-sm rounded-md text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition ease-in-out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={category.category_id}
                        onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_id', e.target.value, entry, category)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      >
                        <option value="">Select Category</option>
                        {productTypeState.find(type => type._id === entry.product_type_obj_ref.type_id)?.type_categories?.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total m²</label>
                      <input
                        type="number"
                        value={category.category_total_m2}
                        onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_total_m2', parseFloat(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                      <input
                        type="number"
                        value={category.category_rate}
                        onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_rate', parseFloat(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="number"
                        value={category.category_total_amount}
                        onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_total_amount', parseFloat(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  {/* <h6 className="font-medium mb-2 mt-4 text-gray-700">Subcategories</h6> */}
                  {category.subcategory_obj_ref.map((subcategory, subcategoryIndex) => (
                    <div key={subcategoryIndex} className="border-l-2 border-pink-100 mb-1 p-2 bg-pink-100 bg-opacity-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-1">
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                          <select
                            value={subcategory.subcategory_id}
                            onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_id', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                          >
                            <option value="">Select Subcategory</option>
                            {productTypeState.find(type => type._id === entry.product_type_obj_ref.type_id)?.type_categories.find(cat => cat._id === category.category_id)?.subcategories.map((subcat) => (
                              <option key={subcat._id} value={subcat._id}>
                                {subcat.subcategory_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total m²</label>
                          <input
                            type="number"
                            value={subcategory.subcategory_total_m2}
                            onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_total_m2', parseFloat(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                          <input
                            type="number"
                            value={subcategory.subcategory_rate}
                            onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_rate', parseFloat(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                          <div className='flex'>
                            <input
                              type="number"
                              value={subcategory.subcategory_total_amount}
                              onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_total_amount', parseFloat(e.target.value))}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => removeSubcategory(entryIndex, categoryIndex, subcategoryIndex)}
                              className="px-1 py-1 text-sm rounded-md text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition ease-in-out"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSubcategory(entryIndex, categoryIndex, entry, category)}
                    disabled={!productTypeState.find(type => type._id === entry.product_type_obj_ref.type_id)?.type_categories.find(cat => cat._id === category.category_id)?.subcategories?.length}                    
                    hidden={budget.entries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref?.length}
                    className="mt-2 px-2 py-1 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs border border-transparent rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
                  >
                    Add Subcategory
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCategory(entryIndex)}
                disabled={!productTypeState.find(type => type._id === entry.product_type_obj_ref.type_id)?.type_categories?.length}                
                className="mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-1 text-sm border border-transparent rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              >
                Add Category
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBudget({ ...budget, entries: [...budget.entries, { product_type_obj_ref: { type_id: '', type_total_m2: 0, type_rate: 0, type_total_amount: 0, category_obj_ref: [] } }] })}
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Entry
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Budget
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBudgetForm;
