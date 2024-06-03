import React, { useMemo, useRef, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import { formatPerCent, getFlagCSS, positionRenderer } from "./utils"
import LoadingOverlay from "./LoadingOverlay"

const RaceResultTable = (props) => {
  const gridRef = useRef()
  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "Pos",
        field: "position",
        cellClass: "text-center",
        cellRenderer: positionRenderer,
      },
      { headerName: "Name", field: "name" },
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
        headerName: "Time",
        field: "time",
        cellClass: "text-center",
      },
      {
        headerName: "% down",
        field: "percentdown",
        cellClass: "text-center",
        cellRenderer: formatPerCent,
      },
    ]
  }, [])

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      filter: true,
    }
  }, [])

  const autoSizeStrategy = useMemo(() => {
    return { type: "fitCellContents" }
  }, [])

  const autoSizeColumns = useCallback(() => {
    gridRef.current?.api.autoSizeAllColumns()
  }, [gridRef])

  return (
    <div>
      <div style={{ height: "600px" }}>
        <AgGridReact
          debug={import.meta.env.PROD ? undefined : true}
          ref={gridRef}
          firstDataRendered={autoSizeColumns}
          onGridSizeChanged={autoSizeColumns}
          onModelUpdated={autoSizeColumns}
          autoSizeStrategy={autoSizeStrategy}
          suppressColumnVirtualisation={true}
          rowData={props.resultData}
          onRowClicked={props.onNameSelected}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          reactiveCustomComponents={true}
          noRowsOverlayComponent={props.isFetching ? LoadingOverlay : undefined}
          noRowsOverlayComponentParams={
            props.isFetching ? { text: "Loading..." } : undefined
          }
        />
      </div>
    </div>
  )
}

export default RaceResultTable
