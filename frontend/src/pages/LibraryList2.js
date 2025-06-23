"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Download, Building2, FileText, Shield, Wrench, Zap, Droplets, Plus, Loader } from "lucide-react"

const getIconForCategory = (categoryName) => {
  if (!categoryName) return FileText
  
  switch (categoryName.toLowerCase()) {
    case "structural":
      return Building2
    case "electrical":
      return Zap
    case "hvac":
      return Wrench
    case "safety":
      return Shield
    case "plumbing":
      return Droplets
    default:
      return FileText
  }
}

export default function LibraryList({ onUploadClick }) {
  const [resources, setResources] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("title")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch resources and product types on component mount
  useEffect(() => {
    fetchResources()
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
        setProductTypes(data)
      }
    } catch (error) {
      console.error('Error fetching product types:', error)
      // Fallback to default categories
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

  const fetchResources = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/library`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }

      const data = await response.json()
      
      // Transform the API data to match component expectations
      const transformedResources = (data.files || []).map(file => ({
        id: file.id,
        title: file.title,
        supplier: file.supplier,
        category: file.type?.name || 'Unknown',
        categoryId: file.type?.id,
        description: file.description,
        tags: file.tags || [],
        featured: file.featured || false,
        fileName: file.fileName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: 'Unknown', // API doesn't provide file size in list
        pages: 'Unknown', // API doesn't provide page count
        uploadDate: file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown',
        icon: getIconForCategory(file.type?.name),
        downloadUrl: `${process.env.REACT_APP_API_BASE_URL}/library/${file.id}`
      }))

      setResources(transformedResources)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Create categories array from product types
  const categories = useMemo(() => {
    const typeNames = productTypes.map(type => type.type_name)
    return ['All', ...typeNames]
  }, [productTypes])

  const filteredAndSortedResources = useMemo(() => {
    const filtered = resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "supplier":
          return a.supplier.localeCompare(b.supplier)
        case "category":
          return a.category.localeCompare(b.category)
        case "date":
          return new Date(b.uploadDate) - new Date(a.uploadDate)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy, resources])

  const handleDownload = async (resource) => {
    try {
      const response = await fetch(resource.downloadUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
        }
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = resource.originalName || resource.fileName || `${resource.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const addResource = (newResource) => {
    // Refresh the resources list after upload
    fetchResources()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading resources</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResources}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
              <p className="text-gray-600 mt-1">Browse and download construction supplier resources</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{filteredAndSortedResources.length} resources available</span>
              </div>
              <button
                onClick={() => onUploadClick && onUploadClick(addResource)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Upload Resource
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search resources, suppliers, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Sort by Title</option>
                <option value="supplier">Sort by Supplier</option>
                <option value="category">Sort by Category</option>
                <option value="date">Sort by Upload Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === "All" && searchTerm === "" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Resources</h2>
            {resources.filter((r) => r.featured).length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">No featured resources yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter((r) => r.featured)
                  .map((resource) => {
                    const IconComponent = resource.icon
                    return (
                      <div key={resource.id} className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-orange-600" />
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Featured</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                        <p className="text-orange-700 text-sm mb-3">{resource.supplier}</p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span>{resource.uploadDate}</span>
                          <span className="bg-white border border-orange-200 text-orange-800 px-2 py-1 rounded">
                            {resource.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* All Resources */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedCategory === "All" ? "All Resources" : `${selectedCategory} Resources`}
          </h2>

          {filteredAndSortedResources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                {resources.length === 0 
                  ? "No resources have been uploaded yet" 
                  : "Try adjusting your search terms or filters"
                }
              </p>
              {resources.length === 0 && (
                <button
                  onClick={() => onUploadClick && onUploadClick(addResource)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Upload First Resource
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedResources.map((resource) => {
                const IconComponent = resource.icon
                return (
                  <div key={resource.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <span className="border border-gray-300 text-gray-700 text-xs px-2 py-1 rounded">
                        {resource.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{resource.supplier}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{resource.uploadDate}</span>
                      <span>{resource.mimeType}</span>
                    </div>
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 2 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            +{resource.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownload(resource)}
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}