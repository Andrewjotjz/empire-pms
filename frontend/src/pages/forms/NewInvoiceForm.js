import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import { setSupplierState } from "../../redux/supplierSlice";
import { setPurchaseOrderState } from "../../redux/purchaseOrderSlice";
import { setProductPrice } from "../../redux/productPriceSlice";
import { setProjectState } from "../../redux/projectSlice";

import { useAddProductPrice } from "../../hooks/useAddProductPrice";
import { useFetchProductsBySupplier } from "../../hooks/useFetchProductsBySupplier";
import { useUpdatePurchaseOrder } from "../../hooks/useUpdatePurchaseOrder";
import { useAddInvoice } from "../../hooks/useAddInvoice";

import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import SessionExpired from "../../components/SessionExpired";
import NewProductModal from "./NewProductModal";

const NewInvoiceForm = () => {
  //Component's hook
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addPrice, addPriceErrorState } = useAddProductPrice();
  const { addInvoice, addInvoiceError } = useAddInvoice();
  const { fetchProductsBySupplier, fetchProductsErrorState } =
    useFetchProductsBySupplier();
  const { updatePurchaseOrder, updateOrderErrorState } =
    useUpdatePurchaseOrder();

  //Component's state declaration
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [updatedOrder, setUpdatedOrder] = useState(null);
  const [newSupplier, setNewSupplier] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [targetIndex, setTargetIndex] = useState(null);

  const [isToggled, setIsToggled] = useState(false);
  const [isToggleProjectDropdown, setIsToggleProjectDropdown] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showProductPriceModal, setShowProductPriceModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showCreatePriceModal, setShowCreatePriceModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUpdateConfirmationModal, setShowUpdateConfirmationModal] =
    useState(false);
  const [showRegisterConfirmationModal, setShowRegisterConfirmationModal] =
    useState(false);

  const [isFetchSupplierLoading, setIsFetchSupplierLoading] = useState(true);
  const [fetchSupplierError, setFetchSupplierError] = useState(null);
  const [isFetchOrderLoading, setIsFetchOrderLoading] = useState(false);
  const [fetchOrderError, setFetchOrderError] = useState(null);
  const [isFetchProductDetailsLoading, setIsFetchProductDetailsLoading] =
    useState(false);
  const [fetchProductDetailsError, setFetchProductDetailsError] =
    useState(null);
  const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false);
  const [fetchProjectError, setFetchProjectError] = useState(null);

  const supplierState = useSelector(
    (state) => state.supplierReducer.supplierState
  );
  const purchaseOrderState = useSelector(
    (state) => state.purchaseOrderReducer.purchaseOrderState
  );
  const productPriceState = useSelector(
    (state) => state.productPriceReducer.productPriceState
  );
  const projectState = useSelector(
    (state) => state.projectReducer.projectState
  );
  const productState = useSelector(
    (state) => state.productReducer.productState
  );

  const [newInvoice, setNewInvoice] = useState({
    invoice_ref: "",
    supplier: "",
    invoice_issue_date: "",
    invoice_received_date: new Date().toISOString().split("T")[0],
    invoice_due_date: "",
    order: "",
    products: [],
    custom_products: [],
    invoiced_delivery_fee: 0,
    invoiced_other_fee: 0,
    invoiced_credit: 0,
    invoiced_raw_total_amount_incl_gst: 0,
    invoiced_calculated_total_amount_incl_gst: 0,
    invoice_is_stand_alone: false,
    invoice_internal_comments: "",
    invoice_status: "",
    payment: "",
  });
  const [newInvoiceWithoutPO, setNewInvoiceInvoiceWithoutPO] = useState({
    invoice_ref: "",
    supplier: "",
    invoice_issue_date: "",
    invoice_received_date: new Date().toISOString().split("T")[0],
    invoice_due_date: "",
    order: null,
    products: [],
    custom_products: [
      {
        custom_product_name: "",
        custom_product_location: "",
        custom_order_qty: 0,
        custom_order_price: 0,
        custom_order_gross_amount: 0,
      },
    ],
    invoiced_delivery_fee: 0,
    invoiced_other_fee: 0,
    invoiced_credit: 0,
    invoiced_raw_total_amount_incl_gst: 0,
    invoiced_calculated_total_amount_incl_gst: 0,
    invoice_is_stand_alone: true,
    invoice_internal_comments: "",
    invoice_status: "",
    invoice_isarchived: false,
    payment: null,
  });
  const [newProductPrice, setNewProductPrice] = useState({
    product_obj_ref: "",
    product_unit_a: "",
    product_number_a: "",
    product_price_unit_a: "",
    product_unit_b: "",
    product_number_b: "",
    product_price_unit_b: "",
    price_fixed: false,
    product_effective_date: "",
    projects: [],
  });

  //Component's function and variables
  const formatDate = (dateString) => {
    if (dateString === null) {
      return "";
    } else {
      const date = new Date(dateString);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-AU", options);
    }
  };

  // Helper function to calculate the due date based on payment terms
  const calculateDueDate = (paymentTerm) => {
    const daysToAdd = parseInt(paymentTerm.replace(/\D/g, ''), 10); // Extract number from "Net 60"
    const issueDate = new Date(); // Get the current date
    const dueDate = new Date(issueDate); // Create a copy of the current date
    dueDate.setDate(dueDate.getDate() + daysToAdd); // Add the extracted days
    return dueDate.toISOString().split("T")[0]; // Return formatted date as 'YYYY-MM-DD'
  };

  const fetchSelectedPurchaseOrder = async (id) => {
    setIsFetchOrderLoading(true);
    setFetchOrderError(null);

    const getOrder = async () => {
      try {
        const res = await fetch(`https://empire-pms.vercel.app/api/order/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (data.tokenError) {
          throw new Error(data.tokenError);
        }

        if (!res.ok) {
          throw new Error("Failed to get order");
        }

        if (res.ok) {
          // Store data to productPriceState
          setCurrentOrder(data);
          setUpdatedOrder(data);
          fetchProductsBySupplier(data.supplier._id);

          // Ensure products and custom_products exist before mapping
          const formattedProducts =
            data.products?.map((product, index) => ({
              _id: product._id,
              product_obj_ref: product.product_obj_ref._id,
              invoice_product_location: product.order_product_location,
              invoice_product_qty_a:
                newInvoice?.products[index]?.invoice_product_qty_a || 0,
              invoice_product_price_unit: product.order_product_price_unit_a,
              invoice_product_gross_amount_a:
                product.order_product_gross_amount *
                (newInvoice?.products[index]?.invoice_product_qty_a || 0),
            })) || [];

          // const formattedCustomProducts =
          //   data.custom_products?.map((customProduct, index) => ({
          //     _id: customProduct._id,
          //     custom_product_name: customProduct.custom_product_name,
          //     custom_product_location: customProduct.custom_product_location,
          //     custom_order_qty:
          //       newInvoice?.custom_products[index]?.custom_order_qty || 0,
          //     custom_order_price: '',// apply code here
          //     custom_order_gross_amount:
          //       (Number(customProduct.custom_order_gross_amount) || 0) *
          //       (Number(newInvoice?.custom_products[index]?.custom_order_qty) ||
          //         0),
          //   })) || [];
          const formattedCustomProducts =
            data.custom_products?.map((customProduct, index) => {
              // Find if the customProduct exists in the invoices' custom_products
              let matchingCustomProduct = null;
              data.invoices.some(invoice => {
                matchingCustomProduct = invoice.custom_products.find(
                  invoiceCustomProduct => invoiceCustomProduct._id === customProduct._id
                );
                return matchingCustomProduct;
              });

              return {
                _id: customProduct._id,
                custom_product_name: customProduct.custom_product_name,
                custom_product_location: customProduct.custom_product_location,
                custom_order_qty:
                  newInvoice?.custom_products[index]?.custom_order_qty || 0,
                custom_order_price: matchingCustomProduct
                  ? matchingCustomProduct.custom_order_price
                  : 0, // Set custom_order_price from matching invoice or empty string
                custom_order_gross_amount:
                  (Number(customProduct.custom_order_gross_amount) || 0) *
                  (Number(newInvoice?.custom_products[index]?.custom_order_qty) || 0),
              };
            }) || [];

          setNewInvoice({
            ...newInvoice,
            order: id,
            products: formattedProducts,
            custom_products: formattedCustomProducts,
          });

          setIsFetchOrderLoading(false);
        }
      } catch (error) {
        setFetchOrderError(error.message);
        setIsFetchOrderLoading(false);
      }
    };

    getOrder();
  };
  const fetchProductDetails = async (supplierId, productId) => {
    setIsFetchProductDetailsLoading(true);
    try {
      const res = await fetch(
        `/api/supplier/${supplierId}/products/${productId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch product details");
      }
      const data = await res.json();

      if (data.tokenError) {
        throw new Error(data.tokenError);
      }

      dispatch(setProductPrice(data));
      setIsFetchProductDetailsLoading(false);
    } catch (err) {
      setFetchProductDetailsError(err.message);
      setIsFetchProductDetailsLoading(false);
    }
  };
  const fetchProjects = async () => {
    setIsFetchProjectLoading(true); // Set loading state to true at the beginning
    try {
      const res = await fetch("/api/project");
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();

      if (data.tokenError) {
        throw new Error(data.tokenError);
      }

      setIsFetchProjectLoading(false);
      dispatch(setProjectState(data));
      setFetchProjectError(null);
    } catch (error) {
      if (error.name === "AbortError") {
        // do nothing
      } else {
        setIsFetchProjectLoading(false);
        setFetchProjectError(error.message);
      }
    }
  };
  const resetForm = () => {
    
    const supplier = supplierState.find(supplier => supplier._id === newSupplier); //get the supplier
    const paymentTerm = supplier.supplier_payment_term; // get supplier's payment term, this returns "Net 60"

    // Call the helper function to get the calculated due date
    const formattedDueDate = calculateDueDate(paymentTerm);

    setNewInvoice({
      invoice_ref: "",
      supplier: newSupplier,
      invoice_issue_date: "",
      invoice_received_date: new Date().toISOString().split("T")[0],
      invoice_due_date: formattedDueDate,
      order: "",
      products: [],
      custom_products: [],
      invoiced_delivery_fee: 0,
      invoiced_other_fee: 0,
      invoiced_credit: 0,
      invoiced_raw_total_amount_incl_gst: 0,
      invoiced_calculated_total_amount_incl_gst: 0,
      invoice_is_stand_alone: false,
      invoice_internal_comments: "",
      invoice_status: "",
    });
    setCurrentOrder(null);
  };
  const resetNewProductPrice = () => {
    setNewProductPrice({
      product_obj_ref: "",
      product_unit_a: "",
      product_number_a: "",
      product_price_unit_a: "",
      product_unit_b: "",
      product_number_b: "",
      product_price_unit_b: "",
      price_fixed: false,
      product_effective_date: "",
      projects: [],
    });
  };
  let distinctProductTypes = [];
  if (Array.isArray(productState) && (currentOrder?.project._id || false)) {
    distinctProductTypes = [
      ...new Set(productState.map((prod) => prod.product.product_types)),
    ];
  }
  const filterProductsBySearchTerm = () => {
    const lowerCaseSearchTerm = searchProductTerm.toLowerCase().trim();

    return productState.filter((product) => {
      const matchesSearchTerm =
        product.product.product_sku
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        product.product.product_name
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        product.productPrice.product_number_a
          .toString()
          .includes(lowerCaseSearchTerm) ||
        product.productPrice.product_unit_a
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        product.productPrice.product_price_unit_a
          .toString()
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        product.product.product_actual_size
          .toString()
          .includes(lowerCaseSearchTerm) ||
        product.product.product_types
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        product.product.alias_name.toString().includes(lowerCaseSearchTerm);

      const matchesProductType = selectedProductType
        ? product.product.product_types === selectedProductType
        : true; // If no product type is selected, don't filter by type

      const matchesProjectId = product.productPrice.projects.some((projectId) =>
        projectId.includes(currentOrder.project._id)
      );

      return matchesSearchTerm && matchesProductType && matchesProjectId;
    });
  };

  const handleToggle = () => setIsToggled(!isToggled);
  const handleToggleSelectionModal = () =>
    setShowSelectionModal(!showSelectionModal);
  const handleToggleCreateProductModal = () =>
    setShowCreateProductModal(!showCreateProductModal);
  const handleToggleEditOrderModal = () =>
    setShowEditOrderModal(!showEditOrderModal);
  const handleToggleCreatePriceModal = () =>
    setShowCreatePriceModal(!showCreatePriceModal);
  const handleTogglePriceModal = () =>
    setShowProductPriceModal(!showProductPriceModal);

  const handleSupplierChange = (event) => {
    const targetSupplier = event.target.value;

    if (targetSupplier !== "") {
      const supplier = supplierState.find(supplier => supplier._id === targetSupplier);
      const paymentTerm = supplier.supplier_payment_term; // "Net 60"

      // Call the helper function to get the calculated due date
      const formattedDueDate = calculateDueDate(paymentTerm);

      // if this is initial selection
      if (newInvoice.supplier === "") {

        setNewInvoice({
          invoice_ref: "",
          supplier: targetSupplier,
          invoice_issue_date: "",
          invoice_received_date: new Date().toISOString().split("T")[0],
          invoice_due_date: formattedDueDate,
          order: "",
          products: [],
          custom_products: [],
          invoiced_delivery_fee: 0,
          invoiced_other_fee: 0,
          invoiced_credit: 0,
          invoiced_raw_total_amount_incl_gst: 0,
          invoiced_calculated_total_amount_incl_gst: 0,
          invoice_is_stand_alone: false,
          invoice_internal_comments: "",
          invoice_status: "",
        });
        return;
      }
      // if this is not initial selection, store targetSupplier in a variable and show confirmation modal
      setNewSupplier(targetSupplier);
      setShowConfirmationModal(true);
    } else {
      // if targetSupplier is empty, store nothing and show confirmation modal
      setNewSupplier("");
      setShowConfirmationModal(true);
    }
  };
  const handleConfirmAction = () => {
    resetForm();
    setShowConfirmationModal(false);
  };
  const handleInputChange = (event, index = null) => {
    const { name, value } = event.target;

    // Get the current state
    const currentState = newInvoice;

    // Copy current state to updatedState variable for changes
    let updatedState = { ...currentState };

    // Create separate variables for products and custom_products so they can be updated independently
    let updatedProducts = [...currentState.products];
    let updatedCustomProducts = [...currentState.custom_products];

    // Handle order items details input using index
    if (index !== null) {
      if (name === "invoice_product_qty_a") {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [name]: Number(value),
          invoice_product_gross_amount_a:
            Number(
              (
                value * currentState.products[index]?.invoice_product_price_unit
              ).toFixed(2)
            ) || 0,
        };
      }

      if (name === "custom_order_qty") {
        updatedCustomProducts[index] = {
          ...updatedCustomProducts[index],
          [name]: Number(value),
          custom_order_gross_amount:
            Number(
              (
                value * currentState.custom_products[index]?.custom_order_price
              ).toFixed(2)
            ) || 0,
        };
      }
      if (name === "custom_order_price") {
        updatedCustomProducts[index] = {
          ...updatedCustomProducts[index],
          [name]: Number(value),
          custom_order_gross_amount:
            Number(
              (
                value * currentState.custom_products[index]?.custom_order_qty
              ).toFixed(2)
            ) || 0,
        };
      }

      updatedState = {
        ...currentState,
        products: updatedProducts,
        custom_products: updatedCustomProducts,
      };
    } else {
      // Update for invoiced fees and other fields
      updatedState = {
        ...currentState,
        [name]: [
          "invoiced_delivery_fee",
          "invoiced_other_fee",
          "invoiced_credit",
          "invoiced_raw_total_amount_incl_gst",
        ].includes(name)
          ? Number(value)
          : value,
      };
    }

    // Calculate updatedTotalAmount using updatedProducts and updatedCustomProducts
    let updatedInvoicedTotalAmount = (
      (updatedProducts.reduce(
        (total, prod) =>
          total + (Number(prod.invoice_product_gross_amount_a) || 0),
        0
      ) +
        updatedCustomProducts.reduce(
          (total, cprod) =>
            total + (Number(cprod.custom_order_gross_amount) || 0),
          0
        ) +
        (Number(updatedState.invoiced_delivery_fee) || 0) +
        (Number(updatedState.invoiced_other_fee) || 0) +
        (Number(updatedState.invoiced_credit) || 0)) *
      1.1
    ).toFixed(2);

    // Final update to the state with recalculated total amount
    updatedState = {
      ...updatedState,
      invoiced_calculated_total_amount_incl_gst: Number(
        updatedInvoicedTotalAmount
      ),
    };

    // Set state with the updated state
    setNewInvoice(updatedState);
  };
  const handleInputChangeNoPO = (event, index = null) => {
    const { name, value } = event.target;

    // Get the current state
    const currentState = newInvoiceWithoutPO;

    // Copy current state to updatedState variable for changes
    let updatedState = { ...currentState };

    // Create separate variables for products and custom_products so they can be updated independently
    let updatedCustomProducts = [...currentState.custom_products];

    // Handle order items details input using index
    if (index !== null) {
      if (name === "custom_order_qty") {
        updatedCustomProducts[index] = {
          ...updatedCustomProducts[index],
          [name]: Number(value), // Convert to number here
          custom_order_gross_amount:
            Number(
              (
                value * updatedCustomProducts[index]?.custom_order_price
              ).toFixed(2)
            ) || 0,
        };
      } else if (name === "custom_order_price") {
        updatedCustomProducts[index] = {
          ...updatedCustomProducts[index],
          [name]: Number(value), // Convert to number here
          custom_order_gross_amount:
            Number(
              (value * updatedCustomProducts[index]?.custom_order_qty).toFixed(
                2
              )
            ) || 0,
        };
      } else {
        updatedCustomProducts[index] = {
          ...updatedCustomProducts[index],
          [name]: value,
        };
      }

      updatedState = {
        ...currentState,
        custom_products: updatedCustomProducts,
      };
    } else {
      // Update for invoiced fees and other fields
      updatedState = {
        ...currentState,
        [name]: [
          "invoiced_delivery_fee",
          "invoiced_other_fee",
          "invoiced_credit",
          "invoiced_raw_total_amount_incl_gst",
        ].includes(name)
          ? Number(value)
          : value,
      };
    }

    // Calculate updatedTotalAmount using updatedProducts and updatedCustomProducts
    let updatedInvoicedTotalAmount = (
      (updatedCustomProducts.reduce(
        (total, cprod) =>
          total + (Number(cprod.custom_order_gross_amount) || 0),
        0
      ) +
        (Number(updatedState.invoiced_delivery_fee) || 0) +
        (Number(updatedState.invoiced_other_fee) || 0) +
        (Number(updatedState.invoiced_credit) || 0)) *
      1.1
    ).toFixed(2);

    // Final update to the state with recalculated total amount
    updatedState = {
      ...updatedState,
      invoiced_calculated_total_amount_incl_gst: Number(
        updatedInvoicedTotalAmount
      ),
    };

    // Set state with the updated state
    setNewInvoiceInvoiceWithoutPO(updatedState);
  };

  // const handleInputChangeNoPO = (event, index = null) => {
  //     const { name, value } = event.target;

  //     // Copy current state to updatedState variable for changes
  //     let updatedState = { ...newInvoiceWithoutPO };
  //     let updatedCustomProducts = [...updatedState.custom_products];

  //     if (index !== null) {
  //         if (name === "custom_order_qty") {
  //             updatedCustomProducts[index] = {
  //                 ...updatedCustomProducts[index],
  //                 [name]: Number(value), // Convert to number here
  //                 custom_order_gross_amount: Number((value * updatedCustomProducts[index]?.custom_order_price).toFixed(2)) || 0,
  //             };
  //         } else if (name === "custom_order_price") {
  //             updatedCustomProducts[index] = {
  //                 ...updatedCustomProducts[index],
  //                 [name]: Number(value), // Convert to number here
  //                 custom_order_gross_amount: Number((value * updatedCustomProducts[index]?.custom_order_qty).toFixed(2)) || 0,
  //             };
  //         }
  //         else {
  //             updatedCustomProducts[index] = {
  //                 ...updatedCustomProducts[index],
  //                 [name]: value,
  //             };
  //         }
  //     }

  //     updatedState.custom_products = updatedCustomProducts;

  //     setNewInvoiceInvoiceWithoutPO(updatedState);
  // };

  const handleAddToInvoice = () => {
    if (selectedOrder === "") {
      alert("Please select an order");
      return;
    }
    fetchSelectedPurchaseOrder(selectedOrder);
    setShowSelectionModal(false);
  };
  const handleCreateNewPrice = () => {
    fetchProjects();
    handleToggleCreatePriceModal();
    handleTogglePriceModal();
  };
  const handleNewProductPriceInput = (event) => {
    const { name, value } = event.target;

    setNewProductPrice((prevState) => ({
      ...prevState,
      [name]: [
        "product_number_a",
        "product_price_unit_a",
        "product_number_b",
        "product_price_unit_b",
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };
  const handleCheckboxChangeNewPrice = (event) => {
    const { value, checked } = event.target;
    setNewProductPrice((prevState) => {
      const updatedProjects = checked
        ? [...prevState.projects, value]
        : prevState.projects.filter((projectId) => projectId !== value);
      return { ...prevState, projects: updatedProjects };
    });
  };
  const handleSubmitNewPrice = async (event) => {
    event.preventDefault();

    if (!newProductPrice.projects.length > 0) {
      // push toast to notify error
      toast.error(
        `You must select one or more projects that this new product applies to`,
        {
          position: "bottom-right",
        }
      );
      return;
    }

    if (
      newProductPrice.product_number_a !== "" &&
      showCreatePriceModal === true
    ) {
      addPrice(newProductPrice);
      fetchProductDetails(
        updatedOrder.supplier._id,
        newProductPrice.product_obj_ref
      );
      fetchProductsBySupplier(updatedOrder.supplier._id);
      setShowUpdateConfirmationModal(true);
    }
  };
  const handleAddItem = (product) => {
    // Create the updated products array
    const updatedProducts = [
      ...updatedOrder.products,
      {
        product_obj_ref: {
          _id: product.product._id,
          product_name: product.product.product_name,
          product_sku: product.product.product_sku,
        },
        productprice_obj_ref: product.productPrice,
        order_product_location: "",
        order_product_qty_a: 0, // Ensure all fields are initialized properly
        order_product_qty_b: 0,
        order_product_price_unit_a: product.productPrice.product_price_unit_a,
        order_product_gross_amount: 0,
      },
    ];

    // Dispatch the action with a plain object payload
    setUpdatedOrder({
      ...updatedOrder,
      products: updatedProducts,
    });
  };
  const handleEditInputChange = (event, index = null, isCustom = false) => {
    const { name, value } = event.target;

    // Get the current state
    const currentState = updatedOrder; // assuming purchaseOrderState is the correct slice

    let updatedState = { ...currentState };
    let isProduct = !isCustom;
    let isCustomProduct = isCustom;

    // Handle product array updates
    if (isProduct && index !== null) {
      let updatedProducts = [...currentState.products];

      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: value,
      };

      updatedState = {
        ...currentState,
        products: updatedProducts,
      };
    }
    // Handle custom products array updates
    else if (isCustomProduct && index !== null) {
      const updatedCustomProducts = currentState.custom_products.map(
        (product, i) =>
          i === index
            ? {
                ...product,
                [name]: name === "custom_order_qty" ? Number(value) : value,
              }
            : product
      );

      updatedState = {
        ...currentState,
        custom_products: updatedCustomProducts,
      };
    }
    // Handle other updates
    else {
      updatedState = {
        ...currentState,
        [name]: value,
      };
    }

    // Dispatch the action with the updated state
    setUpdatedOrder(updatedState);
  };
  const handleQtyChange = (event, index) => {
    const { name, value } = event.target;

    // Create a copy of the current state outside of the dispatch
    let updatedProducts = [...updatedOrder.products];

    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: Number(value),
    };

    // Handle `order_product_qty_a` changes
    if (name === "order_product_qty_a") {
      if (
        updatedOrder.products[index].productprice_obj_ref.product_number_a === 1
      ) {
        updatedProducts[index].order_product_qty_b = Number.isInteger(
          value *
            updatedOrder.products[index].productprice_obj_ref.product_number_b
        )
          ? value *
            updatedOrder.products[index].productprice_obj_ref.product_number_b
          : parseFloat(
              value *
                updatedOrder.products[index].productprice_obj_ref
                  .product_number_b
            ).toFixed(4);
      } else {
        updatedProducts[index].order_product_qty_b = Number.isInteger(
          value /
            updatedOrder.products[index].productprice_obj_ref.product_number_a
        )
          ? value /
            updatedOrder.products[index].productprice_obj_ref.product_number_a
          : parseFloat(
              value /
                updatedOrder.products[index].productprice_obj_ref
                  .product_number_a
            ).toFixed(4);
      }
      updatedProducts[index].order_product_gross_amount = (
        updatedOrder.products[index].productprice_obj_ref
          .product_price_unit_a === 1
          ? value *
            updatedOrder.products[index].productprice_obj_ref
              .product_price_unit_a *
            updatedOrder.products[index].productprice_obj_ref.product_number_a
          : value *
            updatedOrder.products[index].productprice_obj_ref
              .product_price_unit_a
      ).toFixed(2);
    }

    // Handle `order_product_qty_b` changes
    if (name === "order_product_qty_b") {
      if (
        updatedOrder.products[index].productprice_obj_ref.product_number_b === 1
      ) {
        updatedProducts[index].order_product_qty_a = Number.isInteger(
          value *
            updatedOrder.products[index].productprice_obj_ref.product_number_a
        )
          ? value *
            updatedOrder.products[index].productprice_obj_ref.product_number_a
          : parseFloat(
              value *
                updatedOrder.products[index].productprice_obj_ref
                  .product_number_a
            ).toFixed(4);
      } else {
        updatedProducts[index].order_product_qty_a = Number.isInteger(
          value /
            updatedOrder.products[index].productprice_obj_ref.product_number_b
        )
          ? value /
            updatedOrder.products[index].productprice_obj_ref.product_number_b
          : parseFloat(
              value /
                updatedOrder.products[index].productprice_obj_ref
                  .product_number_b
            ).toFixed(4);
      }
      updatedProducts[index].order_product_gross_amount = (
        value *
        updatedOrder.products[index].productprice_obj_ref.product_price_unit_b
      ).toFixed(2);
    }

    // Calculate updatedTotalAmount using updatedProducts
    let updatedTotalAmount = (
      updatedProducts.reduce(
        (total, prod) => total + (Number(prod.order_product_gross_amount) || 0),
        0
      ) * 1.1
    ).toFixed(2);

    // Dispatch the updated state with a plain object
    setUpdatedOrder({
      ...updatedOrder,
      order_total_amount: Number(updatedTotalAmount),
      products: updatedProducts,
    });
  };
  const handleRemoveItem = (index) => {
    const updatedItems = updatedOrder.products.filter(
      (_, idx) => idx !== index
    );

    if (updatedItems.length === 0) {
      setUpdatedOrder({
        ...updatedOrder,
        order_total_amount: 0,
        products: updatedItems,
      });
    } else {
      setUpdatedOrder({
        ...updatedOrder,
        products: updatedItems,
      });
    }
  };
  const handleRemoveCustomItem = (index, noPO = false) => {
    if (noPO) {
      const updatedCustomItems = newInvoiceWithoutPO.custom_products.filter(
        (_, idx) => idx !== index
      );

      setNewInvoiceInvoiceWithoutPO({
        ...newInvoiceWithoutPO,
        custom_products: updatedCustomItems,
      });
    }

    if (!noPO) {
      const updatedCustomItems = updatedOrder.custom_products.filter(
        (_, idx) => idx !== index
      );

      setUpdatedOrder({
        ...updatedOrder,
        custom_products: updatedCustomItems,
      });
    }
  };
  const handleAddCustomItem = (noPO = false) => {
    if (noPO) {
      if (newInvoiceWithoutPO.custom_products.length < 15) {
        setNewInvoiceInvoiceWithoutPO({
          ...newInvoiceWithoutPO,
          custom_products: [
            ...newInvoiceWithoutPO.custom_products,
            {
              custom_product_name: "",
              custom_product_location: "",
              custom_order_qty: 0,
              custom_order_price: 0,
              custom_order_gross_amount: 0,
            },
          ],
        });
      } else {
        alert("You can add up to 15 custom items only.");
      }
    }

    if (!noPO) {
      if (updatedOrder.custom_products.length < 15) {
        setUpdatedOrder({
          ...updatedOrder,
          custom_products: [
            ...updatedOrder.custom_products,
            {
              custom_product_name: "",
              custom_product_location: "",
              custom_order_qty: 0,
            },
          ],
        });
      } else {
        alert("You can add up to 15 custom items only.");
      }
    }
  };
  const handleViewPriceVersion = (supplierId, targetProductId) => {
    setNewProductPrice({
      product_obj_ref: targetProductId,
      product_unit_a: "",
      product_number_a: "",
      product_price_unit_a: "",
      product_unit_b: "",
      product_number_b: "",
      product_price_unit_b: "",
      price_fixed: false,
      product_effective_date: updatedOrder.order_date.split("T")[0], // Immediately set the new value
      projects: [updatedOrder.project._id],
    });
    handleTogglePriceModal();
    fetchProductDetails(supplierId, targetProductId);
  };
  const handleAutomation = (updatedProductId) => {
    // Step 1: Remove the item from the products list by filtering out the one with the matching product_obj_ref._id
    const updatedItems = updatedOrder.products.filter(
      (item) => item.product_obj_ref._id !== updatedProductId
    );

    const getItem = updatedOrder.products.filter(
      (item) => item.product_obj_ref._id === updatedProductId
    );

    // Step 2: Find the product that needs to be re-added (optimized filtering)
    const product = filterProductsBySearchTerm().find(
      (product) => product.product._id === updatedProductId
    );

    if (!product) {
      alert("Automation failed. Please contact IT support");
      return;
    }

    // Step 3: Create the new product object with required details
    const newProduct = {
      product_obj_ref: {
        _id: product.product._id,
        product_name: product.product.product_name,
        product_sku: product.product.product_sku,
      },
      productprice_obj_ref: product.productPrice,
      order_product_location: getItem[0].order_product_location,
      order_product_qty_a: getItem[0].order_product_qty_a,
      order_product_qty_b: getItem[0].order_product_qty_b,
      order_product_price_unit_a: product.productPrice.product_price_unit_a,
      order_product_gross_amount:
        getItem[0].order_product_qty_a *
        product.productPrice.product_price_unit_a,
    };

    // Step 4: Update the products list with the new product
    const updatedProducts = [...updatedItems, newProduct];

    setUpdatedOrder({
      ...updatedOrder,
      products: updatedProducts,
    });
  };
  const handleRegisterAutomation = () => {
    // Step 1: Find the product that needs to be re-added (optimized filtering)
    const product = filterProductsBySearchTerm().find(
      (product) => product.product._id === newProductId
    );

    if (!product) {
      alert("Automation failed. Please contact IT support");
      return;
    }

    // Step 2: filter product list to show new product
    setSearchProductTerm(product.product.product_name);

    // Step 3: Remove custom product from list
    handleRemoveCustomItem(targetIndex);
  };
  const handleSubmitInvoice = (event) => {
    event.preventDefault();

    if (!isToggled) {
      if (newInvoice.invoice_status === "") {
        // push toast to notify successful login
        toast.error(`Please select invoice status`, {
          position: "bottom-right",
        });
        return;
      }
      addInvoice(newInvoice);
    }

    if (isToggled) {
      if (newInvoice.invoice_status === "") {
        // push toast to notify successful login
        toast.error(`Please select invoice status`, {
          position: "bottom-right",
        });
        return;
      }
      addInvoice(newInvoiceWithoutPO);
    }

    navigate(`/EmpirePMS/invoice`)
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchSuppliers = async () => {
      setIsFetchSupplierLoading(true);
      try {
        const res = await fetch("/api/supplier", { signal });
        if (!res.ok) {
          throw new Error("Failed to fetch suppliers");
        }
        const data = await res.json();

        if (data.tokenError) {
          throw new Error(data.tokenError);
        }

        setIsFetchSupplierLoading(false);
        dispatch(setSupplierState(data));
        setFetchSupplierError(null);
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsFetchSupplierLoading(false);
          setFetchSupplierError(error.message);
        }
      }
    };

    fetchSuppliers();

    return () => {
      abortController.abort(); // Cleanup
    };
  }, [dispatch]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchOrders = async () => {
      setIsFetchSupplierLoading(true);
      try {
        const res = await fetch("/api/order", { signal });
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await res.json();

        if (data.tokenError) {
          throw new Error(data.tokenError);
        }

        setIsFetchSupplierLoading(false);
        dispatch(setPurchaseOrderState(data));
        setFetchSupplierError(null);
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsFetchSupplierLoading(false);
          setFetchSupplierError(error.message);
        }
      }
    };

    fetchOrders();

    return () => {
      abortController.abort(); // Cleanup
    };
  }, [dispatch]);

  useEffect(() => {
    setNewInvoiceInvoiceWithoutPO((prevState) => ({
      ...prevState,
      invoice_ref: newInvoice.invoice_ref,
      supplier: newInvoice.supplier,
      invoice_issue_date: newInvoice.invoice_issue_date,
      invoice_due_date: newInvoice.invoice_due_date,
      invoice_status: newInvoice.invoice_status,
    }));
  }, [newInvoice]);

  //Component's modal
  const orderSelectionModal = (
    <div>
      {/* Modal overlay */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-auto max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3 border-b bg-slate-100">
              <h2 className="text-xl font-bold">
                Select Purchase Order to Invoice
              </h2>
              <button
                onClick={handleToggleSelectionModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 max-h-[70vh] overflow-y-auto thin-scrollbar">
              <div className="flex justify-between">
                <input
                  type="text"
                  className="w-5/12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name=""
                  value={searchOrderTerm}
                  onChange={(e) => setSearchOrderTerm(e.target.value)}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("")}
                  onInput={(e) => e.target.setCustomValidity("")}
                  placeholder="Search purchase order..."
                />
                <div className="flex items-center">
                  <label className="font-bold">Supplier:</label>
                  <label className="ml-2">
                    {supplierState.length > 0
                      ? // '?.supplier_name' to avoid potential undefined errors if the supplier is not found.
                        // If find doesn't match any supplier, it returns undefined, so the fallback value "not selected" will be displayed.
                        supplierState.find(
                          (supplier) => supplier._id === newInvoice.supplier
                        )?.supplier_name || "not selected"
                      : "not selected"}
                  </label>
                </div>
              </div>
              <table className="mt-2 table-auto border-collapse border border-gray-300 w-full shadow-md">
                <thead className="bg-indigo-200 text-center">
                  <tr>
                    <th></th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      PO
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      Order Date
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      EST Date
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      Products
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      Gross Amount
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {purchaseOrderState &&
                  purchaseOrderState.filter(
                    (order) =>
                      order.order_ref.toLowerCase().includes(searchOrderTerm) &&
                      order.supplier._id === newInvoice.supplier
                  ).length > 0 ? (
                    purchaseOrderState
                      .filter(
                        (order) =>
                          order.order_ref
                            .toLowerCase()
                            .includes(searchOrderTerm) &&
                          order.supplier._id === newInvoice.supplier
                      )
                      .map((order, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">
                            <input
                              className="text-blue-600"
                              type="radio"
                              name="_id"
                              value={order._id}
                              checked={selectedOrder === order._id}
                              onChange={(e) => setSelectedOrder(e.target.value)}
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {order.order_ref}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDate(order.order_date)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDate(order.order_est_datetime)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {order.project.project_name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {order.products.length +
                              order.custom_products.length}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            ${order.order_total_amount.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {order.order_status}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 p-2">
                        Please select a supplier...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end p-3">
              <button
                onClick={handleToggleSelectionModal}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleAddToInvoice}
                className={`bg-blue-500 text-white px-3 py-2 rounded ${
                  isFetchOrderLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
                disabled={isFetchOrderLoading} // Disable button when loading
              >
                {isFetchOrderLoading ? "Processing..." : "Add to Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const productPriceModal = (
    <div>
      {showProductPriceModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-auto max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3 border-b bg-slate-100">
              <h2 className="text-xl font-bold">Product Prices</h2>
              <button
                onClick={handleTogglePriceModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 max-h-[70vh] overflow-y-auto thin-scrollbar">
              {isFetchProductDetailsLoading ? (
                <div>Loading...</div>
              ) : Array.isArray(productPriceState) &&
                productPriceState.length > 0 ? (
                <>
                  <h2 className="text-lg font-semibold mb-3 bg-indigo-50 px-2 py-1 rounded-md shadow-md transition duration-300 hover:bg-indigo-100">
                    <span>{productPriceState[0].product.product_name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      [SKU: {productPriceState[0].product.product_sku}]
                    </span>
                  </h2>
                  <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                    <thead className="bg-indigo-200 text-center">
                      <tr>
                        <th
                          scope="col"
                          className="border border-gray-300 px-2 py-1"
                        >
                          Effective Date
                        </th>
                        <th
                          scope="col"
                          className="border border-gray-300 px-2 py-1"
                        >
                          Unit A
                        </th>
                        <th
                          scope="col"
                          className="border border-gray-300 px-2 py-1"
                        >
                          Unit B
                        </th>
                        <th
                          scope="col"
                          className="border border-gray-300 px-2 py-1"
                        >
                          Price Fixed (?)
                        </th>
                        <th
                          scope="col"
                          className="border border-gray-300 px-2 py-1"
                        >
                          Project
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {productPriceState.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-2 py-1">
                            {formatDate(
                              item.productPrice.product_effective_date
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <label>{item.productPrice.product_number_a}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              {item.productPrice.product_unit_a}
                            </label>
                            <div className="mt-1">
                              $
                              {item.productPrice.product_price_unit_a.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <label>{item.productPrice.product_number_b}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              {item.productPrice.product_unit_b}
                            </label>
                            <div className="mt-1">
                              $
                              {item.productPrice.product_price_unit_b.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            {item.productPrice.price_fixed ? "Yes" : "No"}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {item.productPrice.project_names.map(
                              (project, index) => (
                                <label
                                  key={index}
                                  className="ml-1 p-1 border-2 rounded-md"
                                >
                                  {project}
                                </label>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div>
                  Product Price API fetched successfully, but it might be
                  empty...
                </div>
              )}
            </div>
            {/* Modal Buttons */}
            <div className="flex justify-end p-3">
              <button
                onClick={handleTogglePriceModal}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleCreateNewPrice}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                Create new price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const createProductModal = (
    <div>
      {showCreateProductModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white max-w-[90vh] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
              <h2 className="text-xl font-bold">
                {updatedOrder.supplier.supplier_name}: NEW PRODUCT
              </h2>
              <button
                onClick={handleToggleCreateProductModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto thin-scrollbar p-3">
              <NewProductModal
                supplierId={newInvoice.supplier}
                handleToggleCreateProductModal={handleToggleCreateProductModal}
                setNewProductId={setNewProductId}
                setShowRegisterConfirmationModal={
                  setShowRegisterConfirmationModal
                }
                fetchProductsBySupplier={fetchProductsBySupplier}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const editOrderModal = (
    <div>
      {showEditOrderModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-5">
          <form
            className="bg-white w-auto max-h-[90vh] overflow-y-auto rounded-lg shadow-lg"
            onSubmit={() => {
              updatePurchaseOrder(updatedOrder);
              handleToggleEditOrderModal();
              handleAddToInvoice();
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
              <h2 className="text-xl font-bold">
                EDIT PURCHASE ORDER: {updatedOrder.order_ref}
              </h2>
              <button
                onClick={handleToggleEditOrderModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-2 grid grid-cols-2">
              <div className="p-2 max-h-[70vh] overflow-y-auto thin-scrollbar">
                {/* disabled details */}
                <div className="grid grid-cols-3 text-sm">
                  <div>
                    <span className="font-bold">Purchase Order No:</span>{" "}
                    {updatedOrder.order_ref}
                  </div>
                  <div>
                    <span className="font-bold">Project:</span>{" "}
                    {updatedOrder.project.project_name}
                  </div>
                  <div>
                    <span className="font-bold">Supplier:</span>{" "}
                    {updatedOrder.supplier.supplier_name}
                  </div>
                </div>
                {/* products selection */}
                <div className="container p-0 border-2 shadow-md bg-slate-50">
                  <div className="grid grid-cols-3 m-2 gap-x-1">
                    <input
                      type="text"
                      className="form-control text-xs mb-1 col-span-2"
                      placeholder="Search products..."
                      value={searchProductTerm}
                      onChange={(e) => setSearchProductTerm(e.target.value)}
                    />
                    <div>
                      <select
                        className="form-control text-xs shadow-sm cursor-pointer opacity-95"
                        name="product_types"
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value)}
                      >
                        <option value="">Filter by Product Type...</option>
                        {distinctProductTypes.map((productType, index) => (
                          <option key={index} value={productType}>
                            {productType}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-xs">
                    <div className="p-1">
                      <label>SKU</label>
                    </div>
                    <div className="p-1">
                      <label>Name</label>
                    </div>
                    <div className="p-1">
                      <label>Unit A</label>
                    </div>
                    <div className="p-1">
                      <label>Unit B</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-1">
                      <label className="col-span-2">Type</label>
                    </div>
                  </div>
                  {productState ? (
                    filterProductsBySearchTerm()
                      .filter(
                        (product, index, self) =>
                          index ===
                          self.findIndex(
                            (p) => p.product._id === product.product._id
                          )
                      )
                      .map((product, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 gap-1 p-1 border-b text-xs text-center hover:bg-slate-100"
                          title="Add to order"
                        >
                          <div>{product.product.product_sku}</div>
                          <div>{product.product.product_name}</div>
                          <div>
                            {product.productPrice.product_number_a}
                            <span className="ml-2 opacity-50">
                              {product.productPrice.product_unit_a}
                            </span>
                          </div>
                          <div>
                            {product.productPrice.product_number_b}
                            <span className="ml-2 opacity-50">
                              {product.productPrice.product_unit_b}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 p-1">
                            <label className="col-span-2">
                              {product.product.product_types}
                            </label>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6 cursor-pointer text-green-600 justify-self-end hover:scale-110"
                              onClick={() => handleAddItem(product)}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="border shadow-sm text-center">
                      <p className="p-1">Select a supplier...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2 mt-3 max-h-[70vh] overflow-y-auto thin-scrollbar">
                {/* added products */}
                <div className="bg-gray-100 border rounded-lg shadow-sm">
                  <div className="border-0 rounded-lg">
                    <table className="table m-0 text-xs">
                      <thead className="thead-dark text-center">
                        <tr className="table-primary">
                          <th scope="col">SKU</th>
                          <th scope="col">Name</th>
                          <th scope="col">Location</th>
                          <th scope="col">Qty A</th>
                          <th scope="col">Qty B</th>
                          <th scope="col">Price A</th>
                          <th scope="col">Net Amount</th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {/* ***** REGISTERED ITEMS ***** */}
                        {updatedOrder.products &&
                          updatedOrder.products.map((prod, index) => (
                            <tr
                              className={
                                prod.product_obj_ref._id ===
                                newProductPrice.product_obj_ref
                                  ? "table-info"
                                  : ""
                              }
                            >
                              <td>{prod.product_obj_ref.product_sku}</td>
                              <td>{prod.product_obj_ref.product_name}</td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control text-xs px-1 py-0.5"
                                  name="order_product_location"
                                  value={prod.order_product_location}
                                  onChange={(e) =>
                                    handleEditInputChange(e, index)
                                  }
                                  placeholder="Ex: Level 2"
                                  required
                                  onInvalid={(e) =>
                                    e.target.setCustomValidity(
                                      "Enter item location"
                                    )
                                  }
                                  onInput={(e) =>
                                    e.target.setCustomValidity("")
                                  }
                                />
                              </td>
                              <td>
                                <div className="grid grid-cols-3 items-center border rounded w-28">
                                  <input
                                    type="number"
                                    name="order_product_qty_a"
                                    value={prod.order_product_qty_a}
                                    onChange={(e) => handleQtyChange(e, index)}
                                    min={0}
                                    step={0.0001}
                                    required
                                    onInvalid={(e) =>
                                      e.target.setCustomValidity(
                                        "Please check the value in qty-A"
                                      )
                                    }
                                    onInput={(e) =>
                                      e.target.setCustomValidity("")
                                    }
                                    className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                  />
                                  <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                    {prod.productprice_obj_ref.product_unit_a}
                                  </label>
                                </div>
                              </td>
                              <td>
                                <div className="grid grid-cols-3 items-center border rounded w-28">
                                  <input
                                    type="number"
                                    name="order_product_qty_b"
                                    value={prod.order_product_qty_b}
                                    onChange={(e) => handleQtyChange(e, index)}
                                    min={0}
                                    step={0.0001}
                                    required
                                    onInvalid={(e) =>
                                      e.target.setCustomValidity(
                                        "Please check the value in qty-B"
                                      )
                                    }
                                    onInput={(e) =>
                                      e.target.setCustomValidity("")
                                    }
                                    className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                  />
                                  <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                    {prod.productprice_obj_ref.product_unit_b}
                                  </label>
                                </div>
                              </td>
                              <td className="relative">
                                <label>
                                  ${prod.order_product_price_unit_a}
                                </label>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="size-3 cursor-pointer absolute top-0 right-0"
                                  onClick={() => {
                                    handleViewPriceVersion(
                                      updatedOrder.supplier._id,
                                      prod.product_obj_ref._id
                                    );
                                  }}
                                >
                                  <title>View product price version</title>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                  />
                                </svg>
                              </td>
                              <td>
                                <label>
                                  $
                                  {(prod.productprice_obj_ref
                                    .product_number_a === 1
                                    ? prod.order_product_qty_a *
                                      (prod.order_product_price_unit_a || 0) *
                                      prod.productprice_obj_ref.product_number_a
                                    : prod.order_product_qty_a *
                                      (prod.order_product_price_unit_a || 0)
                                  ).toFixed(2)}
                                </label>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="btn btn-danger p-1"
                                  hidden={prod._id}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        {/* ***** CUSTOM ITEMS ***** */}
                        {updatedOrder.custom_products.map((cproduct, index) => (
                          <tr key={index}>
                            <td>
                              <div className="flex justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="size-5 cursor-pointer"
                                  onClick={() => {
                                    handleToggleCreateProductModal();
                                    setTargetIndex(index);
                                    setSearchProductTerm("");
                                  }}
                                >
                                  <title>Register custom as New Product</title>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                  />
                                </svg>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control px-1 py-0.5 text-xs"
                                name="custom_product_name"
                                value={cproduct.custom_product_name}
                                onChange={(e) =>
                                  handleEditInputChange(e, index, true)
                                }
                                placeholder="Custom name"
                                onInvalid={(e) =>
                                  e.target.setCustomValidity(
                                    "Enter custom item name"
                                  )
                                }
                                onInput={(e) => e.target.setCustomValidity("")}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control px-1 py-0.5 text-xs"
                                name="custom_product_location"
                                value={cproduct.custom_product_location}
                                onChange={(e) =>
                                  handleEditInputChange(e, index, true)
                                }
                                placeholder="Ex: Level 2"
                                onInvalid={(e) =>
                                  e.target.setCustomValidity(
                                    "Enter custom item location"
                                  )
                                }
                                onInput={(e) => e.target.setCustomValidity("")}
                              />
                            </td>
                            <td>
                              <div className="grid grid-cols-3 items-center border rounded w-28">
                                <input
                                  type="number"
                                  name="custom_order_qty"
                                  value={cproduct.custom_order_qty}
                                  onChange={(e) =>
                                    handleEditInputChange(e, index, true)
                                  }
                                  min={0}
                                  step={1}
                                  onInvalid={(e) =>
                                    e.target.setCustomValidity(
                                      "Enter custom-qty-A"
                                    )
                                  }
                                  onInput={(e) =>
                                    e.target.setCustomValidity("")
                                  }
                                  className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                />
                                <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                  UNIT
                                </label>
                              </div>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomItem(index)}
                                className="btn btn-danger p-1"
                                hidden={cproduct._id}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* ADD CUSTOM BUTTON */}
                    <div className="bg-white border-b-2">
                      <div className="flex justify-center p-2">
                        <div
                          className="flex items-center border bg-gray-200 rounded-xl p-2 text-xs cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg "
                          onClick={() => handleAddCustomItem()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4 mr-1"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                          </svg>
                          <label className="cursor-pointer">
                            ADD CUSTOM ITEMS
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* more disabled details */}
                <div className="grid grid-cols-2 text-sm mt-1">
                  <div>
                    <span className="font-bold">Internal Comments:</span>
                  </div>
                  <div className="mb-1 text-end italic">
                    <span className="font-bold">Order Date:</span>{" "}
                    {formatDate(updatedOrder.order_date)}
                  </div>
                  <div className="col-span-2 border rounded-md p-1 mb-1 bg-gray-200">
                    {updatedOrder.order_internal_comments}
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Buttons */}
            <div className="flex justify-end p-3 border-t">
              <button
                onClick={handleToggleEditOrderModal}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                UPDATE
              </button>
            </div>
          </form>
        </div>
      )}
      {productPriceModal}
      {createProductModal}
    </div>
  );

  const createPriceModal = (
    <div>
      {showCreatePriceModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <form
            className="bg-white w-auto rounded-lg shadow-lg"
            onSubmit={handleSubmitNewPrice}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
              <h2 className="text-xl font-bold">CREATE NEW PRICE</h2>
              <button
                onClick={handleToggleCreatePriceModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            {updatedOrder.products
              .filter(
                (prod) =>
                  prod.product_obj_ref._id === newProductPrice.product_obj_ref
              )
              .map((prod) => (
                <div className="p-2">
                  <h2 className="text-lg font-semibold bg-indigo-50 px-3 py-1 rounded-md shadow-md transition duration-300 hover:bg-indigo-100">
                    <span>{prod.product_obj_ref.product_name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      [SKU: {prod.product_obj_ref.product_sku}]
                    </span>
                  </h2>
                  <div className="grid grid-cols-3 gap-x-10 gap-y-4 p-3 mb-1">
                    <div className="border-2 rounded p-2">
                      <div className="mb-3">
                        <label className="form-label font-bold">
                          *Number-A:
                        </label>
                        <input
                          type="number"
                          className="form-control placeholder-gray-400 placeholder-opacity-50"
                          name="product_number_a"
                          value={newProductPrice.product_number_a}
                          onChange={handleNewProductPriceInput}
                          min={1}
                          step="0.001" // Allows input with up to three decimal places
                          pattern="^\d+(\.\d{1,3})?$" // Allows up to two decimal places
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity("Enter number-A")
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          placeholder={
                            prod.productprice_obj_ref.product_number_a
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label font-bold">*Unit-A:</label>
                        <input
                          type="text"
                          className="form-control placeholder-gray-400 placeholder-opacity-50"
                          name="product_unit_a"
                          value={newProductPrice.product_unit_a}
                          onChange={handleNewProductPriceInput}
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity("Enter unit-A")
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          placeholder={prod.productprice_obj_ref.product_unit_a}
                        />
                        <label className="text-xs italic text-gray-400">
                          Ex: Box, Pack, Carton
                        </label>
                      </div>
                      <div className="mb-3">
                        <label className="form-label font-bold">
                          *Unit-A Price:
                        </label>
                        <div className="flex items-center border rounded">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 ml-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <input
                            type="number"
                            className="form-control placeholder-gray-400 placeholder-opacity-50 flex-1 pl-2 border-0"
                            name="product_price_unit_a"
                            value={newProductPrice.product_price_unit_a}
                            onChange={handleNewProductPriceInput}
                            step="0.001" // Allows input with up to three decimal places
                            min={1}
                            required
                            onInvalid={(e) =>
                              e.target.setCustomValidity("Enter unit-A price")
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            placeholder={
                              prod.productprice_obj_ref.product_price_unit_a
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-2 rounded p-2">
                      <div className="mb-3">
                        <label className="form-label font-bold">
                          *Number-B:
                        </label>
                        <input
                          type="number"
                          className="form-control placeholder-gray-400 placeholder-opacity-50"
                          name="product_number_b"
                          value={newProductPrice.product_number_b}
                          onChange={handleNewProductPriceInput}
                          step="0.001" // Allows input with up to three decimal places
                          pattern="^\d+(\.\d{1,3})?$" // Allows up to two decimal places
                          min={1}
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity("Enter number-B")
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          placeholder={
                            prod.productprice_obj_ref.product_number_b
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label font-bold">*Unit-B:</label>
                        <input
                          type="text"
                          className="form-control placeholder-gray-400 placeholder-opacity-50"
                          name="product_unit_b"
                          value={newProductPrice.product_unit_b}
                          onChange={handleNewProductPriceInput}
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity("Enter unit-B")
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          placeholder={prod.productprice_obj_ref.product_unit_b}
                        />
                        <label className="text-xs italic text-gray-400">
                          Ex: units, length, each, sheet
                        </label>
                      </div>
                      <div className="mb-3">
                        <label className="form-label font-bold">
                          *Unit-B Price:
                        </label>
                        <div className="flex items-center border rounded">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 ml-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <input
                            type="number"
                            className="form-control placeholder-gray-400 placeholder-opacity-50 flex-1 pl-2 border-0"
                            name="product_price_unit_b"
                            value={newProductPrice.product_price_unit_b}
                            onChange={handleNewProductPriceInput}
                            step="0.001" // Allows input with up to three decimal places
                            min={1}
                            required
                            onInvalid={(e) =>
                              e.target.setCustomValidity("Enter unit-B price")
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            placeholder={
                              prod.productprice_obj_ref.product_price_unit_b
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {/* **** PROJECT DROPDOWN START **** */}
                    <div>
                      <label className="block font-bold mb-2">*Project:</label>
                      <div>
                        <button
                          type="button"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() =>
                            setIsToggleProjectDropdown(!isToggleProjectDropdown)
                          }
                        >
                          {newProductPrice.projects.length > 0
                            ? `x${newProductPrice.projects.length} Projects Selected`
                            : `Select Projects`}
                        </button>
                        {isToggleProjectDropdown && (
                          <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto thin-scrollbar">
                            <ul className="py-1">
                              {projectState &&
                                projectState.length > 0 &&
                                projectState.map((project, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`project-${project._id}`}
                                      value={project._id}
                                      checked={newProductPrice.projects.includes(
                                        project._id
                                      )}
                                      onChange={handleCheckboxChangeNewPrice}
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor={`project-${project._id}`}
                                      className="text-gray-900"
                                    >
                                      {project.project_name}
                                    </label>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <p className="text-xs italic text-gray-400 mt-2">
                        Select one or more projects that this new product
                        applies to
                      </p>
                    </div>
                    {/* **** PRICE EFFECTIVE DATE **** */}
                    <div>
                      <label className="form-label font-bold">
                        *Price effective date:
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="product_effective_date"
                        value={newProductPrice.product_effective_date}
                        onChange={handleNewProductPriceInput}
                        required
                      />
                      <p className="text-xs italic text-gray-400 mt-2">
                        Product price will take effect before order date:{" "}
                        {formatDate(newProductPrice.product_effective_date)}
                      </p>
                    </div>
                    {/* **** PRICE FIXED (?) **** */}
                    <div>
                      <label className="form-label font-bold">
                        Price fixed(?):
                      </label>
                      <input
                        type="checkbox"
                        className="form-check-input m-1"
                        name="price_fixed"
                        checked={newProductPrice.price_fixed}
                        onChange={(e) =>
                          handleNewProductPriceInput({
                            target: {
                              name: "price_fixed",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            {/* Modal Buttons */}
            <div className="flex justify-end p-3 border-t">
              <button
                onClick={() => {
                  handleTogglePriceModal();
                  handleToggleCreatePriceModal();
                }}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
              >
                BACK
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                SUBMIT NEW PRICE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const confirmationModal = (
    <Modal
      show={showConfirmationModal}
      onHide={() => setShowConfirmationModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{`Change Supplier`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {`Are you sure you want to change to another supplier? Any changes you made to current order details will be discarded.`}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowConfirmationModal(false)}
        >
          Cancel
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-600"
          variant="primary"
          onClick={handleConfirmAction}
        >
          {`Change`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
  const updateConfirmationModal = (
    <Modal
      show={showUpdateConfirmationModal}
      onHide={() => {
        setShowCreatePriceModal(false);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{`Update order with new price`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {`Do you want to update the order with this new price? Any changes you made can't be reverted.`}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setShowCreatePriceModal(false);
            setShowUpdateConfirmationModal(false);
            setShowProductPriceModal(true);
            resetNewProductPrice();
          }}
        >
          Update manually
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-600"
          variant="primary"
          onClick={() => {
            handleAutomation(newProductPrice.product_obj_ref);
            resetNewProductPrice();
            setShowCreatePriceModal(false);
            setShowUpdateConfirmationModal(false);
            setShowProductPriceModal(false);
          }}
        >
          {`Update automatically now`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
  const registerConfirmationModal = (
    <Modal
      show={showRegisterConfirmationModal}
      onHide={() => {
        setShowRegisterConfirmationModal(false);
        fetchProductsBySupplier(updatedOrder.supplier._id);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{`Register as new product`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {`Do you want to update the order by replacing custom with this new product? Any changes you made can't be reverted.`}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setShowRegisterConfirmationModal(false);
            fetchProductsBySupplier(updatedOrder.supplier._id);
          }}
        >
          Update manually
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-600"
          variant="primary"
          onClick={() => {
            setShowRegisterConfirmationModal(false);
            handleRegisterAutomation();
          }}
        >
          Replace custom
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (isFetchSupplierLoading || isFetchProjectLoading) {
    return <EmployeeDetailsSkeleton />;
  }

  if (
    fetchSupplierError ||
    fetchOrderError ||
    fetchProductDetailsError ||
    addPriceErrorState ||
    fetchProjectError ||
    fetchProductsErrorState ||
    updateOrderErrorState ||
    addInvoiceError
  ) {
    const errorMessages = [
      fetchSupplierError,
      fetchOrderError,
      fetchProductDetailsError,
      addPriceErrorState,
      fetchProjectError,
      fetchProductsErrorState,
      updateOrderErrorState,
      addInvoiceError,
    ];

    const isSessionExpired = errorMessages.some((error) =>
      error?.includes("Session expired.")
    );

    if (isSessionExpired) {
      return (
        <div>
          <SessionExpired />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
            <h2 className="text-2xl font-bold">
              Ooops...Something went wrong!
            </h2>
          </div>
          <p className="mt-4 text-lg text-center">
            Error:{" "}
            {fetchSupplierError ||
              fetchOrderError ||
              fetchProductDetailsError ||
              addPriceErrorState ||
              fetchProjectError ||
              fetchProductsErrorState ||
              updateOrderErrorState ||
              addInvoiceError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300"
          >
            Try Again
          </button>
        </div>
      );
    }
  }


  return (
    <div>
      <div className="w-screen bg-neutral-50 items-center justify-center">
        {/* HEADER */}
        <div className="mx-3 mt-3 p-2 text-center font-bold text-xl bg-slate-800 text-white rounded-t-lg">
          <label>NEW INVOICE</label>
        </div>
        {/* BODY */}
        <form onSubmit={handleSubmitInvoice}>
          {/* Invoice Details */}
          <div className="mx-3 p-2 grid grid-cols-4 gap-x-4 gap-y-2 border-2">
            <div>
              <label className="font-bold">*Supplier:</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                name="supplier_name"
                value={newInvoice.supplier}
                onChange={handleSupplierChange}
                required
              >
                <option value="">Select Supplier</option>
                {supplierState &&
                  supplierState.length > 0 &&
                  supplierState
                    .filter(
                      (supplier) => supplier.supplier_isarchived === false
                    )
                    .map((supplier, index) => (
                      <option key={index} value={supplier._id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label className="font-bold">*Invoice Ref:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="invoice_ref"
                value={newInvoice.invoice_ref}
                onChange={handleInputChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Enter invoice reference number")
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div>
              <label className="font-bold">*Invoice Issue Date:</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                name="invoice_issue_date"
                value={newInvoice.invoice_issue_date}
                onChange={handleInputChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Enter invoice issue date")
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div>
              <label className="font-bold">*Invoice Received Date:</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                name="invoice_received_date"
                value={newInvoice.invoice_received_date}
                onChange={handleInputChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Enter invoice received date")
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div>
              <label className="font-bold">Invoice Due Date:</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                name="invoice_due_date"
                value={newInvoice.invoice_due_date}
                onChange={handleInputChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Enter invoice due date")
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div>
              <label className="font-bold">Invoice Without PO:</label>
              {/* toggle button */}
              <div className="flex items-center px-1 py-1">
                <div
                  onClick={handleToggle}
                  className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                    isToggled ? "bg-green-500" : ""
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      isToggled ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-gray-700 font-medium">
                  {isToggled ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
          {/* Purchase Order Details */}
          {!isToggled ? (
            <div className="mx-3 p-2 border-2">
              {/* header */}
              <div className="flex justify-between">
                <div className="font-bold flex justify-center">
                  <label>
                    Purchase Order:{" "}
                    {currentOrder ? currentOrder.order_ref : `not selected`}
                  </label>
                  {currentOrder && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="ml-2 size-4 cursor-pointer"
                      onClick={() => {
                        handleToggleEditOrderModal();
                        setUpdatedOrder(currentOrder);
                      }}
                    >
                      <title>Edit purchase order</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  )}
                </div>
                <div className="font-bold italic text-sm">
                  Order Date:{" "}
                  {currentOrder
                    ? formatDate(currentOrder.order_date)
                    : `--/--/--`}
                </div>
              </div>
              {/* items */}
              <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                <thead className="bg-indigo-200 text-center">
                  <tr>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-12"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-96"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-40"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-20"
                    >
                      Previously invoiced
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-16"
                    >
                      Qty Ordered
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-16"
                    >
                      Current Invoice Qty
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-16"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-16"
                    >
                      Expected Amount
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-1 py-2 w-16"
                    >
                      Current Invoice Amount
                    </th>
                  </tr>
                </thead>
                {currentOrder ? (
                  <tbody className="text-center">
                    {/* registered products */}
                    {currentOrder.products &&
                      currentOrder.products.map((prod, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-1 py-2">
                            {prod.product_obj_ref.product_sku}
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            {prod.product_obj_ref.product_name}
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            {prod.order_product_location}
                          </td>

                          {/* Based on previous invoice */}
                          <td className="border border-gray-300 px-1 py-2 bg-gray-100">
                            <label>
                              {currentOrder.invoices.reduce((sum, invoice) => {
                                // Reduce over each invoice to accumulate the quantities
                                const invoiceProductQtySum =
                                  invoice.products.reduce(
                                    (invoiceSum, invoiceProduct) => {
                                      // Check if the current product's _id matches the invoice product's _id
                                      if (prod._id === invoiceProduct._id) {
                                        // Add the invoice product quantity to the sum if there's a match
                                        return (
                                          invoiceSum +
                                          invoiceProduct.invoice_product_qty_a
                                        );
                                      }
                                      return invoiceSum;
                                    },
                                    0
                                  );

                                return sum + invoiceProductQtySum;
                              }, 0)}
                            </label>

                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              {prod.productprice_obj_ref.product_unit_a}
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            <label>{prod.order_product_qty_a}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              {prod.productprice_obj_ref.product_unit_a}
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2 items-center">
                            <input
                              type="number"
                              name="invoice_product_qty_a"
                              value={
                                newInvoice.products[index].invoice_product_qty_a
                              }
                              onChange={(e) => handleInputChange(e, index)}
                              step={0.0001}
                              required
                              onInvalid={(e) =>
                                e.target.setCustomValidity(
                                  "Enter invoice quantity"
                                )
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md w-20"
                            />
                            <label className="ml-2 text-xs opacity-50 text-nowrap">
                              {prod.productprice_obj_ref.product_unit_a}
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            <label>
                              $ {prod.productprice_obj_ref.product_price_unit_a}
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-end">
                            ${" "}
                            {(
                              prod.order_product_qty_a *
                              prod.productprice_obj_ref.product_price_unit_a
                            ).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-end">
                            ${" "}
                            {
                              newInvoice.products[index]
                                .invoice_product_gross_amount_a
                            }
                          </td>
                        </tr>
                      ))}
                    {/* custom products */}
                    {currentOrder.custom_products &&
                      currentOrder.custom_products.map((cusprod, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-1 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            {cusprod.custom_product_name}
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            {cusprod.custom_product_location}
                          </td>
                          {/* Based on previous invoice */}
                          <td className="border border-gray-300 px-1 py-2 bg-gray-100">
                            <label>
                              {currentOrder.invoices.reduce((sum, invoice) => {
                                // Reduce over each invoice to accumulate the quantities
                                const invoiceCtmProdQtySum =
                                  invoice.custom_products.reduce(
                                    (invoiceSum, invoiceCtmProd) => {
                                      // Check if the current product's _id matches the invoice product's _id
                                      if (cusprod._id === invoiceCtmProd._id) {
                                        // Add the invoice product quantity to the sum if there's a match
                                        return (
                                          invoiceSum +
                                          invoiceCtmProd.custom_order_qty
                                        );
                                      }
                                      return invoiceSum;
                                    },
                                    0
                                  );

                                return sum + invoiceCtmProdQtySum;
                              }, 0)}
                            </label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              {`unit`}
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            <label>{cusprod.custom_order_qty}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
                              unit
                            </label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2 items-center">
                            <input
                              type="number"
                              name="custom_order_qty"
                              value={
                                newInvoice.custom_products[index]
                                  .custom_order_qty
                              }
                              onChange={(e) => handleInputChange(e, index)}
                              step={0.0001}
                              required
                              onInvalid={(e) =>
                                e.target.setCustomValidity(
                                  "Enter invoice quantity"
                                )
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md w-20"
                            />
                            <label className="ml-2 text-xs opacity-50 text-nowrap">{`unit`}</label>
                          </td>
                          <td className="border border-gray-300 px-1 py-2">
                            $
                            <input
                              type="number"
                              name="custom_order_price"
                              value={
                                newInvoice.custom_products[index]
                                  .custom_order_price
                              }
                              onChange={(e) => handleInputChange(e, index)}
                              step={0.0001}
                              required
                              onInvalid={(e) =>
                                e.target.setCustomValidity("Enter custom price")
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md w-20"
                              disabled={
                                currentOrder.invoices.reduce((sum, invoice) => {
                                  // Reduce over each invoice to accumulate the quantities
                                  const invoiceCtmProdQtySum =
                                    invoice.custom_products.reduce(
                                      (invoiceSum, invoiceCtmProd) => {
                                        // Check if the current product's _id matches the invoice product's _id
                                        if (
                                          cusprod._id === invoiceCtmProd._id
                                        ) {
                                          // Add the invoice product quantity to the sum if there's a match
                                          return (
                                            invoiceSum +
                                            invoiceCtmProd.custom_order_price
                                          );
                                        }
                                        return invoiceSum;
                                      },
                                      0
                                    );

                                  return sum + invoiceCtmProdQtySum;
                                }, 0) > 0
                                  ? true
                                  : false
                              }
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            -
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-end">
                            ${" "}
                            {
                              newInvoice.custom_products[index]
                                .custom_order_gross_amount
                            }
                          </td>
                        </tr>
                      ))}
                    {/* calculation table */}
                    <tr>
                      <td colSpan={5}></td>
                      <td
                        className="border border-gray-300 px-2 py-2 font-bold text-end"
                        colSpan={2}
                      >
                        Delivery fee:
                      </td>
                      <td
                        className="border border-gray-300 px-3 py-2 text-center"
                        colSpan={2}
                      >
                        $
                        <input
                          type="number"
                          name="invoiced_delivery_fee"
                          value={newInvoice.invoiced_delivery_fee}
                          onChange={(e) => handleInputChange(e)}
                          min={0}
                          step={0.0001}
                          required
                          onInvalid={(e) => e.target.setCustomValidity("")}
                          onInput={(e) => e.target.setCustomValidity("")}
                          className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5}></td>
                      <td
                        className="border border-gray-300 px-2 py-2 font-bold text-end"
                        colSpan={2}
                      >
                        Strapping/Pallet/Cutting fee:
                      </td>
                      <td
                        className="border border-gray-300 px-3 py-2 text-center"
                        colSpan={2}
                      >
                        $
                        <input
                          type="number"
                          name="invoiced_other_fee"
                          value={newInvoice.invoiced_other_fee}
                          onChange={(e) => handleInputChange(e)}
                          min={0}
                          step={0.0001}
                          required
                          onInvalid={(e) => e.target.setCustomValidity("")}
                          onInput={(e) => e.target.setCustomValidity("")}
                          className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5}></td>
                      <td
                        className="border border-gray-300 px-2 py-2 font-bold text-end"
                        colSpan={2}
                      >
                        Credit:
                      </td>
                      <td
                        className="border border-gray-300 px-3 py-2 text-center"
                        colSpan={2}
                      >
                        $
                        <input
                          type="number"
                          name="invoiced_credit"
                          value={newInvoice.invoiced_credit}
                          onChange={(e) => handleInputChange(e)}
                          step={0.01}
                          required
                          onInvalid={(e) => e.target.setCustomValidity("")}
                          onInput={(e) => e.target.setCustomValidity("")}
                          className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5}></td>
                      <td
                        className="border border-gray-300 px-2 py-2 font-bold text-end"
                        colSpan={2}
                      >
                        Total Gross Amount:
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-end">
                        ${" "}
                        {(
                          currentOrder.products.reduce(
                            (total, prod) =>
                              total +
                              (Number(prod.order_product_gross_amount) ||
                                0),
                            0
                          ) +
                          (Number(newInvoice.invoiced_delivery_fee) || 0) +
                          (Number(newInvoice.invoiced_other_fee) || 0) +
                          (Number(newInvoice.invoiced_credit) || 0)
                        ).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-end">
                        ${" "}
                        {(
                          newInvoice.invoiced_calculated_total_amount_incl_gst /
                          1.1
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5}></td>
                      <td
                        className="border border-gray-300 px-2 py-2 font-bold text-end"
                        colSpan={2}
                      >
                        Total Gross Amount (incl GST):
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-end">
                        ${" "}
                        {(
                          (currentOrder.products.reduce(
                            (total, prod) =>
                              total +
                              (Number(prod.order_product_gross_amount) ||
                                0),
                            0
                          ) +
                            (Number(newInvoice.invoiced_delivery_fee) || 0) +
                            (Number(newInvoice.invoiced_other_fee) || 0) +
                            (Number(newInvoice.invoiced_credit) || 0)) *
                          1.1
                        ).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-end">
                        $ {newInvoice.invoiced_calculated_total_amount_incl_gst}
                      </td>
                    </tr>
                    <tr className="bg-indigo-100">
                      <td colSpan={5}></td>
                      <td
                        className="px-2 py-2 font-bold text-end border border-gray-400"
                        colSpan={2}
                      >
                        Total Raw Amount (incl GST):
                      </td>
                      <td className="px-3 py-2 text-center" colSpan={2}>
                        $
                        <input
                          type="number"
                          name="invoiced_raw_total_amount_incl_gst"
                          value={newInvoice.invoiced_raw_total_amount_incl_gst}
                          onChange={(e) => handleInputChange(e)}
                          min={0}
                          step={0.01}
                          required
                          onInvalid={(e) => e.target.setCustomValidity("")}
                          onInput={(e) => e.target.setCustomValidity("")}
                          className="rounded-lg ml-1 bg-white w-32 px-1 py-0.5 border"
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td
                        colSpan="9"
                        className="border border-gray-300 p-2 text-center"
                      >
                        Purchase order not selected...
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              {/* Select PO button */}
              <div className="bg-transparent border-b-2">
                <div className="flex justify-center p-2">
                  <div
                    className="flex items-center border bg-gray-200 rounded-xl p-2 text-xs cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg "
                    onClick={handleToggleSelectionModal}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <label className="cursor-pointer">
                      SELECT PURCHASE ORDER
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // INVOICE WITHOUT PO ************************
            <div className="mx-3 p-2 border-2">
              {/* header */}
              <div className="flex justify-between">
                <div className="font-bold flex justify-center">
                  <label>Invoice without order number:</label>
                </div>
                <div className="font-bold italic text-sm">
                  Order Date: {`--/--/--`}
                </div>
              </div>
              {/* items */}
              <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                <thead className="bg-indigo-200 text-center">
                  <tr>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-10"
                    >
                      <button
                        type="button"
                        className="border-green-400 bg-green-400 btn p-1 hover:bg-green-500"
                        title="Add more items"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5 cursor-pointer text-white"
                          onClick={() => handleAddCustomItem(true)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-96"
                    >
                      Item Name
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-24"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-16"
                    >
                      Invoice Qty
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-20"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-300 px-3 py-2 w-32"
                    >
                      Current Invoice Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {/* custom product */}
                  {newInvoiceWithoutPO.custom_products &&
                    newInvoiceWithoutPO.custom_products.map(
                      (cusprod, index) => (
                        <tr key={index}>
                          <td className="border px-1 py-2 text-end flex justify-center items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCustomItem(index, true)
                              }
                              className="btn btn-danger p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              name="custom_product_name"
                              value={
                                newInvoiceWithoutPO.custom_products[index]
                                  .custom_product_name
                              }
                              onChange={(e) => handleInputChangeNoPO(e, index)}
                              required
                              placeholder="Enter product name"
                              onInvalid={(e) =>
                                e.target.setCustomValidity(
                                  "Enter custom product name"
                                )
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md form-control"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              name="custom_product_location"
                              value={
                                newInvoiceWithoutPO.custom_products[index]
                                  .custom_product_location
                              }
                              onChange={(e) => handleInputChangeNoPO(e, index)}
                              required
                              placeholder="Enter location"
                              onInvalid={(e) =>
                                e.target.setCustomValidity("Enter location")
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md form-control"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              name="custom_order_qty"
                              value={
                                newInvoiceWithoutPO.custom_products[index]
                                  .custom_order_qty
                              }
                              onChange={(e) => handleInputChangeNoPO(e, index)}
                              step={0.0001}
                              required
                              onInvalid={(e) =>
                                e.target.setCustomValidity("Enter quantity")
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md w-20"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            $
                            <input
                              type="number"
                              name="custom_order_price"
                              value={
                                newInvoiceWithoutPO.custom_products[index]
                                  .custom_order_price
                              }
                              onChange={(e) => handleInputChangeNoPO(e, index)}
                              step={0.01}
                              required
                              onInvalid={(e) =>
                                e.target.setCustomValidity("Enter custom price")
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              className="px-1 py-0.5 text-xs border rounded-md w-20"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-end">
                            ${" "}
                            {
                              newInvoiceWithoutPO.custom_products[index]
                                .custom_order_gross_amount
                            }
                          </td>
                        </tr>
                      )
                    )}
                  {newInvoiceWithoutPO.custom_products.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="border border-gray-300 p-2 text-center"
                      >
                        Items not added...
                      </td>
                    </tr>
                  )}
                  {/* calculation table */}
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">
                      Delivery fee:
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-end">
                      $
                      <input
                        type="number"
                        name="invoiced_delivery_fee"
                        value={newInvoiceWithoutPO.invoiced_delivery_fee}
                        onChange={(e) => handleInputChangeNoPO(e, null)}
                        min={0}
                        step={0.0001}
                        required
                        onInvalid={(e) => e.target.setCustomValidity("")}
                        onInput={(e) => e.target.setCustomValidity("")}
                        className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">
                      Strapping/Pallet/Cutting fee:
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-end">
                      $
                      <input
                        type="number"
                        name="invoiced_other_fee"
                        value={newInvoiceWithoutPO.invoiced_other_fee}
                        onChange={(e) => handleInputChangeNoPO(e, null)}
                        min={0}
                        step={0.0001}
                        required
                        onInvalid={(e) => e.target.setCustomValidity("")}
                        onInput={(e) => e.target.setCustomValidity("")}
                        className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">
                      Credit:
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-end">
                      $
                      <input
                        type="number"
                        name="invoiced_credit"
                        value={newInvoiceWithoutPO.invoiced_credit}
                        onChange={(e) => handleInputChangeNoPO(e, null)}
                        min={0}
                        step={0.01}
                        required
                        onInvalid={(e) => e.target.setCustomValidity("")}
                        onInput={(e) => e.target.setCustomValidity("")}
                        className="rounded-lg ml-1 w-32 px-1 py-0.5 border"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">
                      Total Gross Amount:
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-end">
                      ${" "}
                      {(
                        newInvoiceWithoutPO.custom_products.reduce(
                          (total, prod) =>
                            total +
                            (Number(prod.custom_order_gross_amount) || 0),
                          0
                        ) +
                        (Number(newInvoiceWithoutPO.invoiced_delivery_fee) ||
                          0) +
                        (Number(newInvoiceWithoutPO.invoiced_other_fee) || 0) +
                        (Number(newInvoiceWithoutPO.invoiced_credit) || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">
                      Total Gross Amount (incl GST):
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-end">
                      ${" "}
                      {(
                        (newInvoiceWithoutPO.custom_products.reduce(
                          (total, prod) =>
                            total +
                            (Number(prod.custom_order_gross_amount) || 0),
                          0
                        ) +
                          (Number(newInvoiceWithoutPO.invoiced_delivery_fee) ||
                            0) +
                          (Number(newInvoiceWithoutPO.invoiced_other_fee) ||
                            0) +
                          (Number(newInvoiceWithoutPO.invoiced_credit) || 0)) *
                        1.1
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-indigo-100">
                    <td colSpan={4}></td>
                    <td className="px-2 py-2 font-bold text-end border border-gray-400">
                      Total Raw Amount (incl GST):
                    </td>
                    <td className="px-3 py-2 text-end">
                      $
                      <input
                        type="number"
                        name="invoiced_raw_total_amount_incl_gst"
                        value={
                          newInvoiceWithoutPO.invoiced_raw_total_amount_incl_gst
                        }
                        onChange={(e) => handleInputChangeNoPO(e, null)}
                        min={0}
                        step={0.01}
                        required
                        onInvalid={(e) => e.target.setCustomValidity("")}
                        onInput={(e) => e.target.setCustomValidity("")}
                        className="rounded-lg ml-1 bg-white w-32"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {/* Invoice Details */}
          <div className="mx-3 p-2 border-2">

            <div className="flex justify-between mb-2">
              <div>
                <label className="font-bold">*Invoice status:</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                  name="invoice_status"
                  value={newInvoice.invoice_status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select status</option>
                  <option value="To review">To review</option>
                  <option value="To reconcile">To reconcile</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Settled">Settled</option>
                </select>
              </div>
              <div></div>
            </div>

            <div>
              <div className="mb-2">
                <label className="font-bold">Internal Comments:</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="invoice_internal_comments"
                  value={newInvoice.invoice_internal_comments}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                >
                  SUBMIT INVOICE
                </button>
              </div>
            </div>
          </div>
          {/* Invoice File Upload */}
          <div></div>
        </form>
        {orderSelectionModal}
        {editOrderModal}
        {createPriceModal}
        {confirmationModal}
        {updateConfirmationModal}
        {registerConfirmationModal}
      </div>
    </div>
  );
};

export default NewInvoiceForm;
