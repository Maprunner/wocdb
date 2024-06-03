import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react"
import { Card } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import MedalTable from "./MedalTable"
import TargetFilter from "./TargetFilter.jsx"
import { useLazyGetMedalsQuery } from "./reducers/apiSlice.js"
import { WOCDataContext } from "./Page.jsx"
import WOCDBCardHeader from "./WOCDBCardHeader.jsx"
import { capitalise } from "./utils.jsx"

const Medals = () => {
  const [target, setTarget] = useState({
    // person, country or 3-letter country code
    group: null,
    // woc, jwoc or all
    type: null,
    // men, women, mixed or all
    raceClass: null,
    // long, middle, sprint, relay, sprintrelay, kosprint or all
    race: null,
  })
  const { theme } = useContext(WOCDataContext)
  const [triggerGetMedals, { data: medals, isFetching }] =
    useLazyGetMedalsQuery()
  const location = useLocation()
  const navigate = useNavigate()
  const { countries } = useContext(WOCDataContext)

  const navigateToTarget = useCallback(
    (newTarget) => {
      navigate(
        "/medals/" +
          newTarget.group +
          "/" +
          newTarget.type +
          "/" +
          newTarget.raceClass +
          "/" +
          newTarget.race
      )
    },
    [navigate]
  )

  const onRowSelected = useCallback(
    (data) => {
      if (target.group === "country") {
        const newTarget = { ...target, group: data.data.country.toUpperCase() }
        navigateToTarget(newTarget)
      } else {
        navigate("/person/" + data.data.plainname)
      }
    },
    [navigate, navigateToTarget, target]
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
    if (target.group === null) {
      return "Medals"
    }
    const group =
      target.group === "person"
        ? "Medal table by runner for "
        : target.group === "country"
        ? "Medal table by country for "
        : "Medallists for " + target.group.toUpperCase() + " at "
    const type =
      target.type === "all"
        ? "WOC and JWOC: "
        : target.type.toUpperCase() + ": "
    const raceClass =
      target.raceClass === "all"
        ? "All classes: "
        : capitalise(target.raceClass) + ": "
    const race = target.race === "all" ? "All races" : capitalise(target.race)
    return group + type + raceClass + race
  }, [target])

  useEffect(() => {
    document.title =
      "Medals: " +
      target.group +
      "|" +
      target.type +
      "|" +
      target.raceClass +
      "|" +
      target.race
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
      triggerGetMedals(newTarget)
    }
  }

  const getCountryName = useCallback(
    (abbr) => {
      if (!countries) return ""
      let row = countries.find((row) => row.abbr === abbr)
      return row === undefined ? "" : row.country
    },
    [countries]
  )

  const gridMedals = useMemo(() => {
    if (isFetching || !medals) {
      return []
    }
    if (target.group === "country") {
      return medals.map((row) => {
        return { ...row, name: getCountryName(row.country) }
      })
    }
    return medals
  }, [isFetching, medals, target.group, getCountryName])

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
              page="medals"
            />
          </Card.Body>
        </Card>
        <Card className="mb-3">
          <WOCDBCardHeader text={title} />
          <Card.Body className={theme} style={{ padding: 0, height: "400px" }}>
            <MedalTable
              groupBy={target.group}
              medals={gridMedals}
              onRowSelected={onRowSelected}
              isFetching={isFetching}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Medals
