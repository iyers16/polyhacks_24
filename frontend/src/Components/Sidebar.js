import React, { useState } from 'react';
import './Sidebar.css'; // Ensure this points to the correct CSS file

const placeTypes = [
  'atm', 'bank', 'bar',
  'book_store', 'bus_station', 'cafe',
  'clothing_store', 'convenience_store', 'drugstore',
  'gym', 'hospital', 'laundry',
  'library', 'lodging', 'park',
  'pharmacy', 'police', 'post_office',
  'primary_school', 'restaurant', 'school',
  'secondary_school', 'shopping_mall', 'stadium',
  'store', 'subway_station', 'supermarket',
  'train_station', 'transit_station', 'university'
];

const backendToFrontendMapping = {
  'atm': 'Finance',
  'bank': 'Finance',
  'bar': 'Dining',
  'book_store': 'Other Services',
  'bus_station': 'Transportation',
  'cafe': 'Dining',
  'clothing_store': 'Stores',
  'convenience_store': 'Stores',
  'drugstore': 'Healthcare',
  'gym': 'Other Services',
  'hospital': 'Healthcare',
  'laundry': 'Other Services',
  'library': 'Other Services',
  'lodging': 'Other Services',
  'park': 'Open Air Spaces',
  'pharmacy': 'Healthcare',
  'police': 'Other Services',
  'post_office': 'Other Services',
  'primary_school': 'Education',
  'restaurant': 'Dining',
  'school': 'Education',
  'secondary_school': 'Education',
  'shopping_mall': 'Stores',
  'stadium': 'Other Services',
  'store': 'Stores',
  'subway_station': 'Transportation',
  'supermarket': 'Stores',
  'train_station': 'Transportation',
  'transit_station': 'Transportation',
  'university': 'Education'
};

// Function to map backend place types to frontend categories
const mapBackendTypesToFrontendCategories = (backendTypes) => {
  const categories = {
    'Healthcare': [],
    'Education': [],
    'Stores': [],
    'Finance': [],
    'Dining': [],
    'Transportation': [],
    'Open Air Spaces': [],
    'Other Services': []
  };

  backendTypes.forEach(type => {
    const category = backendToFrontendMapping[type];
    if (category) {
      categories[category].push(type.replace('_', ' '));
    }
  });

  return categories;
};

// Usage
const categories = mapBackendTypesToFrontendCategories(placeTypes);

const Sidebar = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [openCategories, setOpenCategories] = useState({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to control sidebar visibility

  const handleSidebarToggle = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleFilter = (category, filter) => {
    const filtersForCategory = selectedFilters[category] || [];
    if (filtersForCategory.includes(filter)) {
      setSelectedFilters({
        ...selectedFilters,
        [category]: filtersForCategory.filter(f => f !== filter),
      });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [category]: [...filtersForCategory, filter],
      });
    }
  };

  const toggleCategory = (category) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
   
  
  };

  return (
    <>
      <button onClick={handleSidebarToggle} className="sidebar-toggle">
        {isSidebarVisible ? 'Hide' : 'Show Filters'}
      </button>
      {isSidebarVisible && (
        <aside className="sidebar">
          <h2>Filters</h2>
          {Object.entries(categories).map(([category, filters]) => (
            <div key={category} className="category">
              <button className="dropdown" onClick={() => toggleCategory(category)}>
                {category}
              </button>
              <div className={`dropdown-content ${openCategories[category] ? 'show filters' : ''}`}>
                {filters.map(filter => (
                  <div key={filter} className="filter-option">
                    <input
                      type="checkbox"
                      id={`${category}-${filter}`}
                      name={filter}
                      checked={selectedFilters[category]?.includes(filter) || false}
                      onChange={() => toggleFilter(category, filter)}
                    />
                    <label htmlFor={`${category}-${filter}`}>{filter}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>
      )}
    </>
  );
};

export default Sidebar;
