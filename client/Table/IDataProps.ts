export interface ISalesDataProps {
  id?: number | null;
  change_percentage?: number | null;
  unit_number?: string | null;
  date_of_transaction?: string | null;
  area?: string | null;
  project_name?: string | null;
  building?: string | null;
  path_name?: string | null;
  cat?: string | null;
  previous_price?: number | null;
  property_description?: string | null;
  sqft?: number | null;
  total_worth?: number | null;
  sqft_price?: number | null;
  meter_price?: number | null;
  prop_type?: string | null;
  procedure_type?: string | null;
  status?: string | null;
  dld_area_id?: number | null;
  is_first?: string | null;
  room?: string | null;
  display_name?: string | null;
  no_of_transaction?: number | null;
  roi?: number | null;
  last_rental_amount?: number | null;
  coordinates?: { lat: number; lng: number } | null;
  ltv?: number | null;
  sale_value?: number | null;
  property_id?: number | null;
  is_rented?: string | null;
  developer?: string | null;
  floor_no?: number | null;
}

export interface IRentalDataProps {
	path_name?: string | null;
	unit_size?: number | null;
	total_price?: number | null;
	start_date?: string | null | undefined;
	end_date?: string | null | undefined;
	category?: string | null;
	renew_status?: string | null;
	bedroom?: string | null;
	prop_no?: string | null;
  floor_no?: string | number | null;
};




export interface IHistoryDataProps {
  id?: number;
  property_id?: string;
  path_name?: string;
  location_area_id?: number;
  location_project_id?: number;
  location_building_id?: number;
  prop_no?: string;
  room?: string;
  balcony_area?: string;
  size_sqmt?: number;
  cat?: string;
  parking?: string;
  ejari_id?: string;
  coordinates?: string;
  sale_transaction?: ISaleTransaction[];
  rent_transaction?: IRentTransaction[];
  response?: string;
  response_code?: number;
  RESPONSE?: string;
  RESPONSE_CODE?: number;
}

export interface ISaleTransaction {
  unit_size?: number;
  price?: number;
  trans_date?: string;
  category?: string;
  sold_by?: string;
  roi?: number;
  change_percentage?: number;
  no_of_transaction?: number;
  last_rental_amount?: number;
  sqft_price?: number;
  status?: string;
  // API returns uppercase fields
  UNIT_SIZE?: number;
  PRICE?: number;
  TRANS_DATE?: string;
  CATEGORY?: string;
  SOLD_BY?: string;
  ROI?: number;
  CHANGE_PERCENTAGE?: number;
  NO_OF_TRANSACTION?: number;
  LAST_RENTAL_AMOUNT?: number;
  SQFT_PRICE?: number;
  STATUS?: string;
}

export interface IRentTransaction {
  price?: number;
  trans_date?: string;
  end_date?: string;
  category?: string;
  renew_status?: string;
  // API returns uppercase fields
  PRICE?: number;
  TRANS_DATE?: string;
  END_DATE?: string;
  CATEGORY?: string;
  RENEW_STATUS?: string;
}