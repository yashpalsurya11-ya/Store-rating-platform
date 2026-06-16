import React from 'react';

const SortableTable = ({ columns, data, sortBy, sortOrder, onSort, renderRow }) => {
  
  const handleSortClick = (key, sortable) => {
    if (!sortable || !onSort) return;
    
    let newOrder = 'ASC';
    if (sortBy === key) {
      newOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    }
    
    onSort(key, newOrder);
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) {
      return (
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          style={{ marginLeft: '0.4rem', opacity: 0.35 }}
        >
          <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
        </svg>
      );
    }
    return sortOrder === 'ASC' ? (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="var(--accent-primary)" 
        strokeWidth="3" 
        style={{ marginLeft: '0.4rem' }}
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    ) : (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="var(--accent-primary)" 
        strokeWidth="3" 
        style={{ marginLeft: '0.4rem' }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? "sortable" : ""}
                onClick={() => handleSortClick(col.key, col.sortable)}
                style={{ width: col.width }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {col.label}
                  {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, idx) => renderRow(item, idx))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
