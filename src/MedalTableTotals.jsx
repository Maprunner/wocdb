import React, { useMemo, useRef, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import { getFlagCSS } from "./utils"
import LoadingOverlay from "./LoadingOverlay"

const MedalTableTotals = (props) => {
  const { results, isFetching } = props

  const medals = useMemo(() => {
    // process results to get medal table
    // output is an array of objects { country, G, B, S, total}
    if (isFetching) {
      return []
    }
    // only keep one of each relay medal result
    const filtered = results.reduce((acc, result) => {
      // keep if not a relay
      if (result.final !== 5 && result.final !== 4) {
        acc.push(result)
        return acc
      }
      // keep if we don't have this result already
      const index = acc.findIndex((row) => {
        return row.raceid === result.raceid && row.position === result.position
      })
      if (index === -1) {
        acc.push(result)
      }
      return acc
    }, [])

    const data = filtered.reduce((acc, result) => {
      // is this a new country
      const index = acc.findIndex((row) => row.country === result.country)
      if (index > -1) {
        // yes so increment count
        let update = acc[index]
        update =
          result.position === 1
            ? (update = { ...update, G: update.G + 1 })
            : update
        update =
          result.position === 2
            ? (update = { ...update, S: update.S + 1 })
            : update
        update =
          result.position === 3
            ? (update = { ...update, B: update.B + 1 })
            : update
        acc[index] = update
      } else {
        // no so add new country object
        const G = result.position === 1 ? 1 : 0
        const S = result.position === 2 ? 1 : 0
        const B = result.position === 3 ? 1 : 0

        acc.push({ country: result.country, G: G, S: S, B: B })
      }
      return acc
    }, [])
    // calculate totals and sort
    data.forEach((row) => {
      row.total = row.G + row.S + row.B
    })
    data.sort((a, b) => {
      if (a.total > b.total) return -1
      if (a.total < b.total) return 1
      if (a.G > b.G) return -1
      if (a.G < b.G) return 1
      if (a.S > b.S) return -1
      if (a.S < b.S) return 1
      if (a.B > b.B) return -1
      if (a.B < b.B) return 1
      return a.country < b.country ? -1 : 1
    })
    return data
  }, [results, isFetching])

  const gridRef = useRef()

  const autoSizeColumns = useCallback(() => {
    gridRef.current?.api.autoSizeAllColumns()
  }, [gridRef])

  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "Country",
        field: "country",
      },
      {
        headerName: "",
        field: "",
        cellClass: getFlagCSS,
      },
      {
        headerName: "",
        headerClass: "flag flag-gold",
        field: "G",
        cellClass: "text-center",
      },
      {
        headerName: "",
        headerClass: "flag flag-silver",
        field: "S",
        cellClass: "text-center",
      },
      {
        headerName: "",
        headerClass: "flag flag-bronze",
        field: "B",
        cellClass: "text-center",
      },
      {
        headerName: "Total",
        field: "total",
        cellClass: "text-center",
      },
    ]
  }, [])

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitCellContents",
    }
  }, [])

  return (
    <div style={{ width: "100%" }}>
      <AgGridReact
        debug={import.meta.env.PROD ? undefined : true}
        ref={gridRef}
        rowData={medals}
        firstDataRendered={autoSizeColumns}
        onGridSizeChanged={autoSizeColumns}
        onModelUpdated={autoSizeColumns}
        columnDefs={columnDefs}
        autoSizeStrategy={autoSizeStrategy}
        suppressColumnVirtualisation={true}
        domLayout={"autoHeight"}
        noRowsOverlayComponent={props.isFetching ? LoadingOverlay : undefined}
        noRowsOverlayComponentParams={
          props.isFetching ? { text: "Loading..." } : undefined
        }
      />
    </div>
  )
}

export default MedalTableTotals
