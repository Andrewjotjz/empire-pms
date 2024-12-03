import React, { useState, useEffect } from 'react';

// Mock data for dropdowns (in a real app, you'd fetch this from an API)
const productTypes = [
  { id: '1', name: 'Product Type 1' },
  { id: '2', name: 'Product Type 2' },
];

const categories = {
  '1': [
    { id: '1', name: 'Category 1 for Product Type 1' },
    { id: '2', name: 'Category 2 for Product Type 1' },
  ],
  '2': [
    { id: '3', name: 'Category 1 for Product Type 2' },
    { id: '4', name: 'Category 2 for Product Type 2' },
  ],
};

const subcategories = {
  '1': [
    { id: '1', name: 'Subcategory 1 for Category 1' },
    { id: '2', name: 'Subcategory 2 for Category 1' },
  ],
  '2': [
    { id: '3', name: 'Subcategory 1 for Category 2' },
    { id: '4', name: 'Subcategory 2 for Category 2' },
  ],
  '3': [
    { id: '5', name: 'Subcategory 1 for Category 3' },
    { id: '6', name: 'Subcategory 2 for Category 3' },
  ],
  '4': [
    { id: '7', name: 'Subcategory 1 for Category 4' },
    { id: '8', name: 'Subcategory 2 for Category 4' },
  ],
};

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
          category_obj_ref: [
            {
              category_id: '',
              category_total_m2: 0,
              category_rate: 0,
              category_total_amount: 0,
              subcategory_obj_ref: [
                {
                  subcategory_id: '',
                  subcategory_total_m2: 0,
                  subcategory_rate: 0,
                  subcategory_total_amount: 0,
                },
              ],
            },
          ],
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

  const handleCategoryChange = (entryIndex, categoryIndex, field, value) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex][field] = value;
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

  const addSubcategory = (entryIndex, categoryIndex) => {
    const newEntries = [...budget.entries];
    newEntries[entryIndex].product_type_obj_ref.category_obj_ref[categoryIndex].subcategory_obj_ref.push({
      subcategory_id: '',
      subcategory_total_m2: 0,
      subcategory_rate: 0,
      subcategory_total_amount: 0,
    });
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

console.log("budget", budget);
console.log("productTypeState", productTypeState);

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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Entries</h3>
          {budget.entries.map((entry, entryIndex) => (
            <div key={entryIndex} className="border p-6 rounded-md mb-3 bg-gray-50">
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
                <div key={categoryIndex} className="border-l-2 border-purple-200 mb-1 mt-4 p-3 bg-purple-100 bg-opacity-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={category.category_id}
                        onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_id', e.target.value)}
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
                            {}
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
                          <input
                            type="number"
                            value={subcategory.subcategory_total_amount}
                            onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_total_amount', parseFloat(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSubcategory(entryIndex, categoryIndex)}
                    className="mt-2 px-3 py-1 text-sm border border-transparent rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
                  >
                    Add Subcategory
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCategory(entryIndex)}
                className="mt-4 px-3 py-1 text-sm border border-transparent rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
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
