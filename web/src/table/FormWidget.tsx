"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search } from "lucide-react"
import * as z from "zod"

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Calendar } from "../components/ui/calendar"
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
export interface LocationItem {
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
    message: "Please select a location.",
  }),
  type: z.enum(["sale", "rent"], {
    message: "Please select Sale or Rent.",
  }),
  startDate: z.date({
    message: "Start date is required.",
  }),
  endDate: z.date({
    message: "End date is required.",
  }),
})

export type FormData = z.infer<typeof formSchema>

interface FormWidgetProps {
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function FormWidget({ onSubmit, isLoading = false }: FormWidgetProps) {
  const [openLocation, setOpenLocation] = useState(false)
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)
  const [allLocations, setAllLocations] = useState<LocationItem[]>([])
  const [displayedLocations, setDisplayedLocations] = useState<LocationItem[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Search Transactions</h2>
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
                        <SelectTrigger className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Select Sale or Rent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="cursor-pointer w-full" size="lg" disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Searching..." : "Search Properties"}
          </Button>

          {/* Info Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-center">Powered by <a href="https://www.dxbinteract.com" target="_blank" className="text-blue-400 font-semibold" rel="noopener noreferrer">DXBInteract</a></p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}