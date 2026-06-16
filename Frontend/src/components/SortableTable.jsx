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
        <span style={{ marginLeft: '0.4rem', opacity: 0.3, fontSize: '0.75rem' }}>
          ↕
        </span>
      );
    }
    return (
      <span style={{ marginLeft: '0.4rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
        {sortOrder === 'ASC' ? '↑' : '↓'}
      </span>
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
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
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
