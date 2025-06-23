"use client"

import { useState, useMemo } from "react"
import { Search, Download, Building2, FileText, Shield, Wrench, Zap, Droplets, Plus } from "lucide-react"

const initialResources = [
  {
    id: 1,
    title: "Steel Beam Installation Guide",
    supplier: "MetalWorks Pro",
    category: "Structural",
    description: "Comprehensive guide for proper steel beam installation and safety protocols.",
    fileSize: "2.4 MB",
    pages: 24,
    downloadUrl: "/placeholder.pdf",
    tags: ["steel", "installation", "safety"],
    icon: Building2,
    featured: true,
  },
  {
    id: 2,
    title: "Electrical Code Compliance Manual",
    supplier: "ElectroSupply Inc",
    category: "Electrical",
    description: "Updated electrical code requirements and compliance guidelines for 2024.",
    fileSize: "3.1 MB",
    pages: 45,
    downloadUrl: "/placeholder.pdf",
    tags: ["electrical", "code", "compliance"],
    icon: Zap,
    featured: false,
  },
  {
    id: 3,
    title: "HVAC System Specifications",
    supplier: "Climate Control Solutions",
    category: "HVAC",
    description: "Technical specifications and installation requirements for commercial HVAC systems.",
    fileSize: "1.8 MB",
    pages: 32,
    downloadUrl: "/placeholder.pdf",
    tags: ["hvac", "specifications", "commercial"],
    icon: Wrench,
    featured: true,
  },
  {
    id: 4,
    title: "Safety Equipment Catalog",
    supplier: "SafetyFirst Equipment",
    category: "Safety",
    description: "Complete catalog of personal protective equipment and safety gear.",
    fileSize: "4.2 MB",
    pages: 68,
    downloadUrl: "/placeholder.pdf",
    tags: ["safety", "ppe", "equipment"],
    icon: Shield,
    featured: false,
  },
  {
    id: 5,
    title: "Plumbing Fixture Installation",
    supplier: "AquaFlow Systems",
    category: "Plumbing",
    description: "Step-by-step installation guide for commercial plumbing fixtures.",
    fileSize: "2.7 MB",
    pages: 38,
    downloadUrl: "/placeholder.pdf",
    tags: ["plumbing", "fixtures", "installation"],
    icon: Droplets,
    featured: false,
  },
]

const categories = ["All", "Structural", "Electrical", "HVAC", "Safety", "Plumbing", "Materials"] // Use Product Type

const getIconForCategory = (category) => {
  switch (category) {
    case "Structural":
      return Building2
    case "Electrical":
      return Zap
    case "HVAC":
      return Wrench
    case "Safety":
      return Shield
    case "Plumbing":
      return Droplets
    default:
      return FileText
  }
}

export default function LibraryList({ onUploadClick }) {
  const [resources, setResources] = useState(initialResources)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("title")

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
        case "size":
          return Number.parseFloat(a.fileSize) - Number.parseFloat(b.fileSize)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy, resources])

  const handleDownload = (resource) => {
    console.log(`Downloading: ${resource.title}`)
    // Simulate download
    const link = document.createElement("a")
    link.href = resource.downloadUrl
    link.download = `${resource.title}.pdf`
    link.click()
  }

  const addResource = (newResource) => {
    const resourceWithIcon = {
      ...newResource,
      icon: getIconForCategory(newResource.category),
      downloadUrl: URL.createObjectURL(newResource.file),
    }
    setResources((prev) => [...prev, resourceWithIcon])
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
                <option value="size">Sort by File Size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === "All" && searchTerm === "" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Resources</h2>
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
                      <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span>{resource.fileSize}</span>
                        <span>{resource.pages} pages</span>
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
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
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
                      <span>{resource.fileSize}</span>
                      <span>{resource.pages} pages</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
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
