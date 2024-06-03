import React, { useCallback, useMemo, useRef } from "react"
import { AgGridReact } from "ag-grid-react"
import { getFlagCSS } from "./utils"
import LoadingOverlay from "./LoadingOverlay"

const RunnerTable = (props) => {
  const gridRef = useRef()

  const columnDefs = useMemo(() => {
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
      { headerName: "WOCs", field: "woc", cellClass: "text-center" },
      { headerName: "WOC races", field: "wocraces", cellClass: "text-center" },
      { headerName: "JWOCs", field: "jwoc", cellClass: "text-center" },
      {
        headerName: "JWOC races",
        field: "jwocraces",
        cellClass: "text-center",
      },
      { headerName: "Nameid", field: "nameid", cellClass: "text-center" },
      { headerName: "Personid", field: "personid", cellClass: "text-center" },
    ]
  }, [])

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
      rowData={props.runners}
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

export default RunnerTable
