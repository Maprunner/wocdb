import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react"
import { Card } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import BestTable from "./BestTable"
import TargetFilter from "./TargetFilter.jsx"
import { useLazyGetBestResultsQuery } from "./reducers/apiSlice.js"
import { WOCDataContext } from "./Page.jsx"
import { capitalise, getRaceName } from "./utils.jsx"
import WOCDBCardHeader from "./WOCDBCardHeader.jsx"

const Best = () => {
  const [target, setTarget] = useState({
    // all or 3-letter country code
    group: "",
    // woc or jwoc
    type: "",
    // men, women, mixed or all
    raceClass: "",
    // long, middle, sprint, relay, sprintrelay, kosprint or all
    race: "",
  })
  const [triggerGetBestResults, { data: results, isFetching }] =
    useLazyGetBestResultsQuery()
  const location = useLocation()
  const navigate = useNavigate()
  const { countries, theme } = useContext(WOCDataContext)

  const navigateToTarget = (newTarget) => {
    navigate(
      "/best/" +
        newTarget.group +
        "/" +
        newTarget.type +
        "/" +
        newTarget.raceClass +
        "/" +
        newTarget.race
    )
  }

  const onRowSelected = useCallback(
    (data) => {
      navigate("/person/" + data.data.plainname)
    },
    [navigate]
  )

  const onTypeSelected = (newType) => {
    if (target.type !== newType) {
      const newTarget = { ...target, type: newType }
      navigateToTarget(newTarget)
    }
  }

  const onClassSelected = (newClass) => {
    if (target.raceClass !== newClass) {
      const newTarget = { ...target, raceClass: newClass }
      navigateToTarget(newTarget)
    }
  }

  const onRaceSelected = (newRace) => {
    if (target.race !== newRace) {
      const newTarget = { ...target, race: newRace }
      navigateToTarget(newTarget)
    }
  }

  const onGroupSelected = (newGroup) => {
    if (target.group !== newGroup) {
      const newTarget = { ...target, group: newGroup }
      navigateToTarget(newTarget)
    }
  }

  const title = useMemo(() => {
    let title = "Best results for : "

    if (target.group !== "all") {
      title = title + target.group.toUpperCase() + " - "
    }
    title =
      title +
      target.type.toUpperCase() +
      " - " +
      capitalise(target.raceClass) +
      " - " +
      getRaceName(target.race)

    return title
  }, [target])

  useEffect(() => {
    document.title =
      "Best " +
      target.group.toUpperCase() +
      "|" +
      target.type.toUpperCase() +
      "|" +
      capitalise(target.raceClass) +
      "|" +
      capitalise(target.race)
  }, [target])

  // location.pathname is e.g. '/medals/person/woc/men/sprint'
  const bits = location.pathname.split("/")
  if (bits.length === 6) {
    const newTarget = {
      group: bits[2].toLowerCase(),
      type: bits[3].toLowerCase(),
      raceClass: bits[4].toLowerCase(),
      race: bits[5].toLowerCase(),
    }
    if (
      newTarget.group !== target.group ||
      newTarget.type !== target.type ||
      newTarget.raceClass !== target.raceClass ||
      newTarget.race !== target.race
    ) {
      setTarget(newTarget)
      triggerGetBestResults(newTarget)
    }
  }

  return (
    <div className="row">
      <div className="col-md-12">
        <Card className="mb-3">
          <WOCDBCardHeader text="Filter" />
          <Card.Body className={theme} style={{ padding: 0 }}>
            <TargetFilter
              onClassSelected={onClassSelected}
              onTypeSelected={onTypeSelected}
              onRaceSelected={onRaceSelected}
              onGroupSelected={onGroupSelected}
              countries={countries ? countries : []}
              target={target}
              page="best"
            />
          </Card.Body>
        </Card>
        <Card className="mb-3">
          <WOCDBCardHeader text={title} />
          <Card.Body className={theme} style={{ padding: 0, height: "400px" }}>
            <BestTable
              results={!isFetching && results ? results : []}
              isFetching={isFetching}
              onRowSelected={onRowSelected}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Best
