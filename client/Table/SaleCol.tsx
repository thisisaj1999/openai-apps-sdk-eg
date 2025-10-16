import { MRT_ColumnDef } from "material-react-table";
import { ISalesDataProps } from "@/contracts/IDataProps";
import Share from "../../assets/icons/share.svg";
import WTag from "@/theme/WTag";
import { formatNumberWithUnit, formatNumber } from "@/services/utils";
import styled from "@emotion/styled";
import { useGlobalStore } from "@/store/slice/globalSlice";

import Info from "../../assets/icons/info.svg";

const InfoWrapper = styled(Info)`
	width: 20px;
	height: 20px;
	vertical-align: text-bottom;
`;

// Refactored: SaleCol now takes setIsModalOpen and setProjectId as arguments
export const SaleCol = (
	setIsModalOpen: (open: boolean) => void,
	setProjectId: (id: string | number | null) => void
): MRT_ColumnDef<ISalesDataProps>[] => {
	const handleDetailsClick = async (row: any) => {
		if (
			row?.original?.id !== undefined &&
			row?.original?.id !== null
		) {
			setIsModalOpen(true);
			setProjectId(row.original.id);
		}
	};

	return [
		{
			accessorKey: "display_name",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Location</div>
					<div className="SubHeading">Status</div>
				</div>
			),
			size: 380,
			sortingFn: 'alphanumeric',
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					<div className="BodyCellHeading">
						{row.original.display_name}
					</div>
					<div className="BodyCellSubheading">
						<span className="BodyCellSubheadingSpan BodyCellSubheadingHR">
							<WTag
								style={{
									backgroundColor: "#f2f2f2",
									color: "#000",
								}}
								noArrow
								type="pill"
								label={`${row.original.status}`}
							/>
							{row.original.cat} <hr /> Floor:{" "}
							{row.original.floor_no}
						</span>
					</div>
				</div>
			),
		},
		{
			accessorKey: "total_worth",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Price</div>
					<div className="SubHeading">Capital gain</div>
				</div>
			),
			size: 240,
			sortingFn: 'basic',
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					{row.original.total_worth && (
						<div className="BodyCellHeading">
							AED {formatNumber(row.original.total_worth)}
							{row?.original?.change_percentage !== null && row?.original?.change_percentage !== undefined && (
								<span style={{ 
									color: row.original.change_percentage > 0 ? '#22c55e' : '#ef4444',
									marginLeft: '4px'
								}}>
									({row.original.change_percentage > 0 ? '+' : ''}{Math.round(row.original.change_percentage)}%)
								</span>
							)}
						</div>
					)}
					{row.original.sqft_price && (
						<div className="BodyCellSubheading">
							AED {formatNumber(row.original.sqft_price)} /sqft
						</div>
					)}
					{row?.original?.ltv && (
						<div className="BodyCellTag">
							<WTag
									style={{
										backgroundColor: "#eeeeeeff",
										color: "#000",
									}}
									noArrow
									type="pill"
									label={`${Math.round(row.original.ltv)}% LTV`}
								/>
						</div>
					)}
				</div>
			),
			
		},
		{
			accessorKey: "room",
			header: "",
			enableSorting: true,
			sortingFn: (rowA, rowB, columnId) => {
				const aValue = rowA.getValue(columnId) as string;
				const bValue = rowB.getValue(columnId) as string;
				
				// Extract numbers from strings like "1BR", "2BR", "Studio"
				const extractNumber = (str: string): number => {
					if (!str) return 0;
					if (str.toLowerCase().includes('studio')) return 0;
					const match = str.match(/(\d+)/);
					return match ? parseInt(match[1]) : 0;
				};
				
				return extractNumber(aValue) - extractNumber(bValue);
			},
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Specs</div>
				</div>
			),
			size: 160,
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					<div className="BodyCellHeading">{row.original.room}</div>
					{row.original.sqft && (
						<div className="BodyCellSubheading">
							{formatNumber(row.original.sqft)} sqft
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "roi",
			header: "",
			enableSorting: true,
			sortingFn: 'basic',
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Rental Yield</div>
					<div className="SubHeading">Rental</div>
				</div>
			),
			size: 180,
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					{row.original.roi && (
						<div className="BodyCellHeading">
							<WTag
								noArrow
								type="pill"
								bordered
								label={`${row?.original?.roi}%`}
							/>
						</div>
					)}
					{row.original.last_rental_amount && (
						<div className="BodyCellSubheading">
							AED {formatNumber(row.original.last_rental_amount)}
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "date_of_transaction",
			header: "",
			enableSorting: true,
			sortingFn: (rowA, rowB, columnId) => {
				const aValue = rowA.getValue(columnId) as string;
				const bValue = rowB.getValue(columnId) as string;
				
				if (!aValue || !bValue) return 0;
				
				// Parse date strings - assuming format like "DD-MM-YYYY" or similar
				const parseDate = (dateStr: string): Date => {
					// Handle different date formats
					if (dateStr.includes('-')) {
						const parts = dateStr.split('-');
						if (parts.length === 3) {
							// Assume DD-MM-YYYY format
							return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
						}
					}
					return new Date(dateStr);
				};
				
				const dateA = parseDate(aValue);
				const dateB = parseDate(bValue);
				
				return dateA.getTime() - dateB.getTime();
			},
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			Header: (
				<div className="HeadingCellMain SoldByHeadCell">
					<div className="HeadingMain">Date</div>
					<div className="SubHeading">Sold by</div>
				</div>
			),
			// enableSorting: false,
			size: 180,
			Cell: ({ row }) => (
				<div className="BodyCellMain SoldByCell">
					<div className="BodyCellHeading">
						{row?.original?.date_of_transaction && (
							<WTag
								noArrow
								type="pill"
								bordered
								style={{
									width: "6rem",
									border: "none",
									backgroundColor: "#ffe4cf",
									color: "#000",
									fontWeight: "500",
									fontSize: "0.8rem",
								}}
								label={row?.original?.date_of_transaction}
							/>
						)}
					</div>
					<div className="BodyCellSubheading">
						{row.original.is_first === "Y"
							? "Developer "
							: "Individual "}
						{row.original.no_of_transaction
							? `(${row.original.no_of_transaction} ${
									row.original.no_of_transaction > 1
										? "Times"
										: "Time"
							  })`
							: ""}
					</div>
				</div>
			),
		},
		{
			accessorKey: "actions",
			header: "",
			Header: <div className="HeadingCellMain"></div>,
			enableSorting: false,
			enableResizing: false,
			size: 160,
			Cell: ({ row }) => {
				return (
					<div className="BodyCellMain">
						<div className="BodyCellSubheading" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
							<button
								className="DetailsBtn"
								onClick={() => handleDetailsClick(row)}
								style={{ marginBottom: '4px' }}
							>
								<span>
									Details
									<Share fill="none" stroke="#fff" />
								</span>
							</button>
						</div>
					</div>
				);
			},
		},
	];
};

export default SaleCol;
