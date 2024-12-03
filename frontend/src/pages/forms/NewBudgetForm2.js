import React, { useState } from 'react';

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

const BudgetForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget((prevBudget) => ({
      ...prevBudget,
      [name]: value,
    }));
  };

  const handleEntryChange = (entryIndex, field, value) => {
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Budget</h2>
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
            <div key={entryIndex} className="border p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2">Product Type</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={entry.product_type_obj_ref.type_id}
                  onChange={(e) => handleEntryChange(entryIndex, 'type_id', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Total m2"
                  value={entry.product_type_obj_ref.type_total_m2}
                  onChange={(e) => handleEntryChange(entryIndex, 'type_total_m2', parseFloat(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={entry.product_type_obj_ref.type_rate}
                  onChange={(e) => handleEntryChange(entryIndex, 'type_rate', parseFloat(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <input
                  type="number"
                  placeholder="Total Amount"
                  value={entry.product_type_obj_ref.type_total_amount}
                  onChange={(e) => handleEntryChange(entryIndex, 'type_total_amount', parseFloat(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <h5 className="font-medium mb-2">Categories</h5>
              {entry.product_type_obj_ref.category_obj_ref.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border-l-2 border-indigo-200 pl-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <select
                      value={category.category_id}
                      onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_id', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Select Category</option>
                      {categories[entry.product_type_obj_ref.type_id]?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Total m2"
                      value={category.category_total_m2}
                      onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_total_m2', parseFloat(e.target.value))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={category.category_rate}
                      onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_rate', parseFloat(e.target.value))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="number"
                      placeholder="Total Amount"
                      value={category.category_total_amount}
                      onChange={(e) => handleCategoryChange(entryIndex, categoryIndex, 'category_total_amount', parseFloat(e.target.value))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <h6 className="font-medium mb-2">Subcategories</h6>
                  {category.subcategory_obj_ref.map((subcategory, subcategoryIndex) => (
                    <div key={subcategoryIndex} className="border-l-2 border-indigo-100 pl-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <select
                          value={subcategory.subcategory_id}
                          onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_id', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="">Select Subcategory</option>
                          {subcategories[category.category_id]?.map((subcat) => (
                            <option key={subcat.id} value={subcat.id}>
                              {subcat.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Total m2"
                          value={subcategory.subcategory_total_m2}
                          onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_total_m2', parseFloat(e.target.value))}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <input
                          type="number"
                          placeholder="Rate"
                          value={subcategory.subcategory_rate}
                          onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_rate', parseFloat(e.target.value))}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <input
                          type="number"
                          placeholder="Total Amount"
                          value={subcategory.subcategory_total_amount}
                          onChange={(e) => handleSubcategoryChange(entryIndex, categoryIndex, subcategoryIndex, 'subcategory_total_amount', parseFloat(e.target.value))}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSubcategory(entryIndex, categoryIndex)}
                    className="mt-2 px-2 py-1 text-sm border border-transparent rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                  >
                    Add Subcategory
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCategory(entryIndex)}
                className="mt-2 px-2 py-1 text-sm border border-transparent rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                Add Category
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBudget({ ...budget, entries: [...budget.entries, { product_type_obj_ref: { type_id: '', type_total_m2: 0, type_rate: 0, type_total_amount: 0, category_obj_ref: [] } }] })}
            className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Entry
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Budget
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;

