import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from "react"
import { AgGridReact } from "ag-grid-react"
import { Badge, Card } from "react-bootstrap"
import { getFlagCSS, positionRenderer } from "./utils"
import WOCDBCardHeader from "./WOCDBCardHeader"
import LoadingOverlay from "./LoadingOverlay"
import { WOCDataContext } from "./Page.jsx"

const NameTable = (props) => {
  const gridRef = useRef()
  const { theme } = useContext(WOCDataContext)
  const countRaces = (type) => {
    const count = props.results.reduce(function (total, event) {
      return event.type === type ? total + 1 : total
    }, 0)
    return count
  }

  const countEvents = (type) => {
    let unique = props.results.reduce((wocids, result) => {
      if (result.type !== type || wocids.includes(result.wocid)) return wocids
      return [...wocids, result.wocid]
    }, [])
    return unique.length
  }

  const columnDefs = useMemo(() => {
    return [
      { headerName: "WOCID", field: "wocid", hide: "true" },
      {
        headerName: "Year",
        field: "year",
        cellClass: "text-center",
      },
      { headerName: "Event", field: "type" },
      { headerName: "Venue", field: "venue" },
      {
        headerName: "Class",
        field: "class",
        cellClass: "text-center",
      },
      {
        headerName: "Race",
        field: "race",
      },
      {
        headerName: "Place",
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

  let info
  if (props.results.length === 0) {
    info = "Results"
  } else {
    info = "Results for " + props.results[0].name
  }

  useEffect(() => {
    document.title =
      props.results.length === 0 ? "Results" : props.results[0].name
  }, [props.results])

  const badges = (
    <div>
      <Badge bg="warning" text="dark">
        Total {props.results.length}
      </Badge>
      <Badge bg="warning" text="dark">
        WOCs {countEvents("WOC")}
      </Badge>
      <Badge bg="warning" text="dark">
        Races {countRaces("WOC")}
      </Badge>
      <Badge bg="warning" text="dark">
        JWOCs {countEvents("JWOC")}
      </Badge>
      <Badge bg="warning" text="dark">
        Races {countRaces("JWOC")}
      </Badge>
    </div>
  )

  return (
    <div className="row">
      <div className="col-md-12">
        <Card className="mb-3">
          <WOCDBCardHeader text={info} buttons={badges} />
          <Card.Body className={theme} style={{ padding: 0, height: "400px" }}>
            <AgGridReact
              debug={import.meta.env.PROD ? undefined : true}
              ref={gridRef}
              onFirstDataRendered={autoSizeColumns}
              onGridSizeChanged={autoSizeColumns}
              onModelUpdated={autoSizeColumns}
              autoSizeStrategy={autoSizeStrategy}
              suppressColumnVirtualisation={true}
              onRowSelected={props.onRowSelected}
              rowData={props.results}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              reactiveCustomComponents={true}
              noRowsOverlayComponent={
                props.isFetching ? LoadingOverlay : undefined
              }
              noRowsOverlayComponentParams={
                props.isFetching ? { text: "Loading..." } : undefined
              }
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default NameTable
