import { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, Search } from 'lucide-react';
import { records } from '../../data/mockData';
import type { RecordItem } from '../../types';
export function RecordsTable({
  query,
  onQueryChange,
  active,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  active: string;
}) {
  const columns = useMemo<ColumnDef<RecordItem>[]>(
    () => [
      { accessorKey: 'id', header: 'Order' },
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <strong>{row.original.name}</strong>
            <small>{row.original.detail}</small>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <span className={`status ${String(getValue()).toLowerCase()}`}>
            {String(getValue())}
          </span>
        ),
      },
      { accessorKey: 'value', header: 'Amount' },
      { accessorKey: 'date', header: 'Date' },
    ],
    []
  );
  const table = useReactTable({
    data: records,
    columns,
    state: { globalFilter: query },
    onGlobalFilterChange: onQueryChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <h2>{active} records</h2>
          <p>Manage and review your latest {active.toLowerCase()} activity.</p>
        </div>
        <div className="table-tools">
          <label className="search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search records..."
            />
          </label>
          <button className="filter">
            Filter <ChevronDown size={15} />
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
