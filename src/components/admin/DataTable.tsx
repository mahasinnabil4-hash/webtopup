'use client'

import { cn } from '@/lib/utils/helpers'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: string
  emptyMessage?: string
  rowLink?: (row: T) => string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  emptyMessage = 'Tidak ada data',
  rowLink,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (key: string) => {
    const column = columns.find((c) => c.key === key)
    if (!column?.sortable) return

    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:text-purple-400 select-none',
                  column.className
                )}
                onClick={() => handleSort(column.key)}
                aria-sort={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortConfig?.key === column.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {sortedData.map((row) => (
            <tr
              key={row[keyField]}
              className={cn(
                'transition-colors',
                rowLink && 'cursor-pointer hover:bg-slate-800/50'
              )}
              onClick={rowLink ? () => window.location.href = rowLink(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3 text-sm text-slate-300', column.className)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}