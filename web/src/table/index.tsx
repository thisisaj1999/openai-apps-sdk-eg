import { useState } from "react"
import { createRoot } from "react-dom/client"
import { format } from "date-fns"
import { FormWidget, type FormData } from "./FormWidget"
import { TableWidget, type TransactionData } from "./TableWidget"

export function App() {
  // State for table data
  const [tableData, setTableData] = useState<TransactionData[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentTransactionType, setCurrentTransactionType] = useState<"sale" | "rent" | null>(null)

  async function handleFormSubmit(data: FormData) {
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
    <div className="bg-transparent border-1 border-[#ffffff26] rounded-[8px] w-full max-w-7xl mx-auto p-6 space-y-6">
      <FormWidget onSubmit={handleFormSubmit} isLoading={isLoadingData} />
      <TableWidget 
        data={tableData} 
        transactionType={currentTransactionType} 
        isLoading={isLoadingData} 
      />
    </div>
  )
}

const rootElement = document.getElementById("table-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}