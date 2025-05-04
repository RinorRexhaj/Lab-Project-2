import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { UserFilter } from '../../types/User';

interface UserFiltersProps {
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
  onResetFilters: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
}) => {
  const roleOptions = ['', 'User', 'Admin', 'Driver', 'Vendor'];
  const statusOptions = ['', 'active', 'suspended'];

  // Check if any filters are active
  const hasActiveFilters = filter.search || filter.role || filter.status;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Search by name or email"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Role filter */}
        <div className="w-full md:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              value={filter.role}
              onChange={(e) => onFilterChange({ role: e.target.value })}
              title="Filter by role"
              aria-label="Filter users by role"
            >
              <option value="">All Roles</option>
              {roleOptions.slice(1).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              value={filter.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              title="Filter by status"
              aria-label="Filter users by status"
            >
              <option value="">All Statuses</option>
              {statusOptions.slice(1).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters button - only show if filters are active */}
        {hasActiveFilters && (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            onClick={onResetFilters}
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default UserFilters;
