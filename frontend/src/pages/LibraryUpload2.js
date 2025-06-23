"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, X, Plus, Save, ArrowLeft } from "lucide-react"

export default function LibraryUpload({ onBack, onUpload }) {
  const [formData, setFormData] = useState({
    title: "",
    supplier: "",
    type: "", // Changed from 'category' to match your model
    description: "",
    tags: [],
    featured: false,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState({})
  const [productTypes, setProductTypes] = useState([]) // For fetching available types
  const [isLoading, setIsLoading] = useState(false)

  // Fetch product types when component mounts
  useEffect(() => {
    fetchProductTypes()
  }, [])

  const fetchProductTypes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProductTypes(data.productTypes || data || [])
      }
    } catch (error) {
      console.error('Error fetching product types:', error)
      // Fallback to hardcoded categories if API fails
      setProductTypes([
        { _id: '1', type_name: 'Structural' },
        { _id: '2', type_name: 'Electrical' },
        { _id: '3', type_name: 'HVAC' },
        { _id: '4', type_name: 'Safety' },
        { _id: '5', type_name: 'Plumbing' },
        { _id: '6', type_name: 'Materials' }
      ])
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileSelect = (file) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setErrors((prev) => ({ ...prev, file: "" }))
    } else {
      setErrors((prev) => ({ ...prev, file: "Please select a valid PDF file" }))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required"
    if (!formData.type) newErrors.type = "Type is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!selectedFile) newErrors.file = "PDF file is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const postLibraryWithFile = async () => {
    try {
      setIsLoading(true)
      const formDataToSend = new FormData()

      // Append text fields
      formDataToSend.append("title", formData.title)
      formDataToSend.append("supplier", formData.supplier)
      formDataToSend.append("type", formData.type) // This should be an ObjectId string
      formDataToSend.append("description", formData.description)
      formDataToSend.append("featured", formData.featured.toString())

      // Append tags - your controller expects tags as an array
      if (formData.tags && Array.isArray(formData.tags)) {
        formData.tags.forEach(tag => formDataToSend.append("tags", tag))
      }

      // Append the file - your controller expects req.file array, so use 'file' as field name
      formDataToSend.append("file", selectedFile)

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/library/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`,
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formDataToSend
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload library item")
      }

      // Reset form on success
      setFormData({
        title: "",
        supplier: "",
        type: "",
        description: "",
        tags: [],
        featured: false,
      })
      setSelectedFile(null)

      // Call the onUpload callback if provided
      if (onUpload) {
        onUpload(data.file) // Pass the uploaded file data
      }

      alert("Resource uploaded successfully!")
      
    } catch (error) {
      console.error("Upload error:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    await postLibraryWithFile()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Library
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Resource</h1>
              <p className="text-gray-600 mt-1">Add a new PDF resource to the library</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload PDF File</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : selectedFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="ml-4 p-1 text-red-500 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop your PDF file here, or click to browse</p>
                  <p className="text-gray-500">Maximum file size: 50MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`mt-4 inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
                      isLoading 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file}</p>}
          </div>

          {/* Resource Details Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., Steel Beam Installation Guide"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Supplier */}
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.supplier ? "border-red-500" : "border-gray-300"
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., MetalWorks Pro"
                />
                {errors.supplier && <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>}
              </div>

              {/* Type (changed from Category) */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a product type</option>
                  {productTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Provide a detailed description of the resource..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    disabled={isLoading}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isLoading 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as featured resource</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Featured resources will be highlighted on the library homepage
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}