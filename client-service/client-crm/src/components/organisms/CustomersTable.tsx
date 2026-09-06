import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import type { Customer } from '../../generated/api';
import { useCustomers } from '../../hooks/useCustomer';

export function CustomersTable() {
  const [query, setQuery] = useState('');
  const { data = [], isLoading, isError } = useCustomers();
  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Customer' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'city', header: 'City' },
  ], []);
  const table = useReactTable({ data, columns, state: { globalFilter: query }, onGlobalFilterChange: setQuery, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });
  return <section className="panel table-panel">
    <div className="panel-heading"><div><h2>Customers</h2><p>Manage your customer directory.</p></div><label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers..." /></label></div>
    <div className="table-wrap"><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>
      {isLoading && <tr><td colSpan={columns.length}>Loading customers...</td></tr>}
      {isError && <tr><td colSpan={columns.length}>Unable to load customers.</td></tr>}
      {!isLoading && !isError && table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}
    </tbody></table></div>
  </section>;
}
