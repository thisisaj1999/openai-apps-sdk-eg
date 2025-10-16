import { MRT_ColumnDef } from "material-react-table";
import { IRentalDataProps } from "@/contracts/IDataProps";
import WTag from "@/theme/WTag";
import {
	formatNumber,
	formatDuration,
	formatDateRange,
} from "@/services/utils";
import { useGlobalStore } from "@/store/slice/globalSlice";

const RentCol = (): MRT_ColumnDef<IRentalDataProps>[] => {
	useGlobalStore(); //using dummy store

	return [
		{
			accessorKey: "path_name",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Location</div>
					<div className="SubHeading">Status</div>
				</div>
			),
			size: 440,
			sortingFn: (rowA, rowB) => {
				const a = rowA.original?.path_name || '';
				const b = rowB.original?.path_name || '';
				return a.localeCompare(b);
			},
			Cell: ({ row }) => {
				return (
				<div className="BodyCellMain">
					<div className="BodyCellHeading">
						{row.original?.path_name}
					</div>
					<div className="BodyCellSubheading">
						<span className="BodyCellSubheadingSpan BodyCellSubheadingHR">
							{row.original?.category}
							<hr />
							{row.original?.floor_no &&
								`Floor: ${row.original?.floor_no}`}
						</span>
					</div>
				</div>
			)
			},
		},
		{
			accessorKey: "specs",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Specs</div>
				</div>
			),
			size: 200,
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			sortingFn: (rowA, rowB) => {
				const a = rowA.original?.bedroom || '';
				const b = rowB.original?.bedroom || '';
				
				// Define order: Studio < 1 Bed < 2 Bed < etc.
				const getBedroomNumber = (bedroom: string) => {
					if (!bedroom) return 0;
					if (bedroom.toLowerCase().includes('studio')) return 0;
					const match = bedroom.match(/(\d+)/);
					return match ? parseInt(match[1]) : 999;
				};
				
				const aNum = getBedroomNumber(a);
				const bNum = getBedroomNumber(b);
				
				return aNum - bNum;
			},
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					<div className="BodyCellHeading">
						{row.original?.bedroom?.includes("B/R")
							? `${
									row.original?.bedroom.split(" ")[0]
							  } Bedroom Apartment`
							: row.original?.bedroom
							? `${row.original?.bedroom}`
							: ""}
					</div>
					{row.original.unit_size && (
						<div className="BodyCellSubheading">
							{formatNumber(row.original?.unit_size)} sqft
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "rental",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Rental (AED)</div>
				</div>
			),
			size: 250,
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			sortingFn: (rowA, rowB) => {
				const a = rowA.original?.total_price || 0;
				const b = rowB.original?.total_price || 0;
				return a - b;
			},
			Cell: ({ row }) => (
				<div className="BodyCellMain">
					<div
						className="BodyCellHeading"
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						{row.original?.total_price &&
							formatNumber(row.original?.total_price)}
						<WTag
							style={{
								color: `${
									row.original?.renew_status !== "Renewal"
										? `#2bb568`
										: "#fd9726"
								}`,
							}}
							type="pill"
							label={`${row.original?.renew_status}`}
						/>
					</div>
				</div>
			),
		},
		{
			accessorKey: "duration",
			header: "",
			Header: (
				<div className="HeadingCellMain">
					<div className="HeadingMain">Duration</div>
				</div>
			),
			size: 350,
			enableSorting: false,
			muiTableHeadCellProps: {
      	align: 'center',
			},
			muiTableBodyCellProps: {
				align: 'center',
			},
			sortingFn: (rowA, rowB) => {
				const { start_date: startA, end_date: endA } = rowA.original;
				const { start_date: startB, end_date: endB } = rowB.original;
				
				// Calculate duration in days for sorting
				const getDurationInDays = (start: string | null | undefined, end: string | null | undefined) => {
					if (!start || !end) return 0;
					const startDate = new Date(start);
					const endDate = new Date(end);
					return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
				};
				
				const durationA = getDurationInDays(startA, endA);
				const durationB = getDurationInDays(startB, endB);
				
				return durationA - durationB;
			},
			Cell: ({ row }) => {
				const { start_date, end_date } = row.original;
				const duration =
					start_date && end_date
						? formatDuration(start_date, end_date)
						: "N/A";
				return (
					<div className="BodyCellMain BodyCellDuration">
						<div
							className="BodyCellHeading"
							style={{ paddingLeft: "0rem" }}
						>
							{start_date && end_date
								? formatDateRange(start_date, end_date)
								: "N/A"}
						</div>
						<WTag
							style={{
								color: `#0246c1`,
								backgroundColor: "rgba(74, 60, 152, 0.17)",
							}}
							bgcolor="#0246c1"
							type="pill"
							label={`${duration}`}
						/>
					</div>
				);
			},
		},
		// {
		// 	accessorKey: "purchase_price",
		// 	header: "",
		// 	Header: (
		// 		<div className="HeadingCellMain">
		// 			<div className="HeadingMain">
		// 				Purchase
		// 				<br />
		// 				Price
		// 			</div>
		// 		</div>
		// 	),
		// 	size: 150,
		// 	enableSorting: false,
		// 	Cell: ({ row }) => {
        //         console.log(row?.original)
		// 		return (
		// 			<div className="BodyCellMain">
		// 				<div className="BodyCellHeading">
		// 					{row.original?.bedroom?.includes("B/R")
		// 						? `${
		// 								row.original?.bedroom.split(" ")[0]
		// 						  } Bedroom Apartment`
		// 						: row.original?.bedroom
		// 						? `${row.original?.bedroom}`
		// 						: ""}
		// 				</div>
		// 			</div>
		// 		);
		// 	},
		// },
	];
};

export default RentCol;
