"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search, Download } from "lucide-react"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Types for location data
interface LocationItem {
  dv: string // display value
  rv: string // reference value
  id: number
  flag: string
  is_featured: string
  seq: number | null
}

interface ApiResponse {
  items: LocationItem[]
}

// Form schema
const formSchema = z.object({
  location: z.object({
    dv: z.string(),
    rv: z.string(),
    id: z.number(),
    flag: z.string(),
    is_featured: z.string(),
    seq: z.number().nullable(),
  }, {
    required_error: "Please select a location.",
  }),
  type: z.enum(["sale", "rent"], {
    required_error: "Please select Sale or Rent.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
})

type FormData = z.infer<typeof formSchema>

export function TransactionWidget() {
  const [openLocation, setOpenLocation] = useState(false)
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)
  const [allLocations, setAllLocations] = useState<LocationItem[]>([])
  const [displayedLocations, setDisplayedLocations] = useState<LocationItem[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // New state for table data
  const [tableData, setTableData] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentTransactionType, setCurrentTransactionType] = useState<"sale" | "rent" | null>(null)

  // Helper function to format price in AED
  const formatPrice = (price: string | number): string => {
    if (!price || price === 'N/A') return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return 'N/A'
    return `AED ${numPrice.toLocaleString()}`
  }

  // Helper function to format sold by status
  const formatSoldBy = (isFirst: string): string => {
    if (!isFirst || isFirst === 'N/A') return 'N/A'
    return isFirst.toUpperCase() === 'Y' ? 'Developer' : 'Individual'
  }

  // Helper function to format rental price
  const formatRentalPrice = (price: string | number): string => {
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
    if (!tableData.length) return

    let csvContent = ''
    let headers = []
    let rows = []

    if (currentTransactionType === 'sale') {
      headers = ['Location', 'Price', 'Price/SQFT', 'Type', 'Sold By']
      rows = tableData.map(item => [
        item.project_name || 'N/A',
        formatPrice(item.total_worth).replace('AED ', ''), // Remove AED prefix for CSV
        formatPrice(item.sqft_price).replace('AED ', ''),
        item.cat || 'N/A',
        formatSoldBy(item.is_first)
      ])
    } else {
      headers = ['Location', 'Rental (AED)', 'Type', 'Duration']
      rows = tableData.map(item => [
        item.path_name || 'N/A',
        formatRentalPrice(item.total_price).replace('AED ', ''), // Remove AED prefix for CSV
        item.category || 'N/A',
        formatDuration(item.start_date, item.end_date)
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
    link.setAttribute('download', `${currentTransactionType}_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Fetch locations from API
  const fetchLocations = async () => {
    if (allLocations.length > 0) return // Already loaded

    try {
      setLoadingLocations(true)
      const response = await fetch('https://dxbinteract.com/assets/locationsLOV/locations.json')
      const data: ApiResponse = await response.json()
      
      // Use all locations from API
      setAllLocations(data.items)
      
      // Set initial display (top 10 featured/sequenced)
      const topLocations = getTopLocations(data.items)
      setDisplayedLocations(topLocations)
      
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setLoadingLocations(false)
    }
  }

  // Get top 10 locations (featured first, then by sequence)
  const getTopLocations = (locations: LocationItem[]) => {
    return locations
      .sort((a, b) => {
        if (a.is_featured === 'Y' && b.is_featured !== 'Y') return -1
        if (b.is_featured === 'Y' && a.is_featured !== 'Y') return 1
        return (a.seq || 999999) - (b.seq || 999999)
      })
      .slice(0, 10)
  }

  // Filter locations based on search term
  const filterLocations = (term: string) => {
    if (!term.trim()) {
      return getTopLocations(allLocations)
    }
    
    return allLocations
      .filter(location => 
        location.dv.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 10)
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    const filtered = filterLocations(value)
    setDisplayedLocations(filtered)
  }

  // Handle location popover open
  const handleLocationOpen = (open: boolean) => {
    setOpenLocation(open)
    if (open) {
      fetchLocations()
    }
  }

  async function onSubmit(data: FormData) {
    console.log("Form submitted with full data:", data)
    console.log("Full location object:", data.location)
    
    // Format dates for API (MM-DD-YYYY format)
    const date_fr = format(data.startDate, "MM-dd-yyyy")
    const date_to = format(data.endDate, "MM-dd-yyyy")
    const location_id = data.location.id
    const rent_or_sale = data.type
    
    let url: string
    
    if (rent_or_sale === "sale") {
      url = `https://fam-crm.com/ords/property/dxb/TransV7/ALL/ALL/ALL/${location_id}/${date_fr}/${date_to}/CREATED/N/20/0/ALL/ALL/ALL/ALL/ALL/ALL/ALL/ALL/ALL/ALL/ALL/ALL`
    } else {
      url = `https://fam-crm.com/ords/property/dxb/DLDRentalsV3/ALL/${location_id}/${date_fr}/${date_to}/CREATED/ALL/ALL/20/0`
    }
    
    console.log("API URL:", url)
    
    try {
      console.log("Making API call...")
      
      // Set loading state and transaction type
      setIsLoadingData(true)
      setCurrentTransactionType(rent_or_sale)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiData = await response.json()
      console.log("API Response:", apiData)
      
      // Set the table data
      setTableData(apiData.items || apiData || [])
      
    } catch (error) {
      console.error("Error fetching data from API:", error)
      setTableData([]) // Set empty array on error
    } finally {
      // Stop loading
      setIsLoadingData(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Search Transactions</h2>
        {/* <p className="text-muted-foreground">
          Find your perfect property with our advanced search.
        </p> */}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Location Autocomplete */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
<FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Location</FormLabel>
                  <Popover open={openLocation} onOpenChange={handleLocationOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openLocation}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? field.value.dv : "Search location..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full h-screen max-w-none max-h-[300px] p-0" align="start" sideOffset={4} style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <Command>
                        <CommandInput 
                          placeholder="Search locations..." 
                          value={searchTerm}
                          onValueChange={handleSearchChange}
                        />
                        <CommandList>
                          {loadingLocations ? (
                            <CommandEmpty>Loading locations...</CommandEmpty>
                          ) : displayedLocations.length === 0 ? (
                            <CommandEmpty>No locations found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {displayedLocations.map((location) => (
                                <CommandItem
                                  value={location.dv}
                                  key={location.id}
                                  onSelect={() => {
                                    form.setValue("location", location)
                                    setOpenLocation(false)
                                    setSearchTerm("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.id === location.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center justify-between w-full">
                                    <span>{location.dv}</span>
                                    <div className="flex gap-1 ml-2">
                                      {location.flag === 'A' && (
                                        <Badge variant="secondary" color="red">
                                          Area
                                        </Badge>
                                      )}
                                      {location.flag === 'P' && (
                                        <Badge variant="secondary">
                                          Project
                                        </Badge>
                                      )}
                                      {location.flag === 'B' && (
                                        <Badge variant="secondary">
                                          Building
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>
                    Search and select a location for your property.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            

            {/* Property Type Dropdown */}
            <div className="w-full">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sale or Rent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* <FormDescription>
                      Choose whether you're looking to buy or rent.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick start date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setOpenStartDate(false)
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>
                    When do you want to start?
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setOpenEndDate(false)
                        }}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate")
                          return (
                            date > new Date() || 
                            date < new Date("1900-01-01") ||
                            (startDate && date < startDate)
                          )
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>
                    When do you want to end?
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
        </form>
      </Form>

      {/* Results Table */}
      {isLoadingData && (
        <div className="w-full p-6 text-center">
          <div className="animate-pulse">Loading transaction data...</div>
        </div>
      )}

      {!isLoadingData && tableData.length > 0 && currentTransactionType && (
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {currentTransactionType === "sale" ? "Sale Transactions" : "Rental Transactions"}
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
                {currentTransactionType === "sale" ? (
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
              {tableData.map((item, index) => (
                <TableRow key={index}>
                  {currentTransactionType === "sale" ? (
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
                        {formatDuration(item.start_date, item.end_date)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="text-sm text-gray-600">
            Total results: {tableData.length}
          </div>
        </div>
      )}

      {!isLoadingData && tableData.length === 0 && currentTransactionType && (
        <div className="w-full p-6 text-center text-gray-500">
          No transactions found for the selected criteria.
        </div>
      )}
    </div>
  )
}