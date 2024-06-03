import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from "react"
import { AgGridReact } from "ag-grid-react"
import { Card } from "react-bootstrap"
import { useGetWOCsQuery } from "./reducers/apiSlice.js"
import { useNavigate } from "react-router-dom"
import WOCDBCardHeader from "./WOCDBCardHeader.jsx"
import { WOCDataContext } from "./Page.jsx"

const WOCsTable = () => {
  const gridRef = useRef()
  const { theme } = useContext(WOCDataContext)
  const { data: wocs } = useGetWOCsQuery()
  const navigate = useNavigate()

  const autoSizeColumns = useCallback(() => {
    gridRef.current?.api.autoSizeAllColumns()
  }, [gridRef])

  const onRowSelected = useCallback(
    (event) => {
      navigate(
        event.data.type.toLowerCase() +
          "/" +
          event.data.year +
          "/" +
          event.data.races[0].class.toLowerCase() +
          "/" +
          event.data.races[0].type.toLowerCase()
      )
    },
    [navigate]
  )

  const columnDefs = useMemo(() => {
    return [
      { headerName: "WOCID", field: "id", hide: "true" },
      {
        headerName: "Year",
        field: "year",
        cellClass: "text-center",
      },
      {
        headerName: "Type",
        field: "type",
        cellClass: "text-center",
      },
      {
        headerName: "Country",
        field: "country",
      },

      {
        headerName: "Dates",
        field: "dates",
      },
      {
        headerName: "Countries",
        field: "countries",
        cellClass: "text-center",
      },
      {
        headerName: "Runners",
        field: "runners",
        cellClass: "text-center",
      },
    ]
  }, [])

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      filter: true,
    }
  }, [])

  useEffect(() => {
    document.title = "Maprunner WOC/JWOC Database"
  }, [])

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitCellContents",
    }
  }, [])

  return (
    <div className="row">
      <div className="col-md-12">
        <Card className="mb-3">
          <WOCDBCardHeader text="All WOCs and JWOCS" />
          <Card.Body className={theme} style={{ padding: 0, height: "400px" }}>
            <AgGridReact
              debug={import.meta.env.PROD ? undefined : true}
              ref={gridRef}
              onGridReady={autoSizeColumns}
              onGridSizeChanged={autoSizeColumns}
              onModelUpdated={autoSizeColumns}
              autoSizeStrategy={autoSizeStrategy}
              suppressColumnVirtualisation={true}
              onRowSelected={onRowSelected}
              rowData={wocs}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default WOCsTable
