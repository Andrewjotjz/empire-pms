"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import LoadingSpinner from "../loaders/LoadingSpinner"
import FormField from "../../components/FormField"
import { Trash2 } from "lucide-react"

const UpdatePaymentForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  // Date utility functions
  const getCurrentDate = () => {
    const today = new Date()
    return today
      .toLocaleDateString("en-AU", {
        timeZone: "Australia/Melbourne",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-")
  }

  const getFirstDayOfPreviousMonth = () => {
    const today = new Date()
    today.setDate(1)
    today.setMonth(today.getMonth() - 1)
    return today
      .toLocaleDateString("en-AU", {
        timeZone: "Australia/Melbourne",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-")
  }

  const getLastDayOfPreviousMonth = () => {
    const today = new Date()
    today.setDate(1)
    today.setDate(today.getDate() - 1)
    return today
      .toLocaleDateString("en-AU", {
        timeZone: "Australia/Melbourne",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-")
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }
    return date.toLocaleDateString("en-AU", options).toUpperCase()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "AUD" }).format(Math.floor(amount * 100) / 100)
  }

  // Constants
  const paymentTypes = ["Invoice", "Bulk invoices (statement)"]
  const paymentMethods = ["Bank transfer", "Credit card", "Cash", "Letter of credit", "Others"]

  // State management
  const [paymentState, setPaymentState] = useState({
    payment_type: "",
    payment_ref: "",
    supplier: "",
    payment_method: "",
    payment_term: [
      {
        payment_datetime: getCurrentDate(),
        payment_amount_paid: 0,
      },
    ],
    payment_raw_total_amount_incl_gst: 0,
    period_start_date: getFirstDayOfPreviousMonth(),
    period_end_date: getLastDayOfPreviousMonth(),
    invoices: [
      {
        invoice_obj_ref: "",
        invoice_ref: "",
        invoice_issue_date: "",
        invoice_status: "",
        gross_total_amount: 0,
      },
    ],
    payment_status: "In Review",
    employees: ["66833b93269c01bc18cc6223"],
    payment_internal_comments: "",
    companies: [],
  })

  const [supplierState, setSupplierState] = useState([])
  const [projectState, setProjectState] = useState([])
  const [invoiceState, setInvoiceState] = useState([])
  const [targetInvoices, setTargetInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState({ _id: "" })
  const [targetCompanies, setTargetCompanies] = useState([])
  const [companyState, setCompanyState] = useState([])
  const [isCompanyDropdownOpen, setCompanyIsDropdownOpen] = useState(false)

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const localUser = JSON.parse(localStorage.getItem("localUser"))

  // Calculated values
  const totalInvoiceAmount = targetInvoices.reduce(
    (sum, invoice) => sum + (invoice?.invoiced_raw_total_amount_incl_gst || 0),
    0,
  )
  const totalPaidAmount = paymentState.payment_term.reduce(
    (sum, payment) => sum + (payment?.payment_amount_paid || 0),
    0,
  )
  const totalBalance = Math.floor((totalInvoiceAmount - totalPaidAmount) * 100) / 100

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!paymentState.payment_ref.trim()) {
      newErrors.payment_ref = "Payment reference is required"
    }

    if (!paymentState.supplier) {
      newErrors.supplier = "Supplier selection is required"
    }

    if (!paymentState.payment_method) {
      newErrors.payment_method = "Payment method is required"
    }

    if (!paymentState.payment_type) {
      newErrors.payment_type = "Payment type is required"
    }

    if (!paymentState.payment_raw_total_amount_incl_gst || paymentState.payment_raw_total_amount_incl_gst <= 0) {
      newErrors.payment_raw_total_amount_incl_gst = "Total amount must be greater than 0"
    }

    if (targetInvoices.length === 0) {
      newErrors.invoices = "At least one invoice must be selected"
    }

    paymentState.payment_term.forEach((term, index) => {
      if (!term.payment_datetime) {
        newErrors[`payment_term_${index}_date`] = "Payment date is required"
      }
      if (!term.payment_amount_paid || term.payment_amount_paid <= 0) {
        newErrors[`payment_term_${index}_amount`] = "Payment amount must be greater than 0"
      }
    })

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setPaymentState((prev) => ({
      ...prev,
      [name]: name === "payment_raw_total_amount_incl_gst" ? Number(value) : value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Handle date changes
    if (name === "period_start_date" || name === "period_end_date") {
      const startDate = name === "period_start_date" ? value : paymentState.period_start_date
      const endDate = name === "period_end_date" ? value : paymentState.period_end_date

      if (paymentState.supplier) {
        const filteredInvoices = invoiceState.filter(
          (invoice) =>
            invoice.supplier._id === paymentState.supplier &&
            invoice.invoice_issue_date.split("T")[0] >= startDate &&
            invoice.invoice_issue_date.split("T")[0] <= endDate,
        )
        setTargetInvoices(filteredInvoices)
      }
    }
  }

  const handlePaymentTerm = (index, field, value) => {
    setPaymentState((prev) => ({
      ...prev,
      payment_term: prev.payment_term.map((term, i) =>
        i === index ? { ...term, [field]: field === "payment_amount_paid" ? Number(value) : value } : term,
      ),
    }))

    // Clear error when user starts typing
    const errorKey = `payment_term_${index}_${field === "payment_datetime" ? "date" : "amount"}`
    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  const addPaymentTerm = () => {
    setPaymentState((prev) => ({
      ...prev,
      payment_term: [...prev.payment_term, { payment_datetime: "", payment_amount_paid: 0 }],
    }))
  }

  const removePaymentTerm = (index) => {
    setPaymentState((prev) => ({
      ...prev,
      payment_term: prev.payment_term.filter((_, i) => i !== index),
    }))
  }

  const handleInvoiceChange = (e) => {
    const { value } = e.target
    if (value === "") {
      setSelectedInvoice({ _id: "" })
      return
    }

    const foundInvoice = invoiceState.find((invoice) => invoice._id === value)
    if (foundInvoice) {
      setSelectedInvoice(foundInvoice)
    }
  }

  const handleAddInvoice = () => {
    if (selectedInvoice && selectedInvoice._id) {
      setTargetInvoices((prev) => [...prev, selectedInvoice])
      setSelectedInvoice({ _id: "" })
    }
  }

  const handleRemoveInvoice = (index) => {
    setTargetInvoices((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target
    setTargetCompanies((prevState) => {
      const updatedCompanies = checked ? [...prevState, value] : prevState.filter((company) => company !== value)
      return updatedCompanies
    })
    // Clear error when selection changes
    if (formErrors.companies) {
      setFormErrors((prev) => ({ ...prev, companies: "" }))
    }

  }

  // Helper function to get selected company names
  const getSelectedCompanyNames = () => {
    if (targetCompanies.length === 0) return "Select Company"
    if (targetCompanies.length === 1) {
      const company = companyState.find((c) => c._id === targetCompanies[0])
      return company ? company.company_name : "1 Company Selected"
    }
    return `${targetCompanies.length} Companies Selected`
  }

  const formatInvoices = (invoices) => {
    return invoices.map((invoice) => ({
      invoice_obj_ref: invoice._id,
      invoice_ref: invoice.invoice_ref,
      invoice_issue_date: invoice.invoice_issue_date,
      invoice_status: invoice.invoice_status,
      gross_total_amount: invoice.invoiced_raw_total_amount_incl_gst,
    }))
  }

  const calculatePaymentStatus = () => {
    if (totalBalance === 0) return "Fully Settled"
    if (totalBalance > 0 && totalBalance < paymentState.payment_raw_total_amount_incl_gst) return "Partially Settled"
    if (totalBalance === paymentState.payment_raw_total_amount_incl_gst && paymentState.payment_status !== "In Review")
      return "Statement Checked"
    if (paymentState.payment_status === "In Review" && totalBalance >= 0) return "In Review"
    if (totalBalance < 0) return "Overpaid"
    return "Overpaid"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
    
    // Check for invoices that already exist in other statements AND not its own statement
    const existingInvoices = targetInvoices.filter((invoice) => invoice.payment && invoice.payment !== null && invoice.payment._id !== id)

    if (existingInvoices.length > 0) {
      const invoiceList = existingInvoices.map((invoice) => `• ${invoice.invoice_ref}`).join("\n")
      alert(`Unable to proceed. These invoices already exist in other statements:\n\n${invoiceList}`)
      return
    }

    // Check for unreviewed invoices
    const unreviewedInvoices = targetInvoices.filter((invoice) =>
      ["To reconcile", "To review", "Cancelled"].includes(invoice.invoice_status),
    )

    if (unreviewedInvoices.length > 0) {
      const confirmed = window.confirm("You have unapproved invoice(s). Are you sure you want to update this payment?")
      if (!confirmed) return
    }

    setIsSubmitting(true)

    try {
      const updatedPaymentState = {
        ...paymentState,
        companies: targetCompanies,
        invoices: formatInvoices(targetInvoices),
        payment_status: calculatePaymentStatus(),
      }

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment/${id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(updatedPaymentState),
      })

      const data = await res.json()

      if (data.tokenError) {
        throw new Error(data.tokenError)
      }

      if (!res.ok) {
        throw new Error("Failed to update payment")
      }

      navigate(`/EmpirePMS/payment/${id}`)
      alert("Payment updated successfully!")
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [suppliersRes, projectsRes, invoicesRes, companiesRes, paymentRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/company`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/payment/${id}`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          }),
        ])

        const [suppliersData, projectsData, invoicesData, companiesData, paymentData] = await Promise.all([
          suppliersRes.json(),
          projectsRes.json(),
          invoicesRes.json(),
          companiesRes.json(),
          paymentRes.json(),
        ])

        // Check for token errors
        if (
          suppliersData.tokenError ||
          projectsData.tokenError ||
          invoicesData.tokenError ||
          companiesData.tokenError ||
          paymentData.tokenError
        ) {
          throw new Error("Session expired")
        }

        setSupplierState(suppliersData)
        setProjectState(projectsData)
        setInvoiceState(invoicesData.filter((invoice) => !invoice.invoice_isarchived))
        setCompanyState(companiesData)
        setPaymentState(paymentData)

        // Set target companies from payment data
        if (paymentData.companies) {
          setTargetCompanies(paymentData.companies)
        }

        // Map invoices from payment data
        if (paymentData.invoices && invoicesData.length > 0) {
          const mappedInvoices = paymentData.invoices
            .map((fetchedInvoice) => invoicesData.find((invoice) => invoice._id === fetchedInvoice.invoice_obj_ref))
            .filter(Boolean)
          setTargetInvoices(mappedInvoices)
        }
      } catch (error) {
        setErrors({ fetch: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <LoadingSpinner size="large" text="Loading payment data..." />
        </div>
      </div>
    )
  }

  // Error state
  if (errors.fetch) {
    if (errors.fetch.includes("Session expired") || errors.fetch.includes("jwt expired")) {
      return <SessionExpired />
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{errors.fetch}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black-600 to-black-700 px-6 py-4 bg-black">
            <h1 className="text-2xl font-bold text-white">Update Payment</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Payment Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  label="Payment Reference"
                  name="payment_ref"
                  value={paymentState.payment_ref}
                  onChange={handleChange}
                  placeholder="Enter payment reference"
                  required
                  error={formErrors.payment_ref}
                />

                <FormField label="Supplier" name="supplier" required error={formErrors.supplier}>
                  <select
                    name="supplier"
                    value={paymentState.supplier}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  >
                    <option value="">Select supplier</option>
                    {supplierState.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Company" name="companies" required error={formErrors.companies}>
                  <button
                    type="button"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-left focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      formErrors.companies ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    onClick={() => setCompanyIsDropdownOpen(!isCompanyDropdownOpen)}
                    disabled
                  >
                    {getSelectedCompanyNames()}
                    <svg
                      className={`w-5 h-5 float-right mt-0.5 transition-transform ${isCompanyDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isCompanyDropdownOpen && (
                    <div className="absolute z-10 bg-white shadow-lg rounded-md mt-1 border border-gray-300">
                      {companyState.map((company) => (
                        <label
                          key={company._id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="companies"
                            value={company._id}
                            checked={targetCompanies.includes(company._id)}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                          />
                          {company.company_name}
                        </label>
                      ))}
                    </div>
                  )}
                  {formErrors.companies && <p className="mt-1 text-red-500 text-sm">{formErrors.companies}</p>}
                </FormField>

                <FormField label="Payment Method" name="payment_method" required error={formErrors.payment_method}>
                  <select
                    name="payment_method"
                    value={paymentState.payment_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select method</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Payment Type" name="payment_type" required error={formErrors.payment_type}>
                  <select
                    name="payment_type"
                    value={paymentState.payment_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select type</option>
                    {paymentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Total Amount (incl. GST)"
                  name="payment_raw_total_amount_incl_gst"
                  type="number"
                  value={paymentState.payment_raw_total_amount_incl_gst}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  error={formErrors.payment_raw_total_amount_incl_gst}
                />
              </div>
            </div>

            {/* Invoice Selection Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Invoice Selection
              </h3>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  label="Period Start Date"
                  name="period_start_date"
                  type="date"
                  value={paymentState.period_start_date?.split("T")[0]}
                  onChange={handleChange}
                />
                <FormField
                  label="Period End Date"
                  name="period_end_date"
                  type="date"
                  value={paymentState.period_end_date?.split("T")[0]}
                  onChange={handleChange}
                />
              </div>

              {formErrors.invoices && <p className="mb-4 text-sm text-red-600">{formErrors.invoices}</p>}

              {/* Invoices Table */}
              <div className="bg-white border rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-orange-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-900">Invoice Ref.</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Issue Date</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Order No.</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Project</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-3 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetInvoices.length > 0 ? (
                        targetInvoices.map((invoice, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">
                              {invoice.invoice_ref}
                            </td>
                            <td className="px-6 py-4">{formatDate(invoice.invoice_issue_date)}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  invoice.invoice_status === "To review"
                                    ? "bg-orange-100 text-orange-800"
                                    : invoice.invoice_status === "To reconcile"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : invoice.invoice_status === "Reviewed"
                                        ? "bg-blue-100 text-blue-800"
                                        : invoice.invoice_status === "Cancelled"
                                          ? "bg-gray-100 text-gray-800"
                                          : invoice.invoice_status === "Settled"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {invoice.invoice_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">
                              {invoice.order?.order_ref}
                            </td>
                            <td className="px-6 py-4">
                              {projectState.find((project) => project._id === invoice.order?.project)?.project_name}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatCurrency(invoice.invoiced_raw_total_amount_incl_gst)}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => handleRemoveInvoice(index)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No invoices found for the selected date range and supplier.
                          </td>
                        </tr>
                      )}

                      {/* Summary Rows */}
                      <tr className="bg-gray-50 border-t-2">
                        <td colSpan={5} className="px-6 py-3 font-bold text-right">
                          Total Invoice Amount:
                        </td>
                        <td className="px-6 py-3 font-bold">{formatCurrency(totalInvoiceAmount)}</td>
                        <td className="px-6 py-3"></td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-3 font-bold text-right">
                          Total Due:
                        </td>
                        <td className={`px-6 py-3 font-bold ${totalBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(totalBalance)}
                          {totalBalance === 0 && (
                            <svg
                              className="w-4 h-4 inline-block ml-2 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </td>
                        <td className="px-6 py-3"></td>
                      </tr>

                      {/* Add Invoice Row */}
                      <tr className="bg-gray-600">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <select
                              value={selectedInvoice._id}
                              onChange={handleInvoiceChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">Add other invoice</option>
                              {invoiceState
                                .filter(
                                  (invoice) =>
                                    invoice.supplier._id === paymentState.supplier &&
                                    (invoice.invoice_issue_date.split("T")[0] < paymentState.period_start_date ||
                                      invoice.invoice_issue_date.split("T")[0] > paymentState.period_end_date) &&
                                    !invoice.invoice_isarchived &&
                                    !["Settled", "Cancelled"].includes(invoice.invoice_status) &&
                                    !targetInvoices.some((targetInvoice) => targetInvoice._id === invoice._id),
                                )
                                .map((invoice) => (
                                  <option key={invoice._id} value={invoice._id}>
                                    {invoice.invoice_ref}
                                  </option>
                                ))}
                            </select>

                            {selectedInvoice._id && (
                              <>
                                <div className="flex items-center gap-4 text-white text-sm">
                                  <span>{formatDate(selectedInvoice.invoice_issue_date)}</span>
                                  <span>{selectedInvoice.invoice_status}</span>
                                  <span>{formatCurrency(selectedInvoice.invoiced_raw_total_amount_incl_gst)}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddInvoice}
                                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                  Add Invoice
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Terms Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Payment Terms</h3>

              <div className="space-y-4">
                {paymentState.payment_term.map((term, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <FormField
                        label="Payment Date"
                        name={`payment_datetime_${index}`}
                        type="date"
                        value={term.payment_datetime?.split("T")[0]}
                        onChange={(e) => handlePaymentTerm(index, "payment_datetime", e.target.value)}
                        required
                        error={formErrors[`payment_term_${index}_date`]}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        label="Payment Amount (incl. GST)"
                        name={`payment_amount_${index}`}
                        type="number"
                        value={term.payment_amount_paid}
                        onChange={(e) => handlePaymentTerm(index, "payment_amount_paid", e.target.value)}
                        placeholder="0.00"
                        required
                        error={formErrors[`payment_term_${index}_amount`]}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                        Term {index + 1}
                      </span>
                      {paymentState.payment_term.length > 1 && index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePaymentTerm(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPaymentTerm}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Payment Term
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <FormField
                label="Internal Comments"
                name="payment_internal_comments"
                value={paymentState.payment_internal_comments}
                onChange={handleChange}
                placeholder="Add any internal comments about this payment..."
              >
                <textarea
                  name="payment_internal_comments"
                  value={paymentState.payment_internal_comments}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add any internal comments about this payment..."
                />
              </FormField>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/EmpirePMS/payment/${id}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <div className="flex gap-4">
                <button
                  type="submit"
                  onClick={() =>
                    setPaymentState((prev) => ({
                      ...prev,
                      payment_status: "In Review",
                    }))
                  }
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save as In Review"
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Payment...
                    </>
                  ) : (
                    "Update Payment"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdatePaymentForm

//! Commented due to AI enhancement
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';


// import SessionExpired from "../../components/SessionExpired"
// import LoadingScreen from "../loaders/LoadingScreen"
// import UnauthenticatedSkeleton from '../loaders/UnauthenticateSkeleton';


// const UpdatePaymentForm = () => {
//     // Hooks
//     const navigate = useNavigate();
//     const { id } = useParams();

//     // Variables
//     const getCurrentDate = () => {
//         const today = new Date();
//         // Format the date as YYYY-MM-DD
//         return today.toLocaleDateString("en-AU", {
//             timeZone: "Australia/Melbourne",
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit"
//           }).split("/").reverse().join("-");
//     };
//     const getFirstDayOfPreviousMonth = () => {
//         const today = new Date();
        
//         // Set to the first day of the current month
//         today.setDate(1);
        
//         // Move back one month
//         today.setMonth(today.getMonth() - 1);
        
//         // Format the date as YYYY-MM-DD
//         return today.toLocaleDateString("en-AU", {
//             timeZone: "Australia/Melbourne",
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit"
//         }).split("/").reverse().join("-");
//     };
//     const getLastDayOfPreviousMonth = () => {
//         const today = new Date();
    
//         // Set to the first day of the current month
//         today.setDate(1);
    
//         // Move back one day to get the last day of the previous month
//         today.setDate(today.getDate() - 1);
    
//         // Format the date as YYYY-MM-DD
//         return today.toLocaleDateString("en-AU", {
//             timeZone: "Australia/Melbourne",
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit"
//         }).split("/").reverse().join("-");
//     };
//     const formatDate = (dateString) => {
//         if (dateString === null) {
//             return ''
//         }  else {
//             const date = new Date(dateString);
//             const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
//             return date.toLocaleDateString('en-AU', options).toUpperCase()
//         }
//     };
//     const paymentType = ['Invoice', 'Bulk invoices (statement)'];
//     const paymentMethod = ['Bank transfer', 'Credit card', 'Cash', 'Letter of credit', 'Others'];
//     const [supplierState, setSupplierState] = useState([]);
//     const [projectState, setProjectState] = useState([]);
//     const [invoiceState, setInvoiceState] = useState([]);
//     const [targetInvoices, setTargetInvoices] = useState([]); // To display invoices in the table
//     const [selectedInvoice, setSelectedInvoice] = useState({_id: ""}); // Add other invoice drop down
//     const [isFetchSupplierLoading, setIsFetchSupplierLoading] = useState(false);
//     const [fetchSupplierError, setFetchSupplierError] = useState(null);
//     const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false);
//     const [fetchProjectError, setFetchProjectError] = useState(null);
//     const [isFetchInvoiceLoading, setIsFetchInvoiceLoading] = useState(false);
//     const [fetchInvoiceError, setFetchInvoiceError] = useState(null);
//     const [isAddPaymentLoading, setIsAddPaymentLoading] = useState(false);
//     const [addPaymentError, setAddPaymentError] = useState(null);
//     const [isFetchPaymentLoading, setIsFetchPaymentLoading] = useState(false);
//     const [fetchPaymentError, setFetchPaymentError] = useState(null);
//     const [paymentState, setPaymentState] = useState({
//         payment_type: '',
//         payment_ref: '',
//         supplier: '',
//         payment_method: '',
//         payment_term: [{
//             payment_datetime: getCurrentDate(),
//             payment_amount_paid: 0
//         }],
//         payment_raw_total_amount_incl_gst: 0,
//         period_start_date: getFirstDayOfPreviousMonth(),
//         period_end_date: getLastDayOfPreviousMonth(),
//         invoices: [
//             {
//                 invoice_obj_ref: '',
//                 invoice_ref: '',
//                 invoice_issue_date: '',
//                 invoice_status: '',
//                 gross_total_amount: 0
//             }
//         ],
//         payment_status: 'In Review',
//         employees: ['66833b93269c01bc18cc6223'],
//         payment_internal_comments: ''
//     });
    
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     const totalBalance = Math.floor(
//         (targetInvoices.reduce((totalSum, invoice) => {
//           return totalSum + (invoice?.invoiced_raw_total_amount_incl_gst || 0);
//         }, 0) -
//         paymentState.payment_term.reduce((totalSum, payment) => {
//           return totalSum + (payment?.payment_amount_paid || 0);
//         }, 0)) * 100
//       ) / 100;

//     // Functions
//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setPaymentState((prevPayment) => ({
//         ...prevPayment,
//         [name]: name === "payment_raw_total_amount_incl_gst" ? Number(value) : value,
//         }));

//         if (name === "supplier") {
//             let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === value && !invoice.invoice_isarchived);
//             setTargetInvoices(filteredInvoices)
//         }

//         if (name === "period_start_date") {
//             let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === paymentState.supplier && invoice.invoice_issue_date.split('T')[0] >= value && invoice.invoice_issue_date.split('T')[0] <= paymentState.period_end_date);
//             setTargetInvoices(filteredInvoices)
//         }
//         if (name === "period_end_date") {
//             let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === paymentState.supplier && invoice.invoice_issue_date.split('T')[0] >= paymentState.period_start_date && invoice.invoice_issue_date.split('T')[0] <= value)
//             setTargetInvoices(filteredInvoices)
//         }
//     }

//     const handlePaymentTerm = (index, field, value) => {
//         setPaymentState({
//           ...paymentState,
//           payment_term: paymentState.payment_term.map((term, i) =>
//             i === index ? { ...term, [field]: field === "payment_amount_paid" ? Number(value) : value } : term
//           )
//         });
//       };      
    
//       const addPaymentTerm = () => {
//         setPaymentState({
//           ...paymentState,
//           payment_term: [
//             ...paymentState.payment_term,
//             { payment_datetime: '', payment_amount_paid: 0 }
//           ]
//         });
//       };
    
//       const removePaymentTerm = (id) => {
//         setPaymentState({
//           ...paymentState,
//           payment_term: paymentState.payment_term.filter((_, idx) => idx !== id)
//         });
//       };

//     const handleInvoiceChange = (e) => {
//         const { value } = e.target; // This will be the invoice ID (_id)

//         if (value === '') {
//             setSelectedInvoice({_id: ""});
//             return
//         }
        
//         // Find the full invoice object from the state using the ID
//         const foundInvoice = invoiceState.find((invoice) => invoice._id === value);
    
//         if (foundInvoice) {    
//             setSelectedInvoice(foundInvoice);
//         }
//     };

//     const handleAddInvoice = () => {
//         if (selectedInvoice) {
//             setTargetInvoices((prevInvoices) => [...prevInvoices, selectedInvoice]);
//         }

//         setSelectedInvoice({ _id: ''});
//     };

//     const handleRemoveInvoice = (ivcIndex) => {
//         const updatedInvoices = targetInvoices.filter((_, idx) => idx !== ivcIndex);
//         setTargetInvoices(updatedInvoices);
//     }

//     const updatePayment = async (payment) => {
//         setIsAddPaymentLoading(true)
//         setAddPaymentError(null)

//         const putPayment = async () => {
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment/${id}`, {
//                     credentials: 'include', method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     },
//                     body: JSON.stringify(payment)
//                 })

//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError)
//                 }

//                 if (!res.ok) {
//                     throw new Error('Failed to update (PUT) payment details')
//                 }
//                 if (res.ok) {
//                     // navigate client to home page
//                     navigate(`/EmpirePMS/payment/${id}`)

//                     alert(`Payment updated successfully!`);
                
//                     // update loading state
//                     setIsAddPaymentLoading(false)

//                 }
//             } catch (error) {
//                 setAddPaymentError(error.message);
//                 setIsAddPaymentLoading(false);
//             }
//         }
//         putPayment();
//     }

//     const formatInvoices = (invoices) => {
//         return invoices.map(invoice => ({
//             invoice_obj_ref: invoice._id,
//             invoice_ref: invoice.invoice_ref,
//             invoice_issue_date: invoice.invoice_issue_date,
//             invoice_status: invoice.invoice_status,
//             gross_total_amount: invoice.invoiced_raw_total_amount_incl_gst
//         }));
//     };
    
//     const handleUpdatePayment = (e) => {
//         e.preventDefault();

//         // Check for invoices that already existed in other statements
//         const hasExistedInvoices = targetInvoices.some(
//             invoice => invoice.payment !== ''
//         );

//         if (hasExistedInvoices) {
//             const existedInvoices = targetInvoices
//                 .filter(invoice => invoice.payment !== '') // Ensure only relevant invoices are included
//                 .map(invoice => `• ${invoice.invoice_ref}`) // Add bullet points for better readability
//                 .join("\n"); // Join items with a new line
        
//             alert(`Unable to proceed. These invoices already exist in other statements:\n\n${existedInvoices}`);
//             return;
//         }
    
//         // Check for unreviewed invoices
//         const hasUnreviewedInvoices = targetInvoices.some(
//             invoice => invoice.invoice_status === "To reconcile" || invoice.invoice_status === "Cancelled"
//         );
    
//         if (hasUnreviewedInvoices) {
//             const userConfirmed = window.confirm(
//                 'You have unreviewed invoice(s). Are you sure you want to create this payment?'
//             );
//             if (!userConfirmed) {
//                 return;
//             }
//         }
    
//         // Update payment state with formatted invoices
//         const updatedInvoices = formatInvoices(targetInvoices);
    
//         // Determine the latest payment status
//         const paymentStatus = totalBalance === 0
//             ? "Fully Settled"
//             : totalBalance > 0 && totalBalance < paymentState.payment_raw_total_amount_incl_gst
//             ? "Partially Settled"
//             : totalBalance === paymentState.payment_raw_total_amount_incl_gst && paymentState.payment_status !== "In Review"
//             ? "Statement Checked"
//             : paymentState.payment_status === "In Review" && !(totalBalance < 0)
//             ? "In Review"
//             : totalBalance < 0
//             ? "Overpaid" : "Overpaid" ;
    
//         // Construct the updated payment state
//         const updatedPaymentState = {
//             ...paymentState,
//             invoices: updatedInvoices,
//             payment_status: paymentStatus
//         };
    
//         // Update the state
//         setPaymentState(updatedPaymentState);
    
//         // Submit the latest payment state
//         updatePayment(updatedPaymentState);
//     };
    
    
//     // Fetch supplier
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchSuppliers = async () => {
//             setIsFetchSupplierLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, { signal , credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }});
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
                
//                 setIsFetchSupplierLoading(false);
//                 setSupplierState(data);
//                 setFetchSupplierError(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsFetchSupplierLoading(false);
//                     setFetchSupplierError(error.message);
//                 }
//             }
//         };

//         fetchSuppliers();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, []);
//     // Fetch project
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchProjects = async () => {
//             setIsFetchProjectLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }});
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
                
//                 setIsFetchProjectLoading(false);
//                 setProjectState(data);
//                 setFetchProjectError(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsFetchProjectLoading(false);
//                     setFetchProjectError(error.message);
//                 }
//             }
//         };

//         fetchProjects();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, []);
//     // Fetch invoices
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchInvoices = async () => {
//             setIsFetchInvoiceLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice`, { signal , credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }});
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
                
//                 setIsFetchInvoiceLoading(false);
//                 setInvoiceState(data);
//                 setFetchInvoiceError(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsFetchInvoiceLoading(false);
//                     setFetchInvoiceError(error.message);
//                 }
//             }
//         };

//         fetchInvoices();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, []);
//     // Fetch payment
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchPayment = async () => {
//             setIsFetchPaymentLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment/${id}`, { 
//                     signal,
//                     credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }
//                 });
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }

//                 setIsFetchPaymentLoading(false);
//                 setPaymentState(data); // Save fetched payment to state
//                 setFetchPaymentError(null);

//                 // Check if invoiceState is populated before mapping
//                 if (invoiceState.length > 0) {
//                     const mappedInvoices = data.invoices.map(fetchedInvoice => 
//                         invoiceState.find(invoice => invoice._id === fetchedInvoice.invoice_obj_ref) || null
//                     );
//                     setTargetInvoices(mappedInvoices);
//                 }
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsFetchPaymentLoading(false);
//                     setFetchPaymentError(error.message);
//                 }
//             }
//         };

//         fetchPayment();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, [invoiceState]); // Re-run fetchPayment when invoiceState changes


//     if (isFetchInvoiceLoading || isFetchProjectLoading || isFetchSupplierLoading || isAddPaymentLoading || isFetchPaymentLoading) { return (<LoadingScreen />); }

//     if (fetchSupplierError) {
//         if(fetchSupplierError.includes("Session expired") || fetchSupplierError.includes("jwt expired") || fetchSupplierError.includes("jwt malformed")){
//             return(<div><SessionExpired /></div>)
//         }
//         return (<div>Error: {fetchSupplierError}</div>);
//     }

//     return ( 
//         localUser && Object.keys(localUser).length > 0 ? (
//         <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className='p-4 pt-1' onSubmit={handleUpdatePayment}>
//             <h1 className='text-2xl font-medium m-1 mt-0'>UPDATE PAYMENT</h1>
//             {/* PAYMENT DETAILS */}
//             <div className="grid grid-cols-3 gap-4 p-4 border-2 rounded-xl shadow-sm bg-gray-50">
//                 <div className='w-full'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Reference:</label>
//                     <input 
//                         type="text"
//                         required
//                         name="payment_ref"
//                         value={paymentState.payment_ref}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     />
//                 </div>
//                 <div className='w-full'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">* Supplier:</label>
//                     <select
//                         name="supplier"
//                         disabled
//                         required
//                         value={paymentState.supplier}
//                         onChange={handleChange}
//                         className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     >
//                         <option value="">Select supplier</option>
//                         {supplierState.map((supplier,index) => (
//                             <option key={index} value={supplier._id}>{supplier.supplier_name}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className='w-full'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Method:</label>
//                     <select
//                         name="payment_method"
//                         required
//                         value={paymentState.payment_method}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     >
//                         <option value="">Select method</option>
//                         {paymentMethod.map((method,index) => (
//                             <option key={index} value={method}>{method}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className='w-full'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Type:</label>
//                     <select 
//                         name="payment_type"
//                         required
//                         value={paymentState.payment_type}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     >
//                         <option value="">Select type</option>
//                         {paymentType.map((type,index) => (
//                             <option key={index} value={type}>{type}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className='w-full'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">* Total Statement Amount (incl. GST):</label>
//                     <input 
//                         type="number"
//                         required
//                         name="payment_raw_total_amount_incl_gst"
//                         value={paymentState.payment_raw_total_amount_incl_gst}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     />
//                 </div>
//             </div>

//             {/* INVOICES + ORDERS */}
//             <div className='mt-2 p-4 border-2 rounded-xl shadow-sm bg-gray-50'>
//                 <h2 className='text-lg font-medium text-gray-700 mb-2'>INVOICES</h2>
//                 {/* START DATE - END DATE */}
//                 <div className="grid grid-cols-2 gap-4">
//                     <div className='w-full'>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Select start date:</label>
//                         <input 
//                             type="date"
//                             name="period_start_date"
//                             value={paymentState.period_start_date.split("T")[0]}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         />
//                     </div>
//                     <div className='w-full'>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Select end date:</label>
//                         <input 
//                             type="date"
//                             name="period_end_date"
//                             value={paymentState.period_end_date.split("T")[0]}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         />
//                     </div>
//                 </div>
//                 {/* ***** INVOICES TABLE ****** */}
//                 <div className="bg-white border rounded-lg shadow-md mt-6 overflow-hidden">
//                     <div className="overflow-x-auto flex">
//                         <table className="w-full text-sm text-left">
//                         <thead className="text-xs uppercase bg-indigo-300">
//                             <tr>
//                             <th scope="col" className="hidden lg:table-cell px-6 py-3 font-semibold text-gray-900">Invoice Ref.</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Issue Date</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Invoice Status</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900 border-l-2 border-indigo-200">Order No.</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Supplier</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Project</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Order Status</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900 border-l-2 border-indigo-200">Gross Amount</th>
//                             <th scope="col" className="px-6 py-3 font-semibold text-gray-900"></th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {/* Target Invoices */}
//                             {targetInvoices && targetInvoices.map((invoice, ivcIndex) => (
//                             <tr key={ivcIndex} className="border-b hover:bg-gray-50">
//                                 <td className="hidden lg:table-cell px-6 py-4 font-medium text-gray-900 hover:cursor-pointer hover:text-blue-500 hover:underline" onClick={() => window.open(`/EmpirePMS/invoice/${invoice._id}`, '_blank')}>{invoice.invoice_ref}</td>
//                                 <td className="px-6 py-4">{formatDate(invoice.invoice_issue_date)}</td>
//                                 <td className="px-6 py-4">
//                                     <span
//                                     className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                         invoice.invoice_status === 'Paid' 
//                                         ? 'bg-green-100 text-green-800' 
//                                         : invoice.invoice_status === 'Pending' 
//                                         ? 'bg-yellow-100 text-yellow-800' 
//                                         : invoice.invoice_status === 'In Review' 
//                                         ? 'bg-blue-100 text-blue-800' 
//                                         : invoice.invoice_status === 'Statement Checked' 
//                                         ? 'bg-purple-100 text-purple-800' 
//                                         : invoice.invoice_status === 'Fully Settled' 
//                                         ? 'bg-teal-100 text-teal-800' 
//                                         : invoice.invoice_status === 'Partially Settled' 
//                                         ? 'bg-orange-100 text-orange-800' 
//                                         : 'bg-red-100 text-red-800' // Default case
//                                     }`}
//                                     >
//                                     {invoice.invoice_status}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 border-l-2 border-slate-50 font-medium text-gray-900 hover:cursor-pointer hover:text-blue-500 hover:underline" onClick={() => window.open(`/EmpirePMS/order/${invoice.order._id}`, '_blank')}>{invoice.order.order_ref}</td>                         
//                                 <td className="px-6 py-4">{supplierState.find((supplier) => supplier._id === invoice.order.supplier).supplier_name}</td>                         
//                                 <td className="px-6 py-4">{projectState.find((project) => project._id === invoice.order.project).project_name}</td>                         
//                                 <td className="px-6 py-4">
//                                     <span
//                                     className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                         invoice.order.order_status === 'Approved' 
//                                         ? 'bg-green-100 text-green-800' 
//                                         : invoice.order.order_status === 'Pending' 
//                                         ? 'bg-yellow-100 text-yellow-800' 
//                                         : invoice.order.order_status === 'In Review' 
//                                         ? 'bg-blue-100 text-blue-800' 
//                                         : invoice.order.order_status === 'Cancelled' 
//                                         ? 'bg-gray-100 text-gray-800' 
//                                         : invoice.order.order_status === 'Rejected' 
//                                         ? 'bg-orange-100 text-orange-800' 
//                                         : 'bg-red-100 text-red-800' // Default case
//                                     }`}
//                                     >
//                                     {invoice.order.order_status}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 border-l-2 border-slate-50">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(Math.floor(invoice.invoiced_raw_total_amount_incl_gst * 100) / 100)}</td>                 
//                                 <td className="px-6 py-4">
//                                     <button
//                                         type="button"
//                                         className="text-red-600 hover:text-red-900 focus:outline-none"
//                                         onClick={() => handleRemoveInvoice(ivcIndex)}
//                                     >
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
//                                         </svg>
//                                     </button>
//                                 </td>
//                             </tr>
//                             ))}
//                             {/* Amount Calculation */}
//                             <tr className="border-b bg-gray-50">
//                                 <td colSpan={6} className="px-6 py-3"></td>
//                                 <td className="px-6 py-3 font-bold text-right">Total Amount:</td>
//                                 <td className="px-6 py-3 font-bold">
//                                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(Math.floor((targetInvoices.reduce((totalSum, invoice) => {
//                                         return totalSum + invoice?.invoiced_raw_total_amount_incl_gst
//                                     }, 0)) * 100) / 100)}
//                                 </td>                                
//                                 <td className="px-6 py-3 font-bold"></td>
//                             </tr>
//                             <tr className="border-b bg-gray-50">
//                                 <td colSpan={6} className="px-6 py-3"></td>
//                                 <td className="px-6 py-3 font-bold text-right">Total Due:</td>
//                                 <td className={`px-6 py-3 font-bold ${totalBalance === 0 ? 'text-black' : 'text-red-500'}`}>
//                                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(totalBalance)}
//                                     {totalBalance === 0 && 
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-5 text-green-500 inline-block ml-2`}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
//                                     </svg>}
//                                 </td>
//                                 <td className="px-6 py-3 font-bold"></td>
//                             </tr>
//                             {/* Manually Add Invoice */}
//                             <tr className="border-b bg-gray-600">
//                                 <td colSpan={9} className="px-6 py-4">
//                                     <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-12 justify-center">
//                                         <select
//                                             name="invoice"
//                                             value={selectedInvoice._id}
//                                             onChange={(e) => handleInvoiceChange(e)}
//                                             className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                                         >
//                                             <option value="">Add other invoice</option>
//                                             {invoiceState &&
//                                             invoiceState
//                                                 .filter(
//                                                 (invc) =>
//                                                     invc.supplier._id === paymentState.supplier &&
//                                                     (invc.invoice_issue_date.split('T')[0] < paymentState.period_start_date ||
//                                                     invc.invoice_issue_date.split('T')[0] > paymentState.period_end_date) &&
//                                                     (invc.invoice_isarchived === false) &&
//                                                     (invc.invoice_status !== 'Settled') &&
//                                                     (invc.invoice_status !== 'Cancelled')
//                                                 )
//                                                 .map((ivc, ivcIndex) => (
//                                                 <option key={ivcIndex} value={ivc._id}>
//                                                     {ivc.invoice_ref}
//                                                 </option>
//                                                 ))}
//                                         </select>
//                                         <div className="flex items-center space-x-12" hidden={selectedInvoice._id === ""}>
//                                             <span className="text-sm text-white">{formatDate(selectedInvoice?.invoice_issue_date)}</span>
//                                             <span className="text-sm text-white">{selectedInvoice?.invoice_status}</span>
//                                             <span className="text-sm text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(Math.floor(selectedInvoice?.invoiced_raw_total_amount_incl_gst * 100) / 100)}</span>                                        
//                                         </div>
//                                         <button
//                                             hidden={selectedInvoice._id === ""}
//                                             type='button'
//                                             onClick={handleAddInvoice}
//                                             className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                                             </svg>
//                                             Add Invoice
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

            
//             {/* PAYMENT COMMENT and PAYMENT TOTAL */}
//             <div className='mt-2 p-4 border-2 rounded-xl shadow-sm bg-gray-50'>
//                 {/* PAYMENT DATE and PAYMENT AMOUNT */}
//                     {paymentState.payment_term.map((term, index) => (
//                     <div key={index} className='flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-white rounded-lg shadow'>
//                         <div className='w-full sm:w-1/2'>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Date:</label>
//                         <input 
//                             type="date"
//                             required
//                             value={term.payment_datetime.split("T")[0]}
//                             onChange={(e) => handlePaymentTerm(index, 'payment_datetime', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         />
//                         </div>
//                         <div className='w-full sm:w-1/2'>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Total Amount (incl. GST):</label>
//                         <input 
//                             type="number"
//                             required
//                             value={term.payment_amount_paid}
//                             onChange={(e) => handlePaymentTerm(index, 'payment_amount_paid', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         />
//                         </div>
//                         <div className="items-center mb-2">
//                             <h3 className="text-xs mb-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center text-nowrap font-semibold">Term {index + 1}</h3>
//                             {paymentState.payment_term.length > 1 && (
//                                 <button 
//                                 type="button"
//                                 onClick={() => removePaymentTerm(index)}
//                                 hidden={index === 0}
//                                 className="px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
//                                 >
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
//                                 </svg>
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                     ))}
//                     <button 
//                     type="button"
//                     onClick={addPaymentTerm}
//                     className="mb-4 px-4 py-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center"
//                     >
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                     </svg>
//                     Add Payment Term
//                     </button>

//                 {/* PAYMENT COMMENT */}
//                     <div className='w-full mb-4'>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Payment internal comments:</label>
//                     <textarea
//                         rows={2}
//                         name="payment_internal_comments"
//                         value={paymentState.payment_internal_comments}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     />
//                     </div>

//                     {/* Cancel and Submit button */}
//                     <div className='mt-2 grid grid-cols-3 gap-72'>
//                     <button
//                         type="button"
//                         className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
//                         onClick={() => navigate(-1)}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         className="w-full flex justify-center items-center py-2 px-4 border border-gray-500 rounded-md shadow-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
//                         onClick={() => setPaymentState((prevState) => ({
//                             ...prevState,
//                             payment_status: "In Review"
//                         }))}
//                     >
//                         In Review
//                     </button>
//                     <button
//                         type="submit"
//                         className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
//                     >
//                         Update
//                     </button>
//                     </div>
//                 </div>
//         </form>
//      ) : ( <UnauthenticatedSkeleton /> ));
// }
 
// export default UpdatePaymentForm;