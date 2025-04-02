"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

export function AreaSelection({ areaObjRef, productIndex, currentLocation, onLocationChange, isCustom }) {
  const [open, setOpen] = useState(false)
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedSubarea, setSelectedSubarea] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Initialize areas from the provided data
  useEffect(() => {
    if (areaObjRef && areaObjRef.length > 0) {
      const extractedAreas = areaObjRef.map((item) => ({
        ...item.areas,
        area_id: item._id
      }))
      setAreas(extractedAreas)
    }
  }, [areaObjRef])

  // Create a flat list of all searchable items
  const searchItems = useMemo(() => {
    const items = []

    areas.forEach((area) => {
      // Add area
      items.push({
        id: `area-${area.area_id}`,
        name: area.area_name,
        type: "area",
        parentPath: "",
        areaId: area.area_id,
      })

      // Add levels
      area.levels.forEach((level) => {
        items.push({
          id: `level-${level._id}`,
          name: level.level_name,
          type: "level",
          parentPath: area.area_name,
          areaId: area.area_id,
          levelId: level._id,
        })

        // Add subareas
        level.subareas.forEach((subarea) => {
          items.push({
            id: `subarea-${subarea._id}`,
            name: subarea.subarea_name,
            type: "subarea",
            parentPath: `${area.area_name} > ${level.level_name}`,
            areaId: area.area_id,
            levelId: level._id,
            subareaId: subarea._id,
          })
        })
      })
    })

    return items
  }, [areas])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return searchItems

    return searchItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentPath.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchItems, searchQuery])

  // Group filtered items by type
  const groupedItems = useMemo(() => {
    return {
      areas: filteredItems.filter((item) => item.type === "area"),
      levels: filteredItems.filter((item) => item.type === "level"),
      subareas: filteredItems.filter((item) => item.type === "subarea"),
    }
  }, [filteredItems])

  // Handle selection of an item
  const handleSelect = (item) => {
    const area = areas.find((a) => a.area_id === item.areaId) || null

    let level = null
    let subarea = null
    let locationString = ""
    let locationID = ""

    if (area) {
      locationString = area.area_name
      locationID = area.area_id

      if (item.levelId) {
        level = area.levels.find((l) => l._id === item.levelId) || null

        if (level) {
          locationString += ` > ${level.level_name}`
          locationID = level._id

          if (item.subareaId) {
            subarea = level.subareas.find((s) => s._id === item.subareaId) || null
            if (subarea) {
              locationString += ` > ${subarea.subarea_name}`
              locationID = subarea._id
            }
          }
        }
      }
    }

    setSelectedArea(area)
    setSelectedLevel(level)
    setSelectedSubarea(subarea)

    // Update the parent component with the new location string
    if (onLocationChange) {
      onLocationChange(locationString, productIndex, locationID, isCustom);      
    }
    

    setOpen(false)
    setSearchQuery("")
  }

  // Get display text for the current selection or use current location
  const getSelectionDisplayText = () => {
    if (currentLocation) {
      return currentLocation
    } else if (selectedSubarea) {
      return `${selectedArea?.area_name} > ${selectedLevel?.level_name} > ${selectedSubarea.subarea_name}`
    } else if (selectedLevel) {
      return `${selectedArea?.area_name} > ${selectedLevel.level_name}`
    } else if (selectedArea) {
      return selectedArea.area_name
    } else {
      return "Select location"
    }
  }

  return (
    <div className="w-40 relative inline-block align-middle ml-1" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2 py-0.5 text-xs border rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
      >
        <span className="truncate max-w-[120px]">{getSelectionDisplayText()}</span>
        <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-40 mt-1 w-64 rounded-md bg-white shadow-lg border">
          {/* Search Input */}
          <div className="relative border-b">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-7 pr-2 text-xs focus:outline-none"
            />
          </div>

          {/* Dropdown Content */}
          <div className="max-h-48 overflow-y-auto overflow-x-hidden thin-scrollbar py-1">
            {/* No Results */}
            {Object.values(groupedItems).every((group) => group.length === 0) && (
              <div className="px-3 py-1 text-xs text-gray-500">No location found.</div>
            )}

            {/* Areas Group */}
            {groupedItems.areas.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Areas</div>
                {groupedItems.areas.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center px-2 py-1 text-xs hover:bg-gray-100"
                  >
                    {/* <Check
                      className={`mr-1 h-3 w-3 ${selectedArea?.area_id === item.areaId ? "opacity-100" : "opacity-0"}`}
                    /> */}
                    {item.name}
                  </button>
                ))}
              </div>
            )}

            {/* Levels Group */}
            {groupedItems.levels.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Levels</div>
                {groupedItems.levels.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center px-2 py-1 text-xs hover:bg-gray-100"
                  >
                    {/* <Check
                      className={`mr-1 h-3 w-3 ${
                        selectedLevel?._id === item.levelId && selectedArea?.area_id === item.areaId
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    /> */}
                    <span className="text-gray-500 mr-1">{item.parentPath} &gt;</span>
                    {item.name}
                  </button>
                ))}
              </div>
            )}

            {/* Subareas Group */}
            {groupedItems.subareas.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subareas</div>
                {groupedItems.subareas.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center px-2 py-1 text-xs hover:bg-gray-100"
                  >
                    {/* <Check
                      className={`mr-1 h-3 w-3 ${
                        selectedSubarea?._id === item.subareaId &&
                        selectedLevel?._id === item.levelId &&
                        selectedArea?.area_id === item.areaId
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    /> */}
                    <span className="text-gray-500 mr-1">{item.parentPath} &gt;</span>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

