// Import modules
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProductType } from '../../hooks/useUpdateProductType'; 
 
import SessionExpired from '../../components/SessionExpired';
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";
import LoadingOverlay from '../loaders/LoadingScreen';

// Mock data for dropdown options
const productTypes = [
  { id: 'pt1', name: 'Plasterboard' },
  { id: 'pt2', name: 'Framing Wall' },
  { id: 'pt3', name: 'Framing Ceiling' },
  { id: 'pt4', name: 'Batt Insulation' },
  { id: 'pt5', name: 'Rigid Insulation' },
  { id: 'pt6', name: 'External Cladding' },
  { id: 'pt7', name: 'Access Panel' },
  { id: 'pt8', name: 'Compound' },
];

const categories = {
  pt1: [
    { id: 'c1', name: '13mm RE' },
    { id: 'c2', name: '13mm WR' },
    { id: 'c3', name: '16mm FR' },
    { id: 'c4', name: '13mm FR' },
    { id: 'c5', name: '16mm WRFR' },
    { id: 'c6', name: '13mm WRFR' },
    { id: 'c7', name: 'Wastage' },
  ],
  pt2: [
    { id: 'c8', name: '64mm Stud (3m Height) (0.5BMT)' },
    { id: 'c9', name: '92mm Stud (3m Height) (0.7BMT)' },
    { id: 'c10', name: '92mm Quiet Stud (3m Height) (0.7BMT)' },
    { id: 'c11', name: '28mm / 37mm Furring Channel' },
  ],
  pt3: [
  ],
  pt4: [
  ],
  pt5: [
    { id: 'c12', name: 'Rigid Insulation Slab' },
    { id: 'c13', name: 'Rigid Insulation (Accessories)' },
  ],
  pt6: [
  ],
  pt7: [
  ],
  pt8: [
  ]
};

const subcategories = {
  c8: [
    { id: 'sc1', name: '64mm top track' }, 
    { id: 'sc2', name: '64mm bottom track' },
    { id: 'sc3', name: '64mm stud' },
    { id: 'sc4', name: '64mm nogging track' }
  ],
  c9: [
    { id: 'sc5', name: '92mm top track' }, 
    { id: 'sc6', name: '92mm bottom track' },
    { id: 'sc7', name: '92mm stud' },
    { id: 'sc8', name: '92mm nogging track' }
  ],
  c10: [
    { id: 'sc9', name: '92mm top track' }, 
    { id: 'sc10', name: '92mm bottom track' },
    { id: 'sc11', name: '92mm stud' },
    { id: 'sc12', name: '92mm nogging track' }
  ],
  c11: [
    { id: 'sc13', name: '28mm / 37mm Furring Channel' }
  ],
};

