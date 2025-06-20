"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  Search,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Percent,
  TrendingDown,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react"

const BudgetVsActual = () => {
  // State for data
  const { id } = useParams()
  const [budgetState, setBudgetState] = useState(null)
  const [orderState, setOrderState] = useState([])
  const [invoiceState, setInvoiceState] = useState([])
  const [aliasState, setAliasState] = useState([])
  const [productTypeState, setProductTypeState] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  console.log("invoiceState", invoiceState)
  console.log("productTypeState", productTypeState)

  // State for processed data
  const [processedData, setProcessedData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)

    console.log("filteredData", filteredData)
  // Loading states
  const [fetchBudgetLoading, setFetchBudgetLoading] = useState(false)
  const [fetchOrderLoading, setFetchOrderLoading] = useState(false)
  const [isFetchProductTypeLoading, setIsFetchProductTypeLoading] = useState(false)
  const [isFetchInvoiceLoading, setIsFetchInvoiceLoading] = useState(false)
  const [isFetchAliasLoading, setIsFetchAliasLoading] = useState(false)

  // Error states
  const [fetchBudgetError, setFetchBudgetError] = useState(null)
  const [fetchOrderError, setFetchOrderError] = useState(null)
  const [fetchProductTypeError, setFetchProductTypeError] = useState(null)
  const [fetchInvoiceError, setFetchInvoiceError] = useState(null)
  const [fetchAliasError, setFetchAliasError] = useState(null)

  // UI states for expansion
  const [expandedAreas, setExpandedAreas] = useState({})
  const [expandedLevels, setExpandedLevels] = useState({})
  const [expandedSubareas, setExpandedSubareas] = useState({})
  const [expandedTypes, setExpandedTypes] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})

  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // Jan 1 of current year
    end: new Date().toISOString().split("T")[0], // Today
  })

  // Fetch budget
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchBudget = async () => {
      setFetchBudgetLoading(true)

      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/budget/${id}`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch budgets")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setFetchBudgetLoading(false)
        setBudgetState(data)
        setFetchBudgetError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setFetchBudgetLoading(false)
          setFetchBudgetError(error.message)
        }
      }
    }

    fetchBudget()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  // Fetch Orders
  const fetchPurchaseOrders = useCallback(async () => {
    if (!budgetState || !budgetState.project) return

    setFetchOrderLoading(true)

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      })

      if (!res.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await res.json()

      setOrderState(data.filter((order) => order.project._id === budgetState.project))
      setFetchOrderError(null)
    } catch (error) {
      setFetchOrderError(error.message || error.tokenError)
    } finally {
      setFetchOrderLoading(false)
    }
  }, [budgetState])

  useEffect(() => {
    if (budgetState && budgetState.project) {
      fetchPurchaseOrders()
    }
  }, [fetchPurchaseOrders, budgetState])

  // Fetch all product types
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchTypes = async () => {
      setIsFetchProductTypeLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsFetchProductTypeLoading(false)
        setProductTypeState(data)

        // Extract categories and subcategories
        const newCategories = []
        const newSubcategories = []

        data.forEach((type) => {
          if (type.type_categories) {
            type.type_categories.forEach((cat) => {
              newCategories.push(cat)
              if (cat.subcategories) {
                cat.subcategories.forEach((sub) => {
                  newSubcategories.push(sub)
                })
              }
            })
          }
        })

        setCategories(newCategories)
        setSubcategories(newSubcategories)
        setFetchProductTypeError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsFetchProductTypeLoading(false)
          setFetchProductTypeError(error.message)
        }
      }
    }

    fetchTypes()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  // Fetch all invoices
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchInvoices = async () => {
      setIsFetchInvoiceLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsFetchInvoiceLoading(false)
        setInvoiceState(data)
        setFetchInvoiceError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsFetchInvoiceLoading(false)
          setFetchInvoiceError(error.message)
        }
      }
    }

    fetchInvoices()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])
  // Fetch all aliases
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchAliases = async () => {
      setIsFetchAliasLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alias`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsFetchAliasLoading(false)
        setAliasState(data)
        setFetchAliasError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsFetchAliasLoading(false)
          setFetchAliasError(error.message)
        }
      }
    }

    fetchAliases()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])


  // Process budget data with full hierarchy
  const processBudgetData = useCallback(() => {
    if (!budgetState) return null

    const processedBudget = {
      budgetName: budgetState.budget_name,
      projectId: budgetState.project,
      areas: [],
      totalBudget: 0,
      totalM2: 0,
    }

    // Process each area in the budget
    budgetState.entries.forEach((entry) => {
      const areaInfo = entry.area_info

      // Process area level data
      const area = {
        area_id: areaInfo.area_id,
        area_name: areaInfo.area_name,
        types: [],
        levels: [],
        budget: 0,
        m2: 0,
      }

      // Process area-level product types
      if (areaInfo.product_type_obj_ref && areaInfo.product_type_obj_ref.length > 0) {
        areaInfo.product_type_obj_ref.forEach((typeRef) => {
          console.log("typeRef", typeRef)
          // Find product type name from productTypeState
          const productType = productTypeState.find((pt) => pt._id === typeRef.type_id.toString())
          const typeName = productType ? productType.type_name : "Unknown Type"

          const type = {
            type_id: typeRef.type_id,
            type_unit: productType.type_unit, type_name: typeName,
            type_total_m2: typeRef.type_total_m2,
            type_rate: typeRef.type_rate,
            type_total_amount: typeRef.type_total_amount,
            categories: [],
            budget: typeRef.type_total_amount,
            m2: typeRef.type_total_m2,
            parent_type: "area",
            parent_id: areaInfo.area_id,
            parent_name: areaInfo.area_name,
          }

          // Process categories within the product type
          typeRef.category_obj_ref.forEach((categoryRef) => {
            // Find category name from categories
            const category = categories.find((c) => c._id === categoryRef.category_id.toString())
            const categoryName = category ? category.category_name : "Unknown Category"

            const cat = {
              category_id: categoryRef.category_id,
              category_unit: category.category_unit, category_name: categoryName,
              category_total_m2: categoryRef.category_total_m2,
              category_rate: categoryRef.category_rate,
              category_total_amount: categoryRef.category_total_amount,
              subcategories: [],
              budget: categoryRef.category_total_amount,
              m2: categoryRef.category_total_m2,
            }

            // Process subcategories within the category
            categoryRef.subcategory_obj_ref.forEach((subcategoryRef) => {
              // Find subcategory name from subcategories
              const subcategory = subcategories.find((sc) => sc._id === subcategoryRef.subcategory_id.toString())
              const subcategoryName = subcategory ? subcategory.subcategory_name : "Unknown Subcategory"

              const subcat = {
                subcategory_id: subcategoryRef.subcategory_id,
                subcategory_unit: subcategory.subcategory_unit, subcategory_name: subcategoryName,
                subcategory_total_m2: subcategoryRef.subcategory_total_m2,
                subcategory_rate: subcategoryRef.subcategory_rate,
                subcategory_total_amount: subcategoryRef.subcategory_total_amount,
                budget: subcategoryRef.subcategory_total_amount,
                m2: subcategoryRef.subcategory_total_m2,
              }

              cat.subcategories.push(subcat)
            })

            type.categories.push(cat)
          })

          area.types.push(type)
          area.budget += type.budget
          area.m2 += type.m2
        })
      }

      // Process levels
      if (areaInfo.level_info && areaInfo.level_info.length > 0) {
        areaInfo.level_info.forEach((levelInfo) => {
          const level = {
            level_id: levelInfo.level_id,
            level_name: levelInfo.level_name,
            types: [],
            subareas: [],
            budget: 0,
            m2: 0,
          }

          // Process level-specific product types
          if (levelInfo.product_type_obj_ref && levelInfo.product_type_obj_ref.length > 0) {
            levelInfo.product_type_obj_ref.forEach((typeRef) => {
              // Find product type name from productTypeState
              const productType = productTypeState.find((pt) => pt._id === typeRef.type_id.toString())
              const typeName = productType ? productType.type_name : "Unknown Type"

              const type = {
                type_id: typeRef.type_id,
                type_unit: productType.type_unit, type_name: typeName,
                type_total_m2: typeRef.type_total_m2,
                type_rate: typeRef.type_rate,
                type_total_amount: typeRef.type_total_amount,
                categories: [],
                budget: typeRef.type_total_amount,
                m2: typeRef.type_total_m2,
                parent_type: "level",
                parent_id: levelInfo.level_id,
                parent_name: levelInfo.level_name,
              }

              // Process categories within the product type
              typeRef.category_obj_ref.forEach((categoryRef) => {
                // Find category name from categories
                const category = categories.find((c) => c._id === categoryRef.category_id.toString())
                const categoryName = category ? category.category_name : "Unknown Category"

                const cat = {
                  category_id: categoryRef.category_id,
                  category_unit: category.category_unit, category_name: categoryName,
                  category_total_m2: categoryRef.category_total_m2,
                  category_rate: categoryRef.category_rate,
                  category_total_amount: categoryRef.category_total_amount,
                  subcategories: [],
                  budget: categoryRef.category_total_amount,
                  m2: categoryRef.category_total_m2,
                }

                // Process subcategories within the category
                categoryRef.subcategory_obj_ref.forEach((subcategoryRef) => {
                  // Find subcategory name from subcategories
                  const subcategory = subcategories.find((sc) => sc._id === subcategoryRef.subcategory_id.toString())
                  const subcategoryName = subcategory ? subcategory.subcategory_name : "Unknown Subcategory"

                  const subcat = {
                    subcategory_id: subcategoryRef.subcategory_id,
                    subcategory_unit: subcategory.subcategory_unit, subcategory_name: subcategoryName,
                    subcategory_total_m2: subcategoryRef.subcategory_total_m2,
                    subcategory_rate: subcategoryRef.subcategory_rate,
                    subcategory_total_amount: subcategoryRef.subcategory_total_amount,
                    budget: subcategoryRef.subcategory_total_amount,
                    m2: subcategoryRef.subcategory_total_m2,
                  }

                  cat.subcategories.push(subcat)
                })

                type.categories.push(cat)
              })

              level.types.push(type)
              level.budget += type.budget
              level.m2 += type.m2
            })
          }

          // Process subareas
          if (levelInfo.subarea_info && levelInfo.subarea_info.length > 0) {
            levelInfo.subarea_info.forEach((subareaInfo) => {
              const subarea = {
                subarea_id: subareaInfo.subarea_id,
                subarea_name: subareaInfo.subarea_name,
                types: [],
                budget: 0,
                m2: 0,
              }

              // Process subarea-specific product types
              if (subareaInfo.product_type_obj_ref && subareaInfo.product_type_obj_ref.length > 0) {
                subareaInfo.product_type_obj_ref.forEach((typeRef) => {
                  // Find product type name from productTypeState
                  const productType = productTypeState.find((pt) => pt._id === typeRef.type_id.toString())
                  const typeName = productType ? productType.type_name : "Unknown Type"

                  const type = {
                    type_id: typeRef.type_id,
                    type_unit: productType.type_unit, type_name: typeName,
                    type_total_m2: typeRef.type_total_m2,
                    type_rate: typeRef.type_rate,
                    type_total_amount: typeRef.type_total_amount,
                    categories: [],
                    budget: typeRef.type_total_amount,
                    m2: typeRef.type_total_m2,
                    parent_type: "subarea",
                    parent_id: subareaInfo.subarea_id,
                    parent_name: subareaInfo.subarea_name,
                  }

                  // Process categories within the product type
                  typeRef.category_obj_ref.forEach((categoryRef) => {
                    // Find category name from categories
                    const category = categories.find((c) => c._id === categoryRef.category_id.toString())
                    const categoryName = category ? category.category_name : "Unknown Category"

                    const cat = {
                      category_id: categoryRef.category_id,
                      category_unit: category.category_unit, category_name: categoryName,
                      category_total_m2: categoryRef.category_total_m2,
                      category_rate: categoryRef.category_rate,
                      category_total_amount: categoryRef.category_total_amount,
                      subcategories: [],
                      budget: categoryRef.category_total_amount,
                      m2: categoryRef.category_total_m2,
                    }

                    // Process subcategories within the category
                    categoryRef.subcategory_obj_ref.forEach((subcategoryRef) => {
                      // Find subcategory name from subcategories
                      const subcategory = subcategories.find(
                        (sc) => sc._id === subcategoryRef.subcategory_id.toString(),
                      )
                      const subcategoryName = subcategory ? subcategory.subcategory_name : "Unknown Subcategory"

                      const subcat = {
                        subcategory_id: subcategoryRef.subcategory_id,
                        subcategory_unit: subcategory.subcategory_unit, subcategory_name: subcategoryName,
                        subcategory_total_m2: subcategoryRef.subcategory_total_m2,
                        subcategory_rate: subcategoryRef.subcategory_rate,
                        subcategory_total_amount: subcategoryRef.subcategory_total_amount,
                        budget: subcategoryRef.subcategory_total_amount,
                        m2: subcategoryRef.subcategory_total_m2,
                      }

                      cat.subcategories.push(subcat)
                    })

                    type.categories.push(cat)
                  })

                  subarea.types.push(type)
                  subarea.budget += type.budget
                  subarea.m2 += type.m2
                })
              }

              level.subareas.push(subarea)
              level.budget += subarea.budget
              level.m2 += subarea.m2
            })
          }

          area.levels.push(level)
          area.budget += level.budget
          area.m2 += level.m2
        })
      }

      processedBudget.areas.push(area)
      processedBudget.totalBudget += area.budget
      processedBudget.totalM2 += area.m2
    })

    return processedBudget
  }, [budgetState, productTypeState, categories, subcategories])

  // ***********************************************************************************************************************************************************************
  // Process invoice data with full hierarchy
  const processInvoiceData = useCallback(() => {
    if (!invoiceState || !invoiceState.length || !budgetState) return null

    // Filter invoices related to the current project
    const projectInvoices = invoiceState.filter((invoice) => {
      // Check if invoice has an order and if that order is related to the current project
      return invoice.order && orderState.some((order) => order._id === invoice.order._id)
    })

    if (projectInvoices.length === 0) return null

    // Initialize structure to match budget data
    const processedInvoices = {
      totalActual: 0,
      totalM2: 0,
      areaMap: new Map(), // Map to aggregate by area
      levelMap: new Map(), // Map to aggregate by level
      subareaMap: new Map(), // Map to aggregate by subarea
    }

    // Process each invoice
    projectInvoices.forEach((invoice) => {
      // Process regular products
      if (invoice.products && invoice.products.length > 0) { //if there's products
        invoice.products.forEach((product) => { // for each product
          if (!product.product_obj_ref) return // if product doesn't have property

          const amount = product.invoice_product_gross_amount_a || 0
          const m2 = product.invoice_product_qty_a || 0
          const location = product.invoice_product_location || "Unknown Location"

          // Parse location to determine area, level, and subarea
          const locationParts = location.split(">").map((part) => part.trim())

          let areaName = location
          let levelName = null
          let subareaName = null

          if (locationParts.length >= 1) {
            areaName = locationParts[0]
          }
          if (locationParts.length >= 2) {
            levelName = locationParts[1]
          }
          if (locationParts.length >= 3) {
            subareaName = locationParts[2]
          }

          // Get product details to determine type, category, subcategory
          const productDetails = product.product_obj_ref

          // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE Use Product_obj to find Product_type
          // Using product_type ID, find productType object
          const productType = productTypeState.find((pt) => pt._id === productDetails.product_type)
          if (!productType) return

          const typeId = productType._id
          const typeName = productType.type_name
          
          // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  Create AREA, set area name and create TYPE. Immediately calculate the SUM of 'actual' and 'actualM2'. [ Layer: Area ]
          // For this invoice, check if it has Area
          // Update area data
          if (!processedInvoices.areaMap.has(areaName)) {
            processedInvoices.areaMap.set(areaName, {
              actual: 0,
              actualM2: 0,
              typeMap: new Map(),
            })
          }

          const areaData = processedInvoices.areaMap.get(areaName)
          areaData.actual += amount
          areaData.actualM2 += m2

          // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  
          // *************** In the AREA's punya TYPE, create TYPE and set its type name, then create Category and Subcategory. Immediately calculate the SUM of 'actual' and 'actualM2'. #1 [ Layer: Area's ProductType]

          // Update area-level product type data
          if (!areaData.typeMap.has(typeId)) {
            areaData.typeMap.set(typeId, {
              name: typeName,
              actual: 0,
              actualM2: 0,
              categoryMap: new Map()
            })
          }

          const areaTypeData = areaData.typeMap.get(typeId)
          areaTypeData.actual += amount
          areaTypeData.actualM2 += m2

          // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE If the Area has Levels, create a Key for 'levelMap', set its name and create TYPE. [ Layer: Area's Level ]
          // Update level data if available
          if (levelName) {
            const levelKey = `${areaName}/${levelName}`
            if (!processedInvoices.levelMap.has(levelKey)) {
              processedInvoices.levelMap.set(levelKey, {
                actual: 0,
                actualM2: 0,
                typeMap: new Map(),
              })
            }

            const levelData = processedInvoices.levelMap.get(levelKey)
            levelData.actual += amount
            levelData.actualM2 += m2

            // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE Level will have TYPE, set Type name and create Category and Subcategory. #2 [ Layer: Level's ProductType ]
            // Update level-specific product type data
            if (!levelData.typeMap.has(typeId)) {
              levelData.typeMap.set(typeId, {
                name: typeName,
                actual: 0,
                actualM2: 0,
                categoryMap: new Map()
              })
            }

            const levelTypeData = levelData.typeMap.get(typeId)
            levelTypeData.actual += amount
            levelTypeData.actualM2 += m2

            // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE If the Level has Subareas, create a Key for 'subareaMap', set its name and create TYPE. [ Layer: Level's Subarea ]
            // Update subarea data if available
            if (subareaName) {
              const subareaKey = `${areaName}/${levelName}/${subareaName}`
              if (!processedInvoices.subareaMap.has(subareaKey)) {
                processedInvoices.subareaMap.set(subareaKey, {
                  actual: 0,
                  actualM2: 0,
                  typeMap: new Map(),
                })
              }

              const subareaData = processedInvoices.subareaMap.get(subareaKey)
              subareaData.actual += amount
              subareaData.actualM2 += m2

              // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE Subarea will have TYPE, set Type name and create Category and Subcategory. #2 [ Layer: Subarea's ProductType ]
              // Update subarea-specific product type data
              if (!subareaData.typeMap.has(typeId)) {
                subareaData.typeMap.set(typeId, {
                  name: typeName,
                  actual: 0,
                  actualM2: 0,
                  categoryMap: new Map()
                })
              }

              const subareaTypeData = subareaData.typeMap.get(typeId)
              subareaTypeData.actual += amount
              subareaTypeData.actualM2 += m2
            }
          }

          // ! STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ****************************************************  BACK to [#1 Layer: Area's ProductType ]

          // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Area's ProductType has Category, set its ID as Key and create Subcategory. [ Layer: Area's ProductType's CATEGORY ]
          // Find category if available
          if (productDetails.alias) {
            const productAlias = aliasState.find((alias) => alias._id === productDetails.alias);
            const productAliasName = productAlias?.alias_name?.toLowerCase();

            let category = null;
            let matchedSubcategory = null;

            if (productAliasName) {
              // Try to find a category that matches the alias name
              category = categories.find((cat) =>
                productAliasName.includes(cat.category_name.toLowerCase())
              );

              // If no direct category match, try to find a subcategory match
              if (!category) {
                for (const cat of categories) {
                  const subcategory = cat.subcategories.find((sc) =>
                    productAliasName.includes(sc.subcategory_name.toLowerCase())
                  );
                  if (subcategory) {
                    category = cat;
                    matchedSubcategory = subcategory;
                    break;
                  }
                }
              }
            }

            if (category) {
              const categoryId = category._id
              const categoryName = category.category_name

              // Update category data for area
              if (!areaTypeData.categoryMap.has(categoryId)) {
                areaTypeData.categoryMap.set(categoryId, {
                  name: categoryName,
                  actual: 0,
                  actualM2: 0,
                  subcategoryMap: new Map(), // this is getting used at line 844
                })
              }

              const areaCategoryData = areaTypeData.categoryMap.get(categoryId)
              areaCategoryData.actual += amount
              areaCategoryData.actualM2 += m2

              // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ****************************************************  BACK to [ Layer: Area's Level's ProductType ]

              // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Level's ProductType has Category, set its ID as Key and create Subcategory. [ Layer: Level's ProductType's CATEGORY ]

              // Update category data for level if available
              if (levelName) {
                const levelData = processedInvoices.levelMap.get(`${areaName}/${levelName}`)
                const levelTypeData = levelData.typeMap.get(typeId)

                if (!levelTypeData.categoryMap.has(categoryId)) {
                  levelTypeData.categoryMap.set(categoryId, {
                    name: categoryName,
                    actual: 0,
                    actualM2: 0,
                    subcategoryMap: new Map(), // this line should be used too
                  })
                }

                const levelCategoryData = levelTypeData.categoryMap.get(categoryId)
                levelCategoryData.actual += amount
                levelCategoryData.actualM2 += m2

                // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ****************************************************  BACK to [ Layer: Area's Level's Subarea's ProductType ]

                // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Subarea's ProductType has Category, set its ID as Key and create Subcategory. [ Layer: Subarea's ProductType's CATEGORY ]

                // Update category data for subarea if available
                if (subareaName) {
                  const subareaData = processedInvoices.subareaMap.get(`${areaName}/${levelName}/${subareaName}`)
                  const subareaTypeData = subareaData.typeMap.get(typeId)

                  if (!subareaTypeData.categoryMap.has(categoryId)) {
                    subareaTypeData.categoryMap.set(categoryId, {
                      name: categoryName,
                      actual: 0,
                      actualM2: 0,
                      subcategoryMap: new Map(),
                    })
                  }

                  const subareaCategoryData = subareaTypeData.categoryMap.get(categoryId)
                  subareaCategoryData.actual += amount
                  subareaCategoryData.actualM2 += m2
                }
              }

              // ! STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ****************************************************  BEFORE[ Layer: Area's ProductType ] NOW[ Layer: Area's ProductType's Category ]

              // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Area'sProductType'sCategory has Subcategory, set its ID as Key and create Subcategory. [ Layer: Area's ProductType's Category's SUBCATEGORY ]

              if (productDetails.alias) {
                // First, get the alias object
                const productAlias = aliasState.find((alias) => alias._id === productDetails.alias)

                if (productAlias) {
                  // Try to find a direct match first (more reliable)
                  let subcategory = subcategories.find((sc) => aliasState.find((alias) => alias._id === productDetails.alias).alias_name.toLowerCase().includes(sc.subcategory_name.toLowerCase()))

                  // If no direct match, try the substring approach as fallback
                  if (!subcategory) {
                    subcategory = subcategories.find(
                      (sc) =>
                        productAlias.alias_name.toLowerCase().includes(sc.subcategory_name.toLowerCase()) ||
                        sc.subcategory_name.toLowerCase().includes(productAlias.alias_name.toLowerCase()),
                    )
                  }

                  if (subcategory) {
                    const subcategoryId = subcategory._id
                    const subcategoryName = subcategory.subcategory_name

                    // Rest of your code for updating subcategory data...
                    // Update subcategory data for area
                    if (!areaCategoryData.subcategoryMap.has(subcategoryId)) {
                      areaCategoryData.subcategoryMap.set(subcategoryId, {
                        name: subcategoryName,
                        actual: 0,
                        actualM2: 0,
                      })
                    }

                    const areaSubcategoryData = areaCategoryData.subcategoryMap.get(subcategoryId)
                    areaSubcategoryData.actual += amount
                    areaSubcategoryData.actualM2 += m2

                    // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Level'sProductType'sCategory has Subcategory, set its ID as Key. [ Layer: Level's ProductType's Category's SUBCATEGORY ]
                    // Update subcategory data for level if available
                    if (levelName) {
                      const levelData = processedInvoices.levelMap.get(`${areaName}/${levelName}`)
                      const levelTypeData = levelData.typeMap.get(typeId)
                      const levelCategoryData = levelTypeData.categoryMap.get(categoryId)

                      if (!levelCategoryData.subcategoryMap.has(subcategoryId)) {
                        levelCategoryData.subcategoryMap.set(subcategoryId, {
                          name: subcategoryName,
                          actual: 0,
                          actualM2: 0,
                        })
                      }

                      const levelSubcategoryData = levelCategoryData.subcategoryMap.get(subcategoryId)
                      levelSubcategoryData.actual += amount
                      levelSubcategoryData.actualM2 += m2


                      // **************** STARTS HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEE  If the Subarea'sProductType'sCategory has Subcategory, set its ID as Key. [ Layer: Subarea's ProductType's Category's SUBCATEGORY ]
                      // Update subcategory data for subarea if available
                      if (subareaName) {
                        const subareaData = processedInvoices.subareaMap.get(`${areaName}/${levelName}/${subareaName}`)
                        const subareaTypeData = subareaData.typeMap.get(typeId)
                        const subareaCategoryData = subareaTypeData.categoryMap.get(categoryId)

                        if (!subareaCategoryData.subcategoryMap.has(subcategoryId)) {
                          subareaCategoryData.subcategoryMap.set(subcategoryId, {
                            name: subcategoryName,
                            actual: 0,
                            actualM2: 0,
                          })
                        }

                        const subareaSubcategoryData = subareaCategoryData.subcategoryMap.get(subcategoryId)
                        subareaSubcategoryData.actual += amount
                        subareaSubcategoryData.actualM2 += m2
                      }
                    }
                  }
                }
              }
            }
          }
          // Update total
          processedInvoices.totalActual += amount
          processedInvoices.totalM2 += m2
        })
      }

      // ! ***************************************************************************** STOPS HERE *************************************************************************************
      // Process custom products
      if (invoice.custom_products && invoice.custom_products.length > 0) {
        invoice.custom_products.forEach((customProduct) => {
          const amount = customProduct.custom_order_gross_amount || 0
          const m2 = customProduct.custom_order_qty || 0
          const location = customProduct.custom_product_location || "Unknown Location"

          // Parse location to determine area, level, and subarea
          const locationParts = location.split("/").map((part) => part.trim())

          let areaName = location
          let levelName = null
          let subareaName = null

          if (locationParts.length >= 1) {
            areaName = locationParts[0]
          }
          if (locationParts.length >= 2) {
            levelName = locationParts[1]
          }
          if (locationParts.length >= 3) {
            subareaName = locationParts[2]
          }

          // Update area data
          if (!processedInvoices.areaMap.has(areaName)) {
            processedInvoices.areaMap.set(areaName, {
              actual: 0,
              actualM2: 0,
              typeMap: new Map(),
            })
          }

          const areaData = processedInvoices.areaMap.get(areaName)
          areaData.actual += amount
          areaData.actualM2 += m2

          // Update level data if available
          if (levelName) {
            const levelKey = `${areaName}/${levelName}`
            if (!processedInvoices.levelMap.has(levelKey)) {
              processedInvoices.levelMap.set(levelKey, {
                actual: 0,
                actualM2: 0,
                typeMap: new Map(),
              })
            }

            const levelData = processedInvoices.levelMap.get(levelKey)
            levelData.actual += amount
            levelData.actualM2 += m2

            // Update subarea data if available
            if (subareaName) {
              const subareaKey = `${areaName}/${levelName}/${subareaName}`
              if (!processedInvoices.subareaMap.has(subareaKey)) {
                processedInvoices.subareaMap.set(subareaKey, {
                  actual: 0,
                  actualM2: 0,
                  typeMap: new Map(),
                })
              }

              const subareaData = processedInvoices.subareaMap.get(subareaKey)
              subareaData.actual += amount
              subareaData.actualM2 += m2
            }
          }

          // Update total
          processedInvoices.totalActual += amount
          processedInvoices.totalM2 += m2
        })
      }

      // Add delivery, other fees, and credits to total
      processedInvoices.totalActual += invoice.invoiced_delivery_fee || 0
      processedInvoices.totalActual += invoice.invoiced_other_fee || 0
      processedInvoices.totalActual -= invoice.invoiced_credit || 0
    })

    return processedInvoices
  }, [invoiceState, budgetState, orderState, productTypeState, categories, subcategories])

  const mergeData = useCallback(() => {
    const budgetData = processBudgetData()
    const actualData = processInvoiceData()

    if (!budgetData || !actualData) return null

    // Find project name
    const projectName =
      orderState.length > 0 && orderState[0].project ? orderState[0].project.project_name : "Unknown Project"

    const mergedData = {
      projectName: projectName,
      budgetName: budgetData.budgetName,
      summary: {
        totalBudget: budgetData.totalBudget,
        totalActual: actualData.totalActual,
        variance: budgetData.totalBudget - actualData.totalActual,
        varianceM2: budgetData.totalM2 - actualData.totalM2,
        variancePercent:
          budgetData.totalBudget > 0
            ? ((budgetData.totalBudget - actualData.totalActual) / budgetData.totalBudget) * 100
            : 0,
      },
      areas: [],
    }

    // Process each area in the budget
    budgetData.areas.forEach((budgetArea) => {
      console.log("budgetArea", budgetArea)
      const areaName = budgetArea.area_name
      const actualArea = actualData.areaMap.get(areaName) || { actual: 0, actualM2: 0, typeMap: new Map() }

      const area = {
        area_name: areaName,
        budget: budgetArea.budget,
        m2: budgetArea.m2,
        actual: actualArea.actual,
        actualM2: actualArea.actualM2,
        variance: budgetArea.budget - actualArea.actual,
        varianceM2: budgetArea.m2 - actualArea.actualM2,
        variancePercent:
          budgetArea.budget > 0 ? ((budgetArea.budget - actualArea.actual) / budgetArea.budget) * 100 : 0,
        types: [],
        levels: [],
      }

      // Process area-level product types
      budgetArea.types.forEach((budgetType) => {
        console.log("budgetType", budgetType)
        const typeId = budgetType.type_id
        const actualType = actualArea.typeMap.get(typeId) || {
          name: "",
          actual: 0,
          actualM2: 0,
          categoryMap: new Map(),
        }

        const type = {
          type_unit: budgetType.type_unit, type_name: budgetType.type_name,
          budget: budgetType.budget,
          m2: budgetType.m2,
          actual: actualType.actual,
          actualM2: actualType.actualM2,
          variance: budgetType.budget - actualType.actual,
          varianceM2: budgetType.m2 - actualType.actualM2,
          variancePercent:
            budgetType.budget > 0 ? ((budgetType.budget - actualType.actual) / budgetType.budget) * 100 : 0,
          categories: [],
        }

        // Process each category in the product type
        budgetType.categories.forEach((budgetCategory) => {
          const categoryId = budgetCategory.category_id
          const actualCategory = actualType.categoryMap.get(categoryId) || {
            name: "",
            actual: 0,
            actualM2: 0,
            subcategoryMap: new Map(),
          }

          const category = {
            category_unit: budgetCategory.category_unit, category_name: budgetCategory.category_name,
            budget: budgetCategory.budget,
            m2: budgetCategory.m2,
            actual: actualCategory.actual,
            actualM2: actualCategory.actualM2,
            variance: budgetCategory.budget - actualCategory.actual,
            varianceM2: budgetCategory.m2 - actualCategory.actualM2,
            variancePercent:
              budgetCategory.budget > 0
                ? ((budgetCategory.budget - actualCategory.actual) / budgetCategory.budget) * 100
                : 0,
            subcategories: [],
          }

          // Process each subcategory in the category
          budgetCategory.subcategories.forEach((budgetSubcategory) => {
            const subcategoryId = budgetSubcategory.subcategory_id
            const actualSubcategory = actualCategory.subcategoryMap.get(subcategoryId) || {
              name: "",
              actual: 0,
              actualM2: 0,
            }

            const subcategory = {
              subcategory_unit: budgetSubcategory.subcategory_unit, subcategory_name: budgetSubcategory.subcategory_name,
              budget: budgetSubcategory.budget,
              m2: budgetSubcategory.m2,
              actual: actualSubcategory.actual,
              actualM2: actualSubcategory.actualM2,
              variance: budgetSubcategory.budget - actualSubcategory.actual,
              varianceM2: budgetSubcategory.m2 - actualSubcategory.actualM2,
              variancePercent:
                budgetSubcategory.budget > 0
                  ? ((budgetSubcategory.budget - actualSubcategory.actual) / budgetSubcategory.budget) * 100
                  : 0,
            }

            category.subcategories.push(subcategory)
          })

          type.categories.push(category)
        })

        area.types.push(type)
      })

      // Process levels
      budgetArea.levels.forEach((budgetLevel) => {
        const levelName = budgetLevel.level_name
        const levelKey = `${areaName}/${levelName}`
        const actualLevel = actualData.levelMap.get(levelKey) || { actual: 0, actualM2: 0, typeMap: new Map() }

        const level = {
          level_name: levelName,
          budget: budgetLevel.budget,
          m2: budgetLevel.m2,
          actual: actualLevel.actual,
          actualM2: actualLevel.actualM2,
          variance: budgetLevel.budget - actualLevel.actual,
          varianceM2: budgetLevel.m2 - actualLevel.actualM2,
          variancePercent:
            budgetLevel.budget > 0 ? ((budgetLevel.budget - actualLevel.actual) / budgetLevel.budget) * 100 : 0,
          types: [],
          subareas: [],
        }

        // Process level-specific product types
        budgetLevel.types.forEach((budgetType) => {
          const typeId = budgetType.type_id
          const actualType = actualLevel.typeMap.get(typeId) || {
            name: "",
            actual: 0,
            actualM2: 0,
            categoryMap: new Map(),
          }

          const type = {
            type_unit: budgetType.type_unit, type_name: budgetType.type_name,
            budget: budgetType.budget,
            m2: budgetType.m2,
            actual: actualType.actual,
            actualM2: actualType.actualM2,
            variance: budgetType.budget - actualType.actual,
            varianceM2: budgetType.m2 - actualType.actualM2,
            variancePercent:
              budgetType.budget > 0 ? ((budgetType.budget - actualType.actual) / budgetType.budget) * 100 : 0,
            categories: [],
          }

          // Process each category in the product type
          budgetType.categories.forEach((budgetCategory) => {
            const categoryId = budgetCategory.category_id
            const actualCategory = actualType.categoryMap.get(categoryId) || {
              name: "",
              actual: 0,
              actualM2: 0,
              subcategoryMap: new Map(),
            }

            const category = {
              category_unit: budgetCategory.category_unit, category_name: budgetCategory.category_name,
              budget: budgetCategory.budget,
              m2: budgetCategory.m2,
              actual: actualCategory.actual,
              actualM2: actualCategory.actualM2,
              variance: budgetCategory.budget - actualCategory.actual,
              varianceM2: budgetCategory.m2 - actualCategory.actualM2,
              variancePercent:
                budgetCategory.budget > 0
                  ? ((budgetCategory.budget - actualCategory.actual) / budgetCategory.budget) * 100
                  : 0,
              subcategories: [],
            }

            // Process each subcategory in the category
            budgetCategory.subcategories.forEach((budgetSubcategory) => {
              const subcategoryId = budgetSubcategory.subcategory_id
              const actualSubcategory = actualCategory.subcategoryMap.get(subcategoryId) || {
                name: "",
                actual: 0,
                actualM2: 0,
              }

              const subcategory = {
                subcategory_unit: budgetSubcategory.subcategory_unit, subcategory_name: budgetSubcategory.subcategory_name,
                budget: budgetSubcategory.budget,
                m2: budgetSubcategory.m2,
                actual: actualSubcategory.actual,
                actualM2: actualSubcategory.actualM2,
                variance: budgetSubcategory.budget - actualSubcategory.actual,
                varianceM2: budgetSubcategory.m2 - actualSubcategory.actualM2,
                variancePercent:
                  budgetSubcategory.budget > 0
                    ? ((budgetSubcategory.budget - actualSubcategory.actual) / budgetSubcategory.budget) * 100
                    : 0,
              }

              category.subcategories.push(subcategory)
            })

            type.categories.push(category)
          })

          level.types.push(type)
        })

        // Process subareas
        budgetLevel.subareas.forEach((budgetSubarea) => {
          const subareaName = budgetSubarea.subarea_name
          const subareaKey = `${areaName}/${levelName}/${subareaName}`
          const actualSubarea = actualData.subareaMap.get(subareaKey) || { actual: 0, actualM2: 0, typeMap: new Map() }

          const subarea = {
            subarea_name: subareaName,
            budget: budgetSubarea.budget,
            m2: budgetSubarea.m2,
            actual: actualSubarea.actual,
            actualM2: actualSubarea.actualM2,
            variance: budgetSubarea.budget - actualSubarea.actual,
            varianceM2: budgetSubarea.m2 - actualSubarea.actualM2,
            variancePercent:
              budgetSubarea.budget > 0
                ? ((budgetSubarea.budget - actualSubarea.actual) / budgetSubarea.budget) * 100
                : 0,
            types: [],
          }

          // Process subarea-specific product types
          budgetSubarea.types.forEach((budgetType) => {
            const typeId = budgetType.type_id
            const actualType = actualSubarea.typeMap.get(typeId) || {
              name: "",
              actual: 0,
              actualM2: 0,
              categoryMap: new Map(),
            }

            const type = {
              type_unit: budgetType.type_unit, type_name: budgetType.type_name,
              budget: budgetType.budget,
              m2: budgetType.m2,
              actual: actualType.actual,
              actualM2: actualType.actualM2,
              variance: budgetType.budget - actualType.actual,
              varianceM2: budgetType.m2 - actualType.actualM2,
              variancePercent:
                budgetType.budget > 0 ? ((budgetType.budget - actualType.actual) / budgetType.budget) * 100 : 0,
              categories: [],
            }

            // Process each category in the product type
            budgetType.categories.forEach((budgetCategory) => {
              const categoryId = budgetCategory.category_id
              const actualCategory = actualType.categoryMap.get(categoryId) || {
                name: "",
                actual: 0,
                actualM2: 0,
                subcategoryMap: new Map(),
              }

              const category = {
                category_unit: budgetCategory.category_unit, category_name: budgetCategory.category_name,
                budget: budgetCategory.budget,
                m2: budgetCategory.m2,
                actual: actualCategory.actual,
                actualM2: actualCategory.actualM2,
                variance: budgetCategory.budget - actualCategory.actual,
                varianceM2: budgetCategory.m2 - actualCategory.actualM2,
                variancePercent:
                  budgetCategory.budget > 0
                    ? ((budgetCategory.budget - actualCategory.actual) / budgetCategory.budget) * 100
                    : 0,
                subcategories: [],
              }

              // Process each subcategory in the category
              budgetCategory.subcategories.forEach((budgetSubcategory) => {
                const subcategoryId = budgetSubcategory.subcategory_id
                const actualSubcategory = actualCategory.subcategoryMap.get(subcategoryId) || {
                  name: "",
                  actual: 0,
                  actualM2: 0,
                }

                const subcategory = {
                  subcategory_unit: budgetSubcategory.subcategory_unit, subcategory_name: budgetSubcategory.subcategory_name,
                  budget: budgetSubcategory.budget,
                  m2: budgetSubcategory.m2,
                  actual: actualSubcategory.actual,
                  actualM2: actualSubcategory.actualM2,
                  variance: budgetSubcategory.budget - actualSubcategory.actual,
                  variancePercent:
                    budgetSubcategory.budget > 0
                      ? ((budgetSubcategory.budget - actualSubcategory.actual) / budgetSubcategory.budget) * 100
                      : 0,
                }

                category.subcategories.push(subcategory)
              })

              type.categories.push(category)
            })

            subarea.types.push(type)
          })

          level.subareas.push(subarea)
        })

        area.levels.push(level)
      })

      mergedData.areas.push(area)
    })

    return mergedData
  }, [processBudgetData, processInvoiceData, orderState])

  // Process data when all dependencies are loaded
  useEffect(() => {
    if (
      budgetState &&
      orderState.length > 0 &&
      productTypeState.length > 0 &&
      invoiceState.length > 0 &&
      categories.length > 0 &&
      subcategories.length > 0
    ) {
      const merged = mergeData()
      setProcessedData(merged)
      setFilteredData(merged)
    }
  }, [budgetState, orderState, productTypeState, invoiceState, categories, subcategories, mergeData])

  // Handle search
  useEffect(() => {
    if (!processedData) return

    if (searchTerm.trim() === "") {
      setFilteredData(processedData)
      return
    }

    const term = searchTerm.toLowerCase()

    // Filter areas that match the search term
    const filteredAreas = processedData.areas.filter((area) => {
      // Check if area name matches
      if (area.area_name.toLowerCase().includes(term)) return true

      // Check if any type in area matches
      if (area.types.some((type) => type.type_name.toLowerCase().includes(term))) return true

      // Check if any category in area types matches
      if (
        area.types.some((type) =>
          type.categories.some((category) => category.category_name.toLowerCase().includes(term)),
        )
      )
        return true

      // Check if any level matches
      if (area.levels.some((level) => level.level_name.toLowerCase().includes(term))) return true

      // Check if any type in level matches
      if (area.levels.some((level) => level.types.some((type) => type.type_name.toLowerCase().includes(term))))
        return true

      // Check if any subarea matches
      if (
        area.levels.some((level) => level.subareas.some((subarea) => subarea.subarea_name.toLowerCase().includes(term)))
      )
        return true

      // Check if any type in subarea matches
      if (
        area.levels.some((level) =>
          level.subareas.some((subarea) => subarea.types.some((type) => type.type_name.toLowerCase().includes(term))),
        )
      )
        return true

      return false
    })

    setFilteredData({
      ...processedData,
      areas: filteredAreas,
    })
  }, [searchTerm, processedData])

  // Toggle expansion functions
  const toggleArea = (areaName) => {
    setExpandedAreas({
      ...expandedAreas,
      [areaName]: !expandedAreas[areaName],
    })
  }

  const toggleLevel = (areaName, levelName) => {
    const key = `${areaName}/${levelName}`
    setExpandedLevels({
      ...expandedLevels,
      [key]: !expandedLevels[key],
    })
  }

  const toggleSubarea = (areaName, levelName, subareaName) => {
    const key = `${areaName}/${levelName}/${subareaName}`
    setExpandedSubareas({
      ...expandedSubareas,
      [key]: !expandedSubareas[key],
    })
  }

  const toggleType = (parentType, parentName, typeName) => {
    const key = `${parentType}/${parentName}/${typeName}`
    setExpandedTypes({
      ...expandedTypes,
      [key]: !expandedTypes[key],
    })
  }

  const toggleCategory = (parentType, parentName, typeName, categoryName) => {
    const key = `${parentType}/${parentName}/${typeName}/${categoryName}`
    setExpandedCategories({
      ...expandedCategories,
      [key]: !expandedCategories[key],
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  // Determine variance class based on value
  const getVarianceClass = (variance) => {
    if (variance > 0) {
      return "text-green-600"
    } else if (variance < 0) {
      return "text-red-600"
    }
    return "text-gray-600"
  }

  // Determine variance icon based on value
  const getVarianceIcon = (variance) => {
    if (variance > 0) {
      return <TrendingUp className="w-4 h-4" />
    } else if (variance < 0) {
      return <TrendingDown className="w-4 h-4" />
    }
    return null
  }

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Check if any data is loading
  const isLoading =
    fetchBudgetLoading || fetchOrderLoading || isFetchProductTypeLoading || isFetchInvoiceLoading || isFetchAliasLoading

  // Check for any errors
  const hasError = fetchBudgetError || fetchOrderError || fetchProductTypeError || fetchInvoiceError || fetchAliasError
  const errorMessage =
    fetchBudgetError || fetchOrderError || fetchProductTypeError || fetchInvoiceError || fetchAliasError

  return (
    // <div className="container mx-auto px-4 py-6">
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget vs Actual</h1>
          {filteredData && (
            <p className="text-gray-600">
              {filteredData.projectName} - {filteredData.budgetName}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            onClick={() => {
              // Implement date range picker functionality
              // For now, just use a simple prompt
              const start = prompt("Enter start date (YYYY-MM-DD):", dateRange.start)
              const end = prompt("Enter end date (YYYY-MM-DD):", dateRange.end)
              if (start && end) {
                setDateRange({ start, end })
              }
            }}
          >
            <Calendar className="w-4 h-4" />
            <span>Date Range</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:cursor-not-allowed">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Refresh</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:cursor-not-allowed">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading data...</span>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !filteredData && !hasError && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <p>No budget or invoice data available for comparison.</p>
        </div>
      )}

      {/* Main Content */}
      {filteredData && !isLoading && (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white"
                placeholder="Search by area, level, subarea, type, category, or subcategory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Budget ($)</p>
                  <p className="text-2xl font-bold">{formatCurrency(filteredData.summary.totalBudget)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Actual ($)</p>
                  <p className="text-2xl font-bold">{formatCurrency(filteredData.summary.totalActual)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Variance ($)</p>
                  <p className={`text-2xl font-bold ${getVarianceClass(filteredData.summary.variance)}`}>
                    {formatCurrency(filteredData.summary.variance)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  {getVarianceIcon(filteredData.summary.variance) || (
                    <AlertTriangle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Variance (M2)</p>
                  <p className={`text-2xl font-bold ${getVarianceClass(filteredData.summary.varianceM2)}`}>
                    {filteredData.summary.varianceM2.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Percent className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div> */}
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3"
                    >
                      <div className="flex items-center">Area - Level - Subarea | Type - Category - Subcategory</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Budget ($)</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Budget (M2)</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Actual ($)</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Actual (M2)</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Variance ($)</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end">Variance (M2)</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.areas.map((area, areaIndex) => (
                    <React.Fragment key={`area-${areaIndex}`}>
                      {/* Area Row */}
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleArea(area.area_name)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button className="mr-2 focus:outline-none">
                              <ChevronRight
                                className={`w-5 h-5 transition-transform ${expandedAreas[area.area_name] ? "transform rotate-90" : ""}`}
                              />
                            </button>
                            <span className="font-medium">{area.area_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {formatCurrency(area.budget)}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{area.m2}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {formatCurrency(area.actual)}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{area.actualM2}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">-</td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-medium ${getVarianceClass(area.variance)}`}
                        >
                          <div className="flex items-center justify-end">
                            {getVarianceIcon(area.variance)}
                            <span className="ml-1">{formatCurrency(area.variance)}</span>
                          </div>
                        </td>
                        {/* <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-medium ${getVarianceClass(area.varianceM2)}`}
                        >
                          {area.varianceM2.toFixed(2)}
                        </td> */}
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-medium ${getVarianceClass(area.varianceM2)}`}
                        >
                          -
                        </td>
                      </tr>

                      {expandedAreas[area.area_name] && (
                        <>
                          {/* Area-level Types */}
                          {area.types.length > 0 && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-2">
                                <div className="text-xs font-medium text-gray-500 uppercase">Area-level Types</div>
                              </td>
                            </tr>
                          )}

                          {area.types.map((type, typeIndex) => (
                            <React.Fragment key={`area-type-${areaIndex}-${typeIndex}`}>
                              <tr
                                className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                onClick={() => toggleType("area", area.area_name, type.type_name)}
                              >
                                <td className="px-6 py-3 whitespace-nowrap">
                                  <div className="flex items-center pl-8">
                                    <button className="mr-2 focus:outline-none">
                                      <ChevronRight
                                        className={`w-4 h-4 transition-transform ${
                                          expandedTypes[`area/${area.area_name}/${type.type_name}`]
                                            ? "transform rotate-90"
                                            : ""
                                        }`}
                                      />
                                    </button>
                                    <span className="text-sm">{type.type_name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                                  {formatCurrency(type.budget)}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">{type.m2} <span className="text-xs text-gray-400">{type.type_unit}</span></td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                                  {formatCurrency(type.actual)}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">{type.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{type.type_unit}</span></td>
                                <td
                                  className={`px-6 py-3 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                    type.variance,
                                  )}`}
                                >
                                  <div className="flex items-center justify-end">
                                    {getVarianceIcon(type.variance)}
                                    <span className="ml-1">{formatCurrency(type.variance)}</span>
                                  </div>
                                </td>
                                <td
                                  className={`px-6 py-3 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                    type.varianceM2,
                                  )}`}
                                >
                                  {type.varianceM2.toFixed(2)}
                                </td>
                              </tr>

                              {/* Categories for Area-level Types */}
                              {expandedTypes[`area/${area.area_name}/${type.type_name}`] &&
                                type.categories.map((category, categoryIndex) => (
                                  <React.Fragment key={`area-type-category-${areaIndex}-${typeIndex}-${categoryIndex}`}>
                                    <tr
                                      className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                      onClick={() =>
                                        toggleCategory("area", area.area_name, type.type_name, category.category_name)
                                      }
                                    >
                                      <td className="px-6 py-2 whitespace-nowrap">
                                        <div className="flex items-center pl-16">
                                          <button className="mr-2 focus:outline-none">
                                            <ChevronRight
                                              className={`w-3 h-3 transition-transform ${
                                                expandedCategories[
                                                  `area/${area.area_name}/${type.type_name}/${category.category_name}`
                                                ]
                                                  ? "transform rotate-90"
                                                  : ""
                                              }`}
                                            />
                                          </button>
                                          <span className="text-xs text-gray-600">{category.category_name}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap text-right text-xs text-gray-600">
                                        {formatCurrency(category.budget)}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap text-right text-xs text-gray-600">
                                        {category.m2} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap text-right text-xs text-gray-600">
                                        {formatCurrency(category.actual)}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap text-right text-xs text-gray-600">
                                        {category.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                      </td>
                                      <td
                                        className={`px-6 py-2 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                          category.variance,
                                        )}`}
                                      >
                                        <div className="flex items-center justify-end">
                                          {getVarianceIcon(category.variance)}
                                          <span className="ml-1">{formatCurrency(category.variance)}</span>
                                        </div>
                                      </td>
                                      <td
                                        className={`px-6 py-2 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                          category.varianceM2,
                                        )}`}
                                      >
                                        {category.varianceM2.toFixed(2)}
                                      </td>
                                    </tr>

                                    {/* Subcategories */}
                                    {expandedCategories[
                                      `area/${area.area_name}/${type.type_name}/${category.category_name}`
                                    ] &&
                                      category.subcategories.map((subcategory, subcategoryIndex) => (
                                        <tr
                                          key={`area-type-category-subcategory-${areaIndex}-${typeIndex}-${categoryIndex}-${subcategoryIndex}`}
                                          className="bg-gray-200"
                                        >
                                          <td className="px-6 py-1 whitespace-nowrap">
                                            <div className="flex items-center pl-24">
                                              <span className="text-xs text-gray-500">
                                                {subcategory.subcategory_name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                            {formatCurrency(subcategory.budget)}
                                          </td>
                                          <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                            {subcategory.m2} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                          </td>
                                          <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                            {formatCurrency(subcategory.actual)}
                                          </td>
                                          <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                            {subcategory.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                          </td>
                                          <td
                                            className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                              subcategory.variance,
                                            )}`}
                                          >
                                            <div className="flex items-center justify-end">
                                              {getVarianceIcon(subcategory.variance)}
                                              <span className="ml-1">{formatCurrency(subcategory.variance)}</span>
                                            </div>
                                          </td>
                                          <td
                                            className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                              subcategory.varianceM2,
                                            )}`}
                                          >
                                            {subcategory.varianceM2.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                ))}
                            </React.Fragment>
                          ))}

                          {/* Levels */}
                          {area.levels.length > 0 && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-2">
                                <div className="text-xs font-medium text-gray-500 uppercase">Levels</div>
                              </td>
                            </tr>
                          )}

                          {area.levels.map((level, levelIndex) => (
                            <React.Fragment key={`level-${areaIndex}-${levelIndex}`}>
                              <tr
                                className="bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                onClick={() => toggleLevel(area.area_name, level.level_name)}
                              >
                                <td className="px-6 py-3 whitespace-nowrap">
                                  <div className="flex items-center pl-8">
                                    <button className="mr-2 focus:outline-none">
                                      <ChevronRight
                                        className={`w-4 h-4 transition-transform ${
                                          expandedLevels[`${area.area_name}/${level.level_name}`]
                                            ? "transform rotate-90"
                                            : ""
                                        }`}
                                      />
                                    </button>
                                    <span className="text-sm font-medium">{level.level_name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                                  {formatCurrency(level.budget)}
                                </td>
                                {/* <td className="px-6 py-3 whitespace-nowrap text-right text-sm">{level.m2}</td> */}
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">-</td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                                  {formatCurrency(level.actual)}
                                </td>
                                {/* <td className="px-6 py-3 whitespace-nowrap text-right text-sm">{level.actualM2.toFixed(1)}</td> */}
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm">-</td>
                                <td
                                  className={`px-6 py-3 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                    level.variance,
                                  )}`}
                                >
                                  <div className="flex items-center justify-end">
                                    {getVarianceIcon(level.variance)}
                                    <span className="ml-1">{formatCurrency(level.variance)}</span>
                                  </div>
                                </td>
                                {/* <td
                                  className={`px-6 py-3 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                    level.varianceM2,
                                  )}`}
                                >
                                  {level.varianceM2.toFixed(2)}
                                </td> */}
                                <td
                                  className={`px-6 py-3 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                    level.varianceM2,
                                  )}`}
                                >
                                  -
                                </td>
                              </tr>

                              {expandedLevels[`${area.area_name}/${level.level_name}`] && (
                                <>
                                  {/* Level-specific Types */}
                                  {level.types.length > 0 && (
                                    <tr className="bg-blue-50">
                                      <td colSpan="7" className="px-6 py-1">
                                        <div className="text-xs font-medium text-gray-500 uppercase pl-12">
                                          Level-specific Types
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {level.types.map((type, typeIndex) => (
                                    <React.Fragment key={`level-type-${areaIndex}-${levelIndex}-${typeIndex}`}>
                                      <tr
                                        className="bg-blue-100 hover:bg-blue-200 cursor-pointer"
                                        onClick={() => toggleType("level", level.level_name, type.type_name)}
                                      >
                                        <td className="px-6 py-2 whitespace-nowrap">
                                          <div className="flex items-center pl-16">
                                            <button className="mr-2 focus:outline-none">
                                              <ChevronRight
                                                className={`w-4 h-4 transition-transform ${
                                                  expandedTypes[`level/${level.level_name}/${type.type_name}`]
                                                    ? "transform rotate-90"
                                                    : ""
                                                }`}
                                              />
                                            </button>
                                            <span className="text-sm">{type.type_name}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {formatCurrency(type.budget)}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">{type.m2}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {formatCurrency(type.actual)}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {type.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{type.type_unit}</span>
                                        </td>
                                        <td
                                          className={`px-6 py-2 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                            type.variance,
                                          )}`}
                                        >
                                          <div className="flex items-center justify-end">
                                            {getVarianceIcon(type.variance)}
                                            <span className="ml-1">{formatCurrency(type.variance)}</span>
                                          </div>
                                        </td>
                                        <td
                                          className={`px-6 py-2 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                            type.varianceM2,
                                          )}`}
                                        >
                                          {type.varianceM2.toFixed(2)}
                                        </td>
                                      </tr>

                                      {/* Categories for Level-specific Types */}
                                      {expandedTypes[`level/${level.level_name}/${type.type_name}`] &&
                                        type.categories.map((category, categoryIndex) => (
                                          <React.Fragment
                                            key={`level-type-category-${areaIndex}-${levelIndex}-${typeIndex}-${categoryIndex}`}
                                          >
                                            <tr
                                              className="bg-blue-200 hover:bg-blue-300 cursor-pointer"
                                              onClick={() =>
                                                toggleCategory(
                                                  "level",
                                                  level.level_name,
                                                  type.type_name,
                                                  category.category_name,
                                                )
                                              }
                                            >
                                              <td className="px-6 py-1 whitespace-nowrap">
                                                <div className="flex items-center pl-24">
                                                  <button className="mr-2 focus:outline-none">
                                                    <ChevronRight
                                                      className={`w-3 h-3 transition-transform ${
                                                        expandedCategories[
                                                          `level/${level.level_name}/${type.type_name}/${category.category_name}`
                                                        ]
                                                          ? "transform rotate-90"
                                                          : ""
                                                      }`}
                                                    />
                                                  </button>
                                                  <span className="text-xs text-gray-600">
                                                    {category.category_name}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                {formatCurrency(category.budget)}
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                {category.m2} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                {formatCurrency(category.actual)}
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                {category.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                              </td>
                                              <td
                                                className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                  category.variance,
                                                )}`}
                                              >
                                                <div className="flex items-center justify-end">
                                                  {getVarianceIcon(category.variance)}
                                                  <span className="ml-1">{formatCurrency(category.variance)}</span>
                                                </div>
                                              </td>
                                              <td
                                                className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                  category.varianceM2,
                                                )}`}
                                              >
                                                {category.varianceM2.toFixed(2)}
                                              </td>
                                            </tr>

                                            {/* Subcategories */}
                                            {expandedCategories[
                                              `level/${level.level_name}/${type.type_name}/${category.category_name}`
                                            ] &&
                                              category.subcategories.map((subcategory, subcategoryIndex) => (
                                                <tr
                                                  key={`level-type-category-subcategory-${areaIndex}-${levelIndex}-${typeIndex}-${categoryIndex}-${subcategoryIndex}`}
                                                  className="bg-blue-300"
                                                >
                                                  <td className="px-6 py-1 whitespace-nowrap">
                                                    <div className="flex items-center pl-32">
                                                      <span className="text-xs text-gray-500">
                                                        {subcategory.subcategory_name}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                    {formatCurrency(subcategory.budget)}
                                                  </td>
                                                  <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                    {subcategory.m2} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                                  </td>
                                                  <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                    {formatCurrency(subcategory.actual)}
                                                  </td>
                                                  <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                    {subcategory.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                                  </td>
                                                  <td
                                                    className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                      subcategory.variance,
                                                    )}`}
                                                  >
                                                    <div className="flex items-center justify-end">
                                                      {getVarianceIcon(subcategory.variance)}
                                                      <span className="ml-1">
                                                        {formatCurrency(subcategory.variance)}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td
                                                    className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                      subcategory.varianceM2,
                                                    )}`}
                                                  >
                                                    {subcategory.varianceM2.toFixed(2)}
                                                  </td>
                                                </tr>
                                              ))}
                                          </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                  ))}

                                  {/* Subareas */}
                                  {level.subareas.length > 0 && (
                                    <tr className="bg-blue-50">
                                      <td colSpan="7" className="px-6 py-1">
                                        <div className="text-xs font-medium text-gray-500 uppercase pl-12">
                                          Subareas
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {level.subareas.map((subarea, subareaIndex) => (
                                    <React.Fragment key={`subarea-${areaIndex}-${levelIndex}-${subareaIndex}`}>
                                      <tr
                                        className="bg-green-50 hover:bg-green-100 cursor-pointer"
                                        onClick={() =>
                                          toggleSubarea(area.area_name, level.level_name, subarea.subarea_name)
                                        }
                                      >
                                        <td className="px-6 py-2 whitespace-nowrap">
                                          <div className="flex items-center pl-16">
                                            <button className="mr-2 focus:outline-none">
                                              <ChevronRight
                                                className={`w-4 h-4 transition-transform ${
                                                  expandedSubareas[
                                                    `${area.area_name}/${level.level_name}/${subarea.subarea_name}`
                                                  ]
                                                    ? "transform rotate-90"
                                                    : ""
                                                }`}
                                              />
                                            </button>
                                            <span className="text-sm">{subarea.subarea_name}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {formatCurrency(subarea.budget)}
                                        </td>
                                        {/* <td className="px-6 py-2 whitespace-nowrap text-right text-sm">{subarea.m2}</td> */}
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">-</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {formatCurrency(subarea.actual)}
                                        </td>
                                        {/* <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          {subarea.actualM2.toFixed(1)}
                                        </td> */}
                                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm">
                                          -
                                        </td>
                                        <td
                                          className={`px-6 py-2 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                            subarea.variance,
                                          )}`}
                                        >
                                          <div className="flex items-center justify-end">
                                            {getVarianceIcon(subarea.variance)}
                                            <span className="ml-1">{formatCurrency(subarea.variance)}</span>
                                          </div>
                                        </td>
                                        {/* <td
                                          className={`px-6 py-2 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                            subarea.varianceM2,
                                          )}`}
                                        >
                                          {subarea.varianceM2.toFixed(2)}
                                        </td> */}
                                        <td
                                          className={`px-6 py-2 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                            subarea.varianceM2,
                                          )}`}
                                        >
                                          -
                                        </td>
                                      </tr>

                                      {/* Subarea-specific Types */}
                                      {expandedSubareas[
                                        `${area.area_name}/${level.level_name}/${subarea.subarea_name}`
                                      ] &&
                                        subarea.types.map((type, typeIndex) => (
                                          <React.Fragment
                                            key={`subarea-type-${areaIndex}-${levelIndex}-${subareaIndex}-${typeIndex}`}
                                          >
                                            <tr
                                              className="bg-green-100 hover:bg-green-200 cursor-pointer"
                                              onClick={() =>
                                                toggleType("subarea", subarea.subarea_name, type.type_name)
                                              }
                                            >
                                              <td className="px-6 py-1 whitespace-nowrap">
                                                <div className="flex items-center pl-24">
                                                  <button className="mr-2 focus:outline-none">
                                                    <ChevronRight
                                                      className={`w-4 h-4 transition-transform ${
                                                        expandedTypes[
                                                          `subarea/${subarea.subarea_name}/${type.type_name}`
                                                        ]
                                                          ? "transform rotate-90"
                                                          : ""
                                                      }`}
                                                    />
                                                  </button>
                                                  <span className="text-sm">{type.type_name}</span>
                                                </div>
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-sm">
                                                {formatCurrency(type.budget)}
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-sm">
                                                {type.m2}
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-sm">
                                                {formatCurrency(type.actual)}
                                              </td>
                                              <td className="px-6 py-1 whitespace-nowrap text-right text-sm">
                                                {type.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{type.type_unit}</span>
                                              </td>
                                              <td
                                                className={`px-6 py-1 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                                  type.variance,
                                                )}`}
                                              >
                                                <div className="flex items-center justify-end">
                                                  {getVarianceIcon(type.variance)}
                                                  <span className="ml-1">{formatCurrency(type.variance)}</span>
                                                </div>
                                              </td>
                                              <td
                                                className={`px-6 py-1 whitespace-nowrap text-right text-sm ${getVarianceClass(
                                                  type.varianceM2,
                                                )}`}
                                              >
                                                {type.varianceM2.toFixed(2)}
                                              </td>
                                            </tr>

                                            {/* Categories for Subarea-specific Types */}
                                            {expandedTypes[`subarea/${subarea.subarea_name}/${type.type_name}`] &&
                                              type.categories.map((category, categoryIndex) => (
                                                <React.Fragment
                                                  key={`subarea-type-category-${areaIndex}-${levelIndex}-${subareaIndex}-${typeIndex}-${categoryIndex}`}
                                                >
                                                  <tr
                                                    className="bg-green-200 hover:bg-green-300 cursor-pointer"
                                                    onClick={() =>
                                                      toggleCategory(
                                                        "subarea",
                                                        subarea.subarea_name,
                                                        type.type_name,
                                                        category.category_name,
                                                      )
                                                    }
                                                  >
                                                    <td className="px-6 py-1 whitespace-nowrap">
                                                      <div className="flex items-center pl-32">
                                                        <button className="mr-2 focus:outline-none">
                                                          <ChevronRight
                                                            className={`w-3 h-3 transition-transform ${
                                                              expandedCategories[
                                                                `subarea/${subarea.subarea_name}/${type.type_name}/${category.category_name}`
                                                              ]
                                                                ? "transform rotate-90"
                                                                : ""
                                                            }`}
                                                          />
                                                        </button>
                                                        <span className="text-xs text-gray-600">
                                                          {category.category_name}
                                                        </span>
                                                      </div>
                                                    </td>
                                                    <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                      {formatCurrency(category.budget)}
                                                    </td>
                                                    <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                      {category.m2} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                                    </td>
                                                    <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                      {formatCurrency(category.actual)}
                                                    </td>
                                                    <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-600">
                                                      {category.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{category.category_unit}</span>
                                                    </td>
                                                    <td
                                                      className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                        category.variance,
                                                      )}`}
                                                    >
                                                      <div className="flex items-center justify-end">
                                                        {getVarianceIcon(category.variance)}
                                                        <span className="ml-1">
                                                          {formatCurrency(category.variance)}
                                                        </span>
                                                      </div>
                                                    </td>
                                                    <td
                                                      className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                        category.varianceM2,
                                                      )}`}
                                                    >
                                                      {category.varianceM2.toFixed(2)}
                                                    </td>
                                                  </tr>

                                                  {/* Subcategories */}
                                                  {expandedCategories[
                                                    `subarea/${subarea.subarea_name}/${type.type_name}/${category.category_name}`
                                                  ] &&
                                                    category.subcategories.map((subcategory, subcategoryIndex) => (
                                                      <tr
                                                        key={`subarea-type-category-subcategory-${areaIndex}-${levelIndex}-${subareaIndex}-${typeIndex}-${categoryIndex}-${subcategoryIndex}`}
                                                        className="bg-green-300"
                                                      >
                                                        <td className="px-6 py-1 whitespace-nowrap">
                                                          <div className="flex items-center pl-40">
                                                            <span className="text-xs text-gray-500">
                                                              {subcategory.subcategory_name}
                                                            </span>
                                                          </div>
                                                        </td>
                                                        <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                          {formatCurrency(subcategory.budget)}
                                                        </td>
                                                        <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                          {subcategory.m2} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                                        </td>
                                                        <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                          {formatCurrency(subcategory.actual)}
                                                        </td>
                                                        <td className="px-6 py-1 whitespace-nowrap text-right text-xs text-gray-500">
                                                          {subcategory.actualM2.toFixed(1)} <span className="text-xs text-gray-400">{subcategory.subcategory_unit}</span>
                                                        </td>
                                                        <td
                                                          className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                            subcategory.variance,
                                                          )}`}
                                                        >
                                                          <div className="flex items-center justify-end">
                                                            {getVarianceIcon(subcategory.variance)}
                                                            <span className="ml-1">
                                                              {formatCurrency(subcategory.variance)}
                                                            </span>
                                                          </div>
                                                        </td>
                                                        <td
                                                          className={`px-6 py-1 whitespace-nowrap text-right text-xs ${getVarianceClass(
                                                            subcategory.varianceM2,
                                                          )}`}
                                                        >
                                                          {subcategory.varianceM2?.toFixed(2) || 0}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                </React.Fragment>
                                              ))}
                                          </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                  ))}
                                </>
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Section */}
          {/* <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Budget vs Actual by Area</h2>
              <div className="flex gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Budget</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Actual</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-around">
              {filteredData.areas.map((area, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-end h-52 gap-2">
                    <div
                      className="w-12 bg-blue-500 rounded-t-md"
                      title={`${formatCurrency(area.budget)}`}
                      style={{
                        height: `${(area.budget / filteredData.summary.totalBudget) * 200}px`,
                        minHeight: "7px",
                      }}
                    ></div>
                    <div
                      className="w-12 bg-purple-500 rounded-t-md"
                      title={`${formatCurrency(area.actual)}`}
                      style={{
                        height: `${(area.actual / filteredData.summary.totalBudget) * 200}px`,
                        minHeight: "7px",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-2 text-center max-w-[100px] truncate" title={area.area_name}>
                    {area.area_name}
                  </p>
                </div>
              ))}
            </div>
          </div> */}
          {/* Enhanced Horizontal Bar Chart Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Budget vs Actual Analysis by Area</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-600">Budget</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span className="text-gray-600">Actual</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Under Budget</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-gray-600">Over Budget</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {filteredData.areas.map((area, index) => {
                const maxValue = Math.max(area.budget, area.actual)
                const budgetWidth = (area.budget / maxValue) * 100
                const actualWidth = (area.actual / maxValue) * 100
                const isOverBudget = area.actual > area.budget

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800 text-sm">{area.area_name}</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>Budget: {formatCurrency(area.budget)}</span>
                        <span>Actual: {formatCurrency(area.actual)}</span>
                        <span className={`font-medium ${getVarianceClass(area.variance)}`}>
                          {area.variancePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Budget bar */}
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${budgetWidth}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {budgetWidth > 20 ? formatCurrency(area.budget) : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actual bar */}
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-lg flex items-center justify-end pr-2 ${
                            isOverBudget ? "bg-red-500" : "bg-purple-500"
                          }`}
                          style={{ width: `${actualWidth}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {actualWidth > 20 ? formatCurrency(area.actual) : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variance indicator */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        {getVarianceIcon(area.variance)}
                        <span className={getVarianceClass(area.variance)}>
                          Variance: {formatCurrency(area.variance)}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        M2 - Budget: {area.m2} | Actual: {area.actualM2.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary at bottom */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(filteredData.summary.totalBudget)}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(filteredData.summary.totalActual)}
                  </div>
                  <div className="text-sm text-gray-600">Total Actual</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getVarianceClass(filteredData.summary.variance)}`}>
                    {formatCurrency(filteredData.summary.variance)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Variance ({filteredData.summary.variancePercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Data last updated: {new Date().toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default BudgetVsActual