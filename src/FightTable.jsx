import React, { useMemo, useRef, useCallback, useContext } from "react"
import { AgGridReact } from "ag-grid-react"
import { Card } from "react-bootstrap"
import { Badge } from "react-bootstrap"
import { getFlag1CSS, getFlag2CSS, positionRenderer } from "./utils"
import WOCDBCardHeader from "./WOCDBCardHeader"
import LoadingOverlay from "./LoadingOverlay"
import { WOCDataContext } from "./Page.jsx"

const FightTable = (props) => {
  const gridRef = useRef()
  const { theme } = useContext(WOCDataContext)

  const formatWinner1 = (params) => {
    if (params.node.data.position1 < params.node.data.position2) {
      return <strong>{params.value}</strong>
    } else {
      return params.value
    }
  }

  const formatWinner2 = (params) => {
    if (params.node.data.position2 < params.node.data.position1) {
      return <strong>{params.value}</strong>
    } else {
      return params.value
    }
  }

  const columnDefs = useMemo(() => {
    return [
      { headerName: "WOCID", field: "wocid", hide: "true" },
      { headerName: "Event", field: "type" },
      {
        headerName: "Year",
        field: "year",
        cellClass: "text-center",
      },
      { headerName: "Country", field: "country" },
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
        headerName: "Runner 1",
        field: "name1",
        cellRenderer: formatWinner1,
      },
      {
        headerName: "Country",
        field: "country1",
        cellClass: "text-center",
      },
      {
        headerName: "",
        field: "",
        cellClass: getFlag1CSS,
      },
      {
        headerName: "Time",
        field: "time1",
        cellClass: "text-center",
      },
      {
        headerName: "Pos",
        field: "position1",
        cellClass: "text-center",
        cellRenderer: positionRenderer,
        cellRendererParams: { type: 1 },
      },
      {
        headerName: "Runner 2",
        field: "name2",
        cellRenderer: formatWinner2,
      },
      {
        headerName: "Country",
        field: "country2",
        cellClass: "text-center",
      },
      {
        headerName: "",
        field: "",
        cellClass: getFlag2CSS,
      },
      {
        headerName: "Time",
        field: "time2",
        cellClass: "text-center",
      },
      {
        headerName: "Pos",
        field: "position2",
        cellRenderer: positionRenderer,
        cellRendererParams: { type: 2 },
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

  const info = useMemo(() => {
    return "Fight: " + props.name1.name + " v. " + props.name2.name
  }, [props.name1, props.name2])

  const races = props.results ? props.results.length : 0
  let r1Wins = 0
  let r2Wins = 0
  let draws = 0
  if (props.results) {
    r1Wins = props.results.reduce(function (wins, result) {
      return result.position1 < result.position2 ? wins + 1 : wins
    }, 0)
    r2Wins = props.results.reduce(function (wins, result) {
      return result.position2 < result.position1 ? wins + 1 : wins
    }, 0)
    draws = props.results.length - r1Wins - r2Wins
  }

  const stats = { r1Wins, r2Wins, draws, races }

  const badges = (
    <div>
      {" "}
      <Badge bg="warning" text="dark">
        Played {stats.races}
      </Badge>
      <Badge bg="warning" text="dark">
        {props.name1.name} Wins: {stats.r1Wins}
      </Badge>
      <Badge bg="warning" text="dark">
        {props.name2.name} Wins: {stats.r2Wins}
      </Badge>
      <Badge bg="warning" text="dark">
        Draws: {stats.draws}
      </Badge>
    </div>
  )

  return (
    <div className="row">
      <div className="col-md-12">
        <Card className="mb-3">
          <WOCDBCardHeader text={info} buttons={badges} />
          <Card.Body className={theme} style={{ padding: 0, height: "500px" }}>
            <AgGridReact
              debug={import.meta.env.PROD ? undefined : true}
              ref={gridRef}
              firstDataRendered={autoSizeColumns}
              onGridSizeChanged={autoSizeColumns}
              autoSizeStrategy={autoSizeStrategy}
              suppressColumnVirtualisation={true}
              onRowSelected={props.onFightRowSelected}
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

export default FightTable