const NewBudgetForm = () => {
  const [budget, setBudget] = useState({
    budget_name: '',
    project: '',
    budget_location: '',
    entries: [],
    budget_isarchived: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudget({ ...budget, [name]: value });
  };

  const handleEntryChange = (index, field, subfield, value) => {
    const updatedEntries = [...budget.entries];
    if (subfield) {
      updatedEntries[index][field][subfield] = value;
    } else {
      updatedEntries[index][field] = value;
    }
    setBudget({ ...budget, entries: updatedEntries });
  };

  const addEntry = () => {
    setBudget({
      ...budget,
      entries: [
        ...budget.entries,
        {
          product_type_obj_ref: {
            type_id: '',
            type_total_m2: 0,
            type_rate: 0,
            type_total_amount: 0
          },
          category_obj_ref: {
            category: { category_id: '' },
            category_total_m2: 0,
            category_rate: 0,
            category_total_amount: 0
          },
          subcategory_obj_ref: {
            subcategory: { subcategory_id: '' },
            subcategory_total_m2: 0,
            subcategory_rate: 0,
            subcategory_total_amount: 0
          }
        },
      ],
    });
  };

  const removeEntry = (index) => {
    const updatedEntries = budget.entries.filter((_, i) => i !== index);
    setBudget({ ...budget, entries: updatedEntries });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting budget:', budget);
    // Here you would typically send the budget data to your backend
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Create Budget</h2>
      {/* Budget name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="budget_name" className="block text-sm font-medium text-gray-700">Budget Name</label>
          <input
            type="text"
            id="budget_name"
            name="budget_name"
            value={budget.budget_name}
            onChange={handleInputChange}
            required
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* Project */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">Project</label>
          <input
            type="text"
            id="project"
            name="project"
            value={budget.project}
            onChange={handleInputChange}
            required
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>
      {/* Budget location */}
      <div className="mb-4">
        <label htmlFor="budget_location" className="block text-sm font-medium text-gray-700">Budget Location</label>
        <input
          type="text"
          id="budget_location"
          name="budget_location"
          value={budget.budget_location}
          onChange={handleInputChange}
          required
          className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
        />
      </div>
      {/* Entries */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Entries</h3>
        {budget.entries.map((entry, index) => (
          <div key={index} className="border p-4 mb-4 rounded-md">
            <h4 className="font-medium mb-2">Entry {index + 1}</h4>
            
            {/* Product Type */}
            <div className="mb-4">
              <h5 className="font-medium mb-2">Product Type</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={entry.product_type_obj_ref.type_id}
                    onChange={(e) => {
                      handleEntryChange(index, 'product_type_obj_ref', 'type_id', e.target.value);
                      // Reset category and subcategory when product type changes
                      handleEntryChange(index, 'category_obj_ref', 'category', { category_id: '' });
                      handleEntryChange(index, 'subcategory_obj_ref', 'subcategory', { subcategory_id: '' });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  >
                    <option value="">Select Product Type</option>
                    {productTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total m²</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_total_m2}
                    onChange={(e) => handleEntryChange(index, 'product_type_obj_ref', 'type_total_m2', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_rate}
                    onChange={(e) => handleEntryChange(index, 'product_type_obj_ref', 'type_rate', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    value={entry.product_type_obj_ref.type_total_amount}
                    onChange={(e) => handleEntryChange(index, 'product_type_obj_ref', 'type_total_amount', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <h5 className="font-medium mb-2">Category</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={entry.category_obj_ref.category.category_id}
                    onChange={(e) => {
                      handleEntryChange(index, 'category_obj_ref', 'category', { category_id: e.target.value });
                      // Reset subcategory when category changes
                      handleEntryChange(index, 'subcategory_obj_ref', 'subcategory', { subcategory_id: '' });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    disabled={!entry.product_type_obj_ref.type_id}
                  >
                    <option value="">Select Category</option>
                    {categories[entry.product_type_obj_ref.type_id]?.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total m²</label>
                  <input
                    type="number"
                    value={entry.category_obj_ref.category_total_m2}
                    onChange={(e) => handleEntryChange(index, 'category_obj_ref', 'category_total_m2', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate</label>
                  <input
                    type="number"
                    value={entry.category_obj_ref.category_rate}
                    onChange={(e) => handleEntryChange(index, 'category_obj_ref', 'category_rate', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    value={entry.category_obj_ref.category_total_amount}
                    onChange={(e) => handleEntryChange(index, 'category_obj_ref', 'category_total_amount', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            </div>

            {/* Subcategory */}
            <div className="mb-4">
              <h5 className="font-medium mb-2">Subcategory</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                  <select
                    value={entry.subcategory_obj_ref.subcategory.subcategory_id}
                    onChange={(e) => handleEntryChange(index, 'subcategory_obj_ref', 'subcategory', { subcategory_id: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    disabled={!entry.category_obj_ref.category.category_id}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories[entry.category_obj_ref.category.category_id]?.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total m²</label>
                  <input
                    type="number"
                    value={entry.subcategory_obj_ref.subcategory_total_m2}
                    onChange={(e) => handleEntryChange(index, 'subcategory_obj_ref', 'subcategory_total_m2', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate</label>
                  <input
                    type="number"
                    value={entry.subcategory_obj_ref.subcategory_rate}
                    onChange={(e) => handleEntryChange(index, 'subcategory_obj_ref', 'subcategory_rate', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    value={entry.subcategory_obj_ref.subcategory_total_amount}
                    onChange={(e) => handleEntryChange(index, 'subcategory_obj_ref', 'subcategory_total_amount', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Remove Entry
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Entry
        </button>
      </div>
      {/* SUBMIT BUTTON */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Budget
        </button>
      </div>
    </form>
  );
};

export default NewBudgetForm;



