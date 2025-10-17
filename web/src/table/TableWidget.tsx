import { format } from "date-fns"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface TransactionData {
  // Sale transaction fields
  project_name?: string
  total_worth?: string | number
  sqft_price?: string | number
  cat?: string
  is_first?: string
  
  // Rental transaction fields
  path_name?: string
  total_price?: string | number
  category?: string
  start_date?: string
  end_date?: string
}

interface TableWidgetProps {
  data: TransactionData[]
  transactionType: "sale" | "rent" | null
  isLoading?: boolean
}

export function TableWidget({ data, transactionType, isLoading = false }: TableWidgetProps) {
  // Helper function to format price in AED
  const formatPrice = (price: string | number | undefined): string => {
    if (!price || price === 'N/A') return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return 'N/A'
    return `AED ${numPrice.toLocaleString()}`
  }

  // Helper function to format sold by status
  const formatSoldBy = (isFirst: string | undefined): string => {
    if (!isFirst || isFirst === 'N/A') return 'N/A'
    return isFirst.toUpperCase() === 'Y' ? 'Developer' : 'Individual'
  }

  // Helper function to format rental price
  const formatRentalPrice = (price: string | number | undefined): string => {
    if (!price || price === 'N/A') return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return 'N/A'
    return `AED ${numPrice.toLocaleString()}`
  }

  // Helper function to format duration for rental
  const formatDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate || startDate === 'N/A' || endDate === 'N/A') {
      return 'N/A'
    }

    try {
      // Parse DD-MM-YYYY format
      const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split('-')
        if (parts.length !== 3) throw new Error('Invalid date format')
        
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // Month is 0-indexed
        const year = parseInt(parts[2])
        
        return new Date(year, month, day)
      }

      const start = parseDate(startDate)
      const end = parseDate(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'N/A'
      }

      // Format as DD-MM(short)-YYYY
      const formatDisplayDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0')
        const month = format(date, 'MMM') // Short month name
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }

      const formattedStart = formatDisplayDate(start)
      const formattedEnd = formatDisplayDate(end)
      
      return `${formattedStart} - ${formattedEnd}`
    } catch (error) {
      console.log('Error formatting duration:', error, { startDate, endDate })
      return 'N/A'
    }
  }

  // Helper function to export data to CSV
  const exportToCSV = () => {
    if (!data.length || !transactionType) return

    let csvContent = ''
    let headers = []
    let rows = []

    if (transactionType === 'sale') {
      headers = ['Location', 'Price', 'Price/SQFT', 'Type', 'Sold By']
      rows = data.map(item => [
        item.project_name || 'N/A',
        formatPrice(item.total_worth).replace('AED ', ''), // Remove AED prefix for CSV
        formatPrice(item.sqft_price).replace('AED ', ''),
        item.cat || 'N/A',
        formatSoldBy(item.is_first)
      ])
    } else {
      headers = ['Location', 'Rental (AED)', 'Type', 'Duration']
      rows = data.map(item => [
        item.path_name || 'N/A',
        formatRentalPrice(item.total_price).replace('AED ', ''), // Remove AED prefix for CSV
        item.category || 'N/A',
        formatDuration(item.start_date || '', item.end_date || '')
      ])
    }

    // Create CSV content
    csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${transactionType}_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 text-center">
        <div className="animate-pulse">Loading transaction data...</div>
      </div>
    )
  }

  // No data state
  if (!transactionType) {
    return null
  }

  // Empty results state
  if (data.length === 0) {
    return (
      <div className="w-full p-6 text-center text-gray-500">
        No transactions found for the selected criteria.
      </div>
    )
  }

  // Table with data
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {transactionType === "sale" ? "Sale Transactions" : "Rental Transactions"}
        </h3>
        <Button 
          onClick={exportToCSV}
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            {transactionType === "sale" ? (
              <>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Price/SQFT</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sold By</TableHead>
              </>
            ) : (
              <>
                <TableHead>Location</TableHead>
                <TableHead>Rental (AED)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {transactionType === "sale" ? (
                <>
                  <TableCell>{item.project_name || 'N/A'}</TableCell>
                  <TableCell>{formatPrice(item.total_worth)}</TableCell>
                  <TableCell>{formatPrice(item.sqft_price)}</TableCell>
                  <TableCell>{item.cat || 'N/A'}</TableCell>
                  <TableCell>{formatSoldBy(item.is_first)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{item.path_name || 'N/A'}</TableCell>
                  <TableCell>{formatRentalPrice(item.total_price)}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>
                    {formatDuration(item.start_date || '', item.end_date || '')}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="text-sm text-gray-600">
        Total results: {data.length}
      </div>
    </div>
  )
}