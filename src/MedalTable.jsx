import React, { useMemo, useRef, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import { getFlagCSS, positionRenderer } from "./utils"
import LoadingOverlay from "./LoadingOverlay"

const MedalTable = (props) => {
  const gridRef = useRef()

  const fullColumnDefs = useMemo(() => {
    return [
      { headerName: "personid", field: "personid", hide: "true" },
      {
        headerName: "Name",
        field: "name",
      },
      {
        headerName: "Country",
        field: "country",
        cellClass: "text-center",
      },
      {
        headerName: "",
        field: "",
        cellClass: getFlagCSS,
      },
      { headerName: "Gold", field: "G", cellClass: "text-center" },
      { headerName: "Silver", field: "S", cellClass: "text-center" },
      { headerName: "Bronze", field: "B", cellClass: "text-center" },
      { headerName: "Total", field: "total", cellClass: "text-center" },
      { headerName: "From", field: "fromYear", cellClass: "text-center" },
      { headerName: "To", field: "toYear", cellClass: "text-center" },
    ]
  }, [])

  const oneCountryColumnDefs = useMemo(() => {
    return [
      {
        headerName: "Name",
        field: "name",
      },
      {
        headerName: "Country",
        field: "country",
        cellClass: "text-center",
      },
      {
        headerName: "",
        field: "",
        cellClass: getFlagCSS,
      },
      {
        headerName: "Position",
        field: "position",
        cellClass: "text-center",
        cellRenderer: positionRenderer,
      },
      { headerName: "Year", field: "year", cellClass: "text-center" },
      { headerName: "Event", field: "type", cellClass: "text-center" },
      { headerName: "Venue", field: "venue", cellClass: "text-center" },
      { headerName: "Race", field: "race", cellClass: "text-center" },
      { headerName: "Time", field: "time", cellClass: "text-center" },
    ]
  }, [])

  const columnDefs = useMemo(() => {
    return props.groupBy === "person" || props.groupBy === "country"
      ? fullColumnDefs
      : oneCountryColumnDefs
  }, [props.groupBy, fullColumnDefs, oneCountryColumnDefs])

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      filter: true,
    }
  }, [])

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitCellContents",
    }
  }, [])

  const autoSizeColumns = useCallback(() => {
    gridRef.current?.api.autoSizeAllColumns()
  }, [gridRef])

  const pageSizes = useMemo(() => {
    return [20, 50, 100]
  }, [])

  return (
    <AgGridReact
      debug={import.meta.env.PROD ? undefined : true}
      ref={gridRef}
      pagination={true}
      paginationPageSize={20}
      paginationPageSizeSelector={pageSizes}
      onfirstDataRendered={autoSizeColumns}
      onModelUpdated={autoSizeColumns}
      onGridSizeChanged={autoSizeColumns}
      autoSizeStrategy={autoSizeStrategy}
      suppressColumnVirtualisation={true}
      onRowSelected={props.onRowSelected}
      rowData={props.medals}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowSelection="single"
      reactiveCustomComponents={true}
      noRowsOverlayComponent={props.isFetching ? LoadingOverlay : undefined}
      noRowsOverlayComponentParams={
        props.isFetching ? { text: "Loading..." } : undefined
      }
    />
  )
}

export default MedalTable
