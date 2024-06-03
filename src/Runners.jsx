import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react"
import { Card } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import RunnerTable from "./RunnerTable"
import { useLazyGetRunnersByCountryQuery } from "./reducers/apiSlice.js"
import { WOCDataContext } from "./Page.jsx"
import CountryFilter from "./CountryFilter.jsx"
import WOCDBCardHeader from "./WOCDBCardHeader.jsx"

const Runners = () => {
  const [country, setCountry] = useState("")
  const [triggerGetRunnersByCountry, { data: runners, isFetching }] =
    useLazyGetRunnersByCountryQuery()
  const location = useLocation()
  const navigate = useNavigate()
  const { countries, theme } = useContext(WOCDataContext)

  const navigateTo = useCallback(
    (newCountry) => {
      navigate("/runners/person/" + newCountry)
    },
    [navigate]
  )

  const onCountrySelected = useCallback(
    (newCountry) => {
      if (country !== newCountry) {
        navigateTo(newCountry)
      }
    },
    [country, navigateTo]
  )

  const onRowSelected = useCallback(
    (data) => {
      navigate("/person/" + data.data.plainname)
    },
    [navigate]
  )

  const title = useMemo(() => {
    return "Runners for " + country.toUpperCase()
  }, [country])

  useEffect(() => {
    document.title = title
  }, [title])

  // location.pathname is e.g. '/person/person/gbr'
  const bits = location.pathname.split("/")
  if (bits.length === 4) {
    const newCountry = bits[3]
    if (newCountry !== country) {
      setCountry(newCountry)
      triggerGetRunnersByCountry(newCountry)
    }
  }

  const countryFilter = useMemo(() => {
    return (
      <CountryFilter
        countries={countries ? countries : []}
        country={country}
        onCountrySelected={onCountrySelected}
      />
    )
  }, [countries, country, onCountrySelected])

  return (
    <div className="row">
      <div className="col-md-12">
        <Card className="mb-3">
          <WOCDBCardHeader text={title} buttons={countryFilter} />
          <Card.Body className={theme} style={{ padding: 0, height: "400px" }}>
            <RunnerTable
              runners={!isFetching && runners ? runners : []}
              onRowSelected={onRowSelected}
              isFetching={isFetching}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Runners
