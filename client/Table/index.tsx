import styled from '@emotion/styled';
import {
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
import Loader from '@/components/Loader';
import WTypo from '@/theme/WTypo';

interface TableProps {
  columns: any;
  data: any;
  isLoading: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const StyledDateRange = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 3rem;
`;

const StyledTable = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;

  
  & .MuiPaper-root {
    border: 1px solid #D6D3E6;
    overflow: hidden;
    box-shadow: 0 2px 5px -1px rgba(50, 50, 93, .25), 0 1px 3px -1px rgba(0, 0, 0, .3);
    background-color: #fff;
    border-radius: 8px;
    overflow-x: auto;
    transition: width .3s ease-in-out;


    @media (min-width: 1400px) {
      width: 80rem;
    }


    & .MuiTableRow-head {
      height: 4.8rem;
      background-color: #F8F7FD;

      & .MuiTableCell-head {
        padding-top: 0;
        padding-bottom: 0;
        justify-content: center;

        & .Mui-TableHeadCell-Content {
          height: 100%;
        }
      }

      & .HeadingCellMain {
        display: flex;
        gap: 0.2rem;
        flex-direction: column;
        padding: 1.5rem 0 1.5rem 0;
        color: #3e4861;
        
        & .HeadingMain {
          font-weight: 600;
          font-size: 16px;
        }
      
        & .SubHeading {
          display: block;
          font-weight: 500;
          font-size: 14px;
        }
      }
    }

    & .MuiTableBody-root {

      & .MuiTableRow-root {
        min-height: 4.8rem;
      }

      & .BodyCellMain {
        display: flex;
        gap: 0.2rem;
        flex-direction: column;
      }

      & .BodyCellHeading {
        font-weight: 500;
        font-size: 16px;
        color: #3e4861;
      }

      & .BodyCellSubheading {
        display: block;
        font-weight: 400;
        font-size: 14px;

        & .BodyCellSubheadingSpan {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        & .BodyCellSubheadingHR hr {
            height: 16px;
            border: none;
            border-right: 1px solid black;
            opacity: 1;
            color: black;
            box-shadow: none;
          
        }
      }

      & .BodyCellDuration {
        align-items: center;
      }

      & .DetailsBtn {
        padding: 6px 10px 6px 16px;
        border-radius: 32px;
        background-color: #259099 !important;
        color: #fff !important;
        border: 1px solid #d6d3e6;
        display: flex;
        cursor: pointer;

        & span {
          display: flex;
          align-items: center;
          gap: 0.1rem;

          & svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    .BodyCellTag {
      display: flex;
      justify-content: center;
    }

    .SoldByCell {
      width: 100%;
      display: flex;
      align-items: center;
    }

    // @media (max-width: 1600px) {
    //   width: calc(100% - 90px);
    // }

    @media (max-width: 1440px) {
      width: calc(100% - 60px);
    }
  }
`;

const Table: React.FC<TableProps> = ({ columns, data, isLoading, dateRange }) => {

  const table = useMaterialReactTable({
    columns,
    data,
    enableKeyboardShortcuts: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableColumnFilterModes: false,
    enableFacetedValues: false,
    enableDensityToggle: false,
    enableTopToolbar: false,
    enableColumnResizing: true,
    enableSorting: true,
    enableMultiSort: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    enableFullScreenToggle: false,
    enableHiding: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 100],
      shape: 'rounded',
      variant: 'outlined',
    },
    localization: {
      rowsPerPage: 'Transactions per page',
    },
    state: {
      isLoading: isLoading,
    },
    muiSkeletonProps: {
      animation: 'wave',
    },
    muiLinearProgressProps: {
      color: 'secondary',
    },
    muiCircularProgressProps: {
      Component: <Loader />
    },
  });

  return (
    <TableContainer>
      <StyledTable>
        {dateRange && (
          <StyledDateRange>
            <WTypo label="From" type="sub-md" />
            <WTypo label={dateRange.startDate} type="sub-md" bold="600" />
            <WTypo label="To" type="sub-md" />
            <WTypo label={dateRange.endDate} type="sub-md" bold="600" />
          </StyledDateRange>
        )}
        <MaterialReactTable table={table} />
      </StyledTable>
    </TableContainer>
  );
};

export default Table;
