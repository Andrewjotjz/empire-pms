"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, DollarSign, ArrowUpRight, ArrowDownRight, Filter, Download, Search, AlertCircle } from "lucide-react"
import BudgetSkeletonLoading from "../loaders/BudgetSkeletonLoading"

// Main component
const BudgetVsActual = () => {
  const [budgetData, setBudgetData] = useState(null)
  const [actualData, setActualData] = useState(null)
  const [activeView, setActiveView] = useState("summary") // summary, type, category, subcategory
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  const [orderState, setOrderState] = useState(null)
  const [fetchOrderLoading, setFetchOrderLoading] = useState(false)
  const [fetchOrderError, setFetchOrderError] = useState(null)

  const [budgetState, setBudgetState] = useState(null)
  const [fetchBudgetLoading, setFetchBudgetLoading] = useState(false)
  const [fetchBudgetError, setFetchBudgetError] = useState(null)

  const [productTypeState, setProductTypeState] = useState([])
  const [isFetchProductTypeLoading, setIsFetchProductTypeLoading] = useState(false)
  const [fetchProductTypeError, setFetchProductTypeError] = useState(null)

  const [aliasState, setAliasState] = useState([])
  const [isFetchAliasLoading, setIsFetchAliasLoading] = useState(false)
  const [fetchAliasError, setFetchAliasError] = useState(null)

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  // Process data to get actual totals by category and subcategory
  // const processActualData = (orders) => {
  //   // Ensure orders is a valid array before proceeding
  //   if (!Array.isArray(orders) || orders.length === 0) {
  //     console.error("Invalid orders data: orders is either null, undefined, or an empty array.");
  //     return {
  //       total: 0,
  //       byType: {},
  //       byCategoryName: {},
  //       bySubcategory: {},
  //     }; // Return a default empty structure if orders is invalid
  //   }

  //   const actualData = {
  //     total: 0,
  //     byType: {},
  //     byCategoryName: {},
  //     bySubcategory: {},
  //   };

  //   orders.forEach((order) => {
  //     if (!order.products || !Array.isArray(order.products)) {
  //       console.warn("Invalid order data: Missing or invalid 'products' array.");
  //       return; // Skip this order if products is missing or invalid
  //     }

  //     actualData.total += order.order_total_amount;

  //     order.products.forEach((product) => {
        
  //       const productRef = product.product_obj_ref;
  //       const aliasObj = aliasState.find(alias => alias._id === productRef.alias);
  //       if (!aliasObj) {
  //         console.warn(`Alias not found for ID: ${productRef.alias}`);
  //         return;
  //       }
  
  //       const aliasName = aliasObj.alias_name;
  //       const aliasLevels = [
  //         aliasName.split(" ").slice(0, 4).join(" "),
  //         aliasName.split(" ").slice(0, 3).join(" "),
  //         aliasName.split(" ").slice(0, 2).join(" ")
  //       ];

  //       // By Type
  //       if (!actualData.byType[product.product_obj_ref.product_type]) {
  //         actualData.byType[product.product_obj_ref.product_type] = 0;
  //       }
  //       actualData.byType[product.product_obj_ref.product_type] += product.order_product_gross_amount;

  //       // By Category (storing at different levels)
  //       aliasLevels.forEach(level => {
  //         actualData.byCategoryName[level] = 
  //           (actualData.byCategoryName[level] || 0) + product.order_product_gross_amount;
  //       });

  //       // By Subcategory
  //       if (!actualData.bySubcategory[product.subcategory]) {
  //         actualData.bySubcategory[product.subcategory] = 0;
  //       }
  //       actualData.bySubcategory[product.subcategory] += product.order_product_gross_amount;
  //     });
  //   });

  //   return actualData;
  // };

  const processActualData = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        console.error("Invalid orders data: orders is either null, undefined, or an empty array.");
        return {
            total: 0,
            byType: {},
            byCategoryName: {},
            bySubcategory: {},
        };
    }

    const actualData = {
        total: 0,
        byType: {},
        byCategoryName: {},
        bySubcategory: {},
    };

    const cleanCategoryName = (name) => {
      return name
          .replace(/\b\d+(\.\d+)?[x*]?\d*(\.\d+)?m\b/gi, '') // Remove '3.6m', '1.2x3.6m', etc.
          .replace(/(\d+mm)$/i, '') // Remove number + 'mm' only at the end of the string (e.g., '25mm')
          .replace(/\s+/g, ' ') // Remove extra spaces
          .trim(); // Trim leading/trailing spaces
    };
  

    orders.forEach((order) => {
      if (!order.products || !Array.isArray(order.products)) {
          console.warn("Invalid order data: Missing or invalid 'products' array.");
          return;
      }

      actualData.total += order.order_total_amount;

      order.products.forEach((product) => {
          const productRef = product.product_obj_ref;
          const aliasObj = aliasState.find(alias => alias._id === productRef.alias);

          if (!aliasObj) {
              console.warn(`Alias not found for ID: ${productRef.alias}`);
              return;
          }

          const aliasName = aliasObj.alias_name;
          const baseCategory = cleanCategoryName(aliasName);

          // By Type
          actualData.byType[productRef.product_type] =
              (actualData.byType[productRef.product_type] || 0) + product.order_product_gross_amount;

          // Group by Base Category
          actualData.byCategoryName[baseCategory] =
              (actualData.byCategoryName[baseCategory] || 0) + product.order_product_gross_amount;

          // By Subcategory (keep full alias name for debugging or further grouping)
          actualData.bySubcategory[aliasName] =
              (actualData.bySubcategory[aliasName] || 0) + product.order_product_gross_amount;
      });
    });

    return actualData;
  };

  // Process budget data
  const processBudgetData = (budget) => {
    // Ensure that budget.entries is not null or undefined
    if (!budget || !budget.entries) {
      console.error("Invalid budget data: 'entries' is null or undefined.");
      return null; // or return a default structure, depending on your needs
    }

    const budgetData = {
      total: 0,
      byType: {},
      Name: {},
      byCategoryName: {},
      bySubcategory: {},
    }

    budget.entries.forEach((entry) => {
      if (!entry.area_info || !Array.isArray(entry.area_info.product_type_obj_ref)) {
        console.warn("Invalid entry data: Missing product_type_obj_ref.");
        return; // Skip this entry if it is invalid
      }

      entry.area_info.product_type_obj_ref.forEach((type) => {
        budgetData.total += type.type_total_amount

        // By Type
        if (!budgetData.byType[type.type_id]) {
          budgetData.byType[type.type_id] = 0
        }
        budgetData.byType[type.type_id] += type.type_total_amount

        if (!Array.isArray(type.category_obj_ref)) {
          console.warn("Invalid type data: Missing category_obj_ref.");
          return; // Skip this type if it is invalid
        }

        type.category_obj_ref.forEach((category) => {
          // By Category
          if (!budgetData.Name[category.category_id]) {
            budgetData.Name[category.category_id] = 0
          }
          budgetData.Name[category.category_id] += category.category_total_amount

          // By Category Name
          if (!budgetData.byCategoryName[categories.find(cat => cat._id === category.category_id).category_name]) {
            budgetData.byCategoryName[categories.find(cat => cat._id === category.category_id).category_name] = 0
          }
          budgetData.byCategoryName[categories.find(cat => cat._id === category.category_id).category_name] += category.category_total_amount

          if (!Array.isArray(category.subcategory_obj_ref)) {
            console.warn("Invalid category data: Missing subcategory_obj_ref.");
            return; // Skip this category if it is invalid
          }

          category.subcategory_obj_ref.forEach((subcategory) => {
            // By Subcategory
            if (!budgetData.bySubcategory[subcategory.subcategory_id]) {
              budgetData.bySubcategory[subcategory.subcategory_id] = 0
            }
            budgetData.bySubcategory[subcategory.subcategory_id] += subcategory.subcategory_total_amount
          })
        })
      })
    })

    return budgetData
  }

  // Calculate variance
  const calculateVariance = (budget, actual) => {
    return budget - actual
  }

  // Calculate variance percentage
  const calculateVariancePercentage = (budget, actual) => {
    if (budget === 0) return 0
    return ((actual - budget) / budget) * 100
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (percentage) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percentage / 100)
  }

  // Fetch budget
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchBudget = async () => {
        setFetchBudgetLoading(true);

        let id = '67e621ab4c5848be61ebe353'

        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget/${id}`, { signal , credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});
            if (!res.ok) {
                throw new Error('Failed to fetch budgets');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }
            
            setFetchBudgetLoading(false);
            setBudgetState(data);
            setFetchBudgetError(null);
        } catch (error) {
            if (error.name === 'AbortError') {
                // do nothing
            } else {
                setFetchBudgetLoading(false);
                setFetchBudgetError(error.message);
            }
        }
    };

    fetchBudget();

    return () => {
        abortController.abort(); // Cleanup
    };
  }, []);

  // Fetch Orders
  const fetchPurchaseOrders = useCallback(async () => {
      try {
          const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { credentials: 'include',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
              }});

          if (!res.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await res.json();

          setOrderState(data);
          setFetchOrderLoading(false);

      } catch (error) {
          setFetchOrderError(error.tokenError);
      } finally {
          setFetchOrderLoading(false);
      }
  }, []);
  useEffect(() => {
      fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Fetch all product types
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchTypes = async () => {
      setIsFetchProductTypeLoading(true); // Set loading state to true at the beginning
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
            
            setIsFetchProductTypeLoading(false);
            setProductTypeState(data);
            data.forEach(type => {
              if (type.type_categories) {
                type.type_categories.forEach(cat => {
                  setCategories((prevCategory) => [
                    ...prevCategory,
                    cat
                  ])
                  if (cat.subcategories) {
                    cat.subcategories.forEach(sub => {
                      setSubcategories((prevSubcategories) => [
                        ...prevSubcategories,
                        sub
                      ])
                    })
                  }
                })
              }
            })
            setFetchProductTypeError(null);
        } catch (error) {
            if (error.name === 'AbortError') {
                // do nothing
            } else {
                setIsFetchProductTypeLoading(false);
                setFetchProductTypeError(error.message);
            }
        }
    };

    fetchTypes();

    return () => {
        abortController.abort(); // Cleanup
    };
  }, []);
  // Fetch all aliases
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchAliases = async () => {
      setIsFetchAliasLoading(true); // Set loading state to true at the beginning
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias`, { signal , credentials: 'include',
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
            
            setIsFetchAliasLoading(false);
            setAliasState(data);
            data.forEach(type => {
              if (type.type_categories) {
                type.type_categories.forEach(cat => {
                  setCategories((prevCategory) => [
                    ...prevCategory,
                    cat
                  ])
                  if (cat.subcategories) {
                    cat.subcategories.forEach(sub => {
                      setSubcategories((prevSubcategories) => [
                        ...prevSubcategories,
                        sub
                      ])
                    })
                  }
                })
              }
            })
            setFetchAliasError(null);
        } catch (error) {
            if (error.name === 'AbortError') {
                // do nothing
            } else {
                setIsFetchAliasLoading(false);
                setFetchAliasError(error.message);
            }
        }
    };

    fetchAliases();

    return () => {
        abortController.abort(); // Cleanup
    };
  }, []);

  // Process fetched data
  useEffect(() => {
    // Ensure that budgetState and its entries are available before processing
    if (!budgetState || !budgetState.entries || budgetState.entries.length === 0) {
      // If entries are missing or empty, don't proceed with processing
      setIsLoading(true); // Set loading state if data isn't ready yet
      return;
    }

    // If budgetState.entries is available, process the data
    setTimeout(() => {
      const processedBudgetData = processBudgetData(budgetState)
      const processedActualData = processActualData(orderState)

      setBudgetData(processedBudgetData)
      setActualData(processedActualData)
      setIsLoading(false) // Set loading to false once data processing is done
    }, 5000);
  }, [budgetState, orderState]);

  

  console.log("actualData", actualData)
  console.log("budgetData", budgetData)
  console.log("aliasState", aliasState)
  console.log("budgetState", budgetState)
  console.log("orderState", orderState)
  console.log("productTypeState", productTypeState)

  // Get type, category and subcategory names from the budget data
  const getTypeName = (typeId) => {
    return productTypeState.find(type => type._id === typeId).type_name
  }

  const getCategoryName = (categoryId) => {
    // for (const entry of budgetState.entries) {
    //   for (const type of entry.area_info.product_type_obj_ref) {
    //     for (const category of type.category_obj_ref) {
    //       if (category.category_id === categoryId) {
    //         return category.category_name || categoryId
    //       }
    //     }
    //   }
    // }
    // return categoryId
    return categories.find(cat => cat._id === categoryId).category_name
  }

  const getSubcategoryName = (subcategoryId) => {
    // for (const entry of budgetState.entries) {
    //   for (const type of entry.area_info.product_type_obj_ref) {
    //     for (const category of type.category_obj_ref) {
    //       for (const subcategory of category.subcategory_obj_ref) {
    //         if (subcategory.subcategory_id === subcategoryId) {
    //           return subcategory.subcategory_name || subcategoryId
    //         }
    //       }
    //     }
    //   }
    // }
    // return subcategoryId
    return subcategories.find(sub => sub._id === subcategoryId).subcategory_name
  }

  if (isLoading) {
    return (
      <BudgetSkeletonLoading />
    )
  }

  // Calculate total variance
  const totalVariance = calculateVariance(budgetData.total, actualData.total)
  const totalVariancePercentage = calculateVariancePercentage(budgetData.total, actualData.total)
  const isOverBudget = actualData.total > budgetData.total

  // Prepare data for the detailed view
  const getDetailedData = () => {
    switch (activeView) {
      case "type":
        return Object.keys(budgetData.byType)
          .map((typeId) => {
            const budgetAmount = budgetData.byType[typeId] || 0
            const actualAmount = actualData.byType[typeId] || 0
            const variance = calculateVariance(budgetAmount, actualAmount)
            const variancePercentage = calculateVariancePercentage(budgetAmount, actualAmount)

            return {
              id: typeId,
              name: getTypeName(typeId),
              budget: budgetAmount,
              actual: actualAmount,
              variance,
              variancePercentage,
            }
          })
          .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      case "category":
        return Object.keys(budgetData.byCategoryName)
          .map((categoryId) => {
            const budgetAmount = budgetData.byCategoryName[categoryId] || 0
            const actualAmount = actualData.byCategoryName[categoryId] || 0
            const variance = calculateVariance(budgetAmount, actualAmount)
            const variancePercentage = calculateVariancePercentage(budgetAmount, actualAmount)

            return {
              id: categoryId,
              name: categoryId,
              budget: budgetAmount,
              actual: actualAmount,
              variance,
              variancePercentage,
            }
          })
          .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      case "subcategory":
        return Object.keys(budgetData.bySubcategory)
          .map((subcategoryId) => {
            const budgetAmount = budgetData.bySubcategory[subcategoryId] || 0
            const actualAmount = actualData.bySubcategory[subcategoryId] || 0
            const variance = calculateVariance(budgetAmount, actualAmount)
            const variancePercentage = calculateVariancePercentage(budgetAmount, actualAmount)

            return {
              id: subcategoryId,
              name: getSubcategoryName(subcategoryId),
              budget: budgetAmount,
              actual: actualAmount,
              variance,
              variancePercentage,
            }
          })
          .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      default:
        return []
    }
  }

  const detailedData = getDetailedData()

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget vs Actual</h1>
            <p className="text-gray-500">{budgetState.budget_name}</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(budgetData.total)}</h2>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Actual</p>
                <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(actualData.total)}</h2>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <BarChart className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Variance</p>
                <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(Math.abs(totalVariance))}</h2>
                <div className="flex items-center mt-1">
                  <span className={`text-sm font-medium ${isOverBudget ? "text-red-500" : "text-green-500"}`}>
                    {isOverBudget ? (
                      <ArrowUpRight className="h-4 w-4 inline mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 inline mr-1" />
                    )}
                    {formatPercentage(Math.abs(totalVariancePercentage))}{" "}
                    {isOverBudget ? "Over Budget" : "Under Budget"}
                  </span>
                </div>
              </div>
              <div className={`p-3 ${isOverBudget ? "bg-red-50" : "bg-green-50"} rounded-full`}>
                {isOverBudget ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <DollarSign className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === "summary" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setActiveView("summary")}
              >
                Summary
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === "type" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setActiveView("type")}
              >
                By Type
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === "category" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setActiveView("category")}
              >
                By Category
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === "subcategory" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => setActiveView("subcategory")}
              >
                By Subcategory
              </button>
            </div>

            {activeView !== "summary" && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Detailed View */}
        {activeView !== "summary" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Budget
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actual
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Variance
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.actual)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(Math.abs(item.variance))}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        <div className="flex items-center justify-end">
                          {item.variance >= 0 ? (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          )}
                          {formatPercentage(Math.abs(item.variancePercentage))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary View - Visual Chart */}
        {activeView === "summary" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual by Category</h3>
            <div className="space-y-4">
              {/* {Object.keys(budgetData.byCategoryName).map((categoryName) => {
                const budgetAmount = budgetData.byCategoryName[categoryName] || 0


                // Clean the categoryName by removing numbers and units
                const cleanedCategoryName = categoryName
                .replace(/\d+(\.\d+)?[x*]?(\d+(\.\d+)?)?[mmtb]+/gi, '').trim();

                // Find a matching key in actualData.byCategoryName (using a partial match)
                const matchingKey = Object.keys(actualData.byCategoryName).find(actualCategory =>
                  actualCategory.includes(cleanedCategoryName) // Check if the cleaned category name is a substring
                );

                // If a match is found, get the corresponding value
                const actualAmount = matchingKey ? actualData.byCategoryName[matchingKey] : 0;



                const percentage = (actualAmount / budgetAmount) * 100
                const isOver = actualAmount > budgetAmount */}
                {Object.keys(budgetData.byCategoryName).map((categoryName) => {
                  const budgetAmount = budgetData.byCategoryName[categoryName] || 0;

                  // Clean the categoryName by removing numbers and units
                  const cleanedCategoryName = categoryName
                      .replace(/\d+(\.\d+)?[x*]?(\d+(\.\d+)?)?[mmtb]+/gi, '').trim();

                  // Find matching keys in actualData.byCategoryName (using partial match)
                  const matchingKeys = Object.keys(actualData.byCategoryName).filter(actualCategory =>
                      actualCategory.includes(cleanedCategoryName) // Check if the cleaned category name is a substring
                  );

                  // Sum the actual amounts for all matching categories
                  const actualAmount = matchingKeys.reduce((sum, key) => {
                      return sum + (actualData.byCategoryName[key] || 0); // Add the amount for each matching category
                  }, 0);

                  // Calculate percentage and check if actualAmount exceeds budgetAmount
                  const percentage = (actualAmount / budgetAmount) * 100;
                  const isOver = actualAmount > budgetAmount;
                  
                return (
                  <div key={categoryName} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{categoryName}</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(actualAmount)} / {formatCurrency(budgetAmount)}
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${isOver ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      {isOver && (
                        <div
                          className="absolute top-1 h-2 border-r-2 border-red-700"
                          style={{ left: "100%", transform: "translateX(-100%)" }}
                        ></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetVsActual

