import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import WOCSummaryTable from "./WOCSummaryTable.jsx"
import RaceFilter from "./RaceFilter.jsx"
import RaceResultTable from "./RaceResultTable.jsx"
import { Card, Button, Container, Row, Col } from "react-bootstrap"
import {
  useLazyGetWOCResultsQuery,
  useLazyGetTopThreeByWOCIDQuery,
} from "./reducers/apiSlice.js"
import { WOCDataContext } from "./Page.jsx"
import WOCDBCardHeader from "./WOCDBCardHeader.jsx"
import ForwardBack from "./ForwardBack.jsx"
import MedalTableTotals from "./MedalTableTotals.jsx"

const SingleWOCTable = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [triggerGetResults, { data: results, isFetching }] =
    useLazyGetWOCResultsQuery()
  const [
    triggerGetTopThree,
    { data: topThrees, isFetching: topThreeIsFetching },
  ] = useLazyGetTopThreeByWOCIDQuery()
  const [raceIndex, setRaceIndex] = useState(0)
  const [WOCData, setWOCData] = useState({})
  const { wocData: wocs, theme } = useContext(WOCDataContext)
  const [target, setTarget] = useState({
    // woc, jwoc or all
    type: null,
    // year,
    year: 0,
    // men, women, mixed or all
    raceClass: null,
    // long, middle, sprint, relay, sprintrelay, kosprint or all
    race: null,
  })

  const navigateTo = useCallback(
    (newTarget) => {
      navigate(
        "/" +
          newTarget.type +
          "/" +
          newTarget.year +
          "/" +
          newTarget.raceClass +
          "/" +
          newTarget.race
      )
    },
    [navigate]
  )

  const onRaceSelected = useCallback(
    (newRaceIndex) => {
      const newTarget = {
        type: WOCData.type.toLowerCase(),
        year: WOCData.year,
        raceClass: WOCData.races[newRaceIndex].class.toLowerCase(),
        race: WOCData.races[newRaceIndex].type.toLowerCase(),
      }
      navigateTo(newTarget)
    },
    [WOCData, navigateTo]
  )

  const loadNewRace = (newRaceIndex, newTarget) => {
    if (raceIndex !== newRaceIndex) {
      setRaceIndex(parseInt(newRaceIndex, 10))
    }

    if (
      newTarget.type !== target.type ||
      newTarget.year !== target.year ||
      newTarget.raceClass !== target.raceClass ||
      newTarget.race !== target.race
    ) {
      setTarget(newTarget)
      triggerGetResults(newTarget)
    }
  }

  // location.pathname is e.g. '/woc/2022/women/sprint'
  const path = location.pathname.split("/")
  if (path.length === 5) {
    if (wocs && wocs.length !== 0) {
      const thisWOC = wocs.find((woc) => {
        return (
          woc.type === path[1].toUpperCase() &&
          woc.year === parseInt(path[2], 10)
        )
      })
      if (thisWOC) {
        if (thisWOC.id !== WOCData.id) {
          setWOCData(thisWOC)
          triggerGetTopThree(thisWOC.id)
        }
        const newRaceIndex = thisWOC.races.findIndex((race) => {
          return (
            race.class.toLowerCase() === path[3] &&
            race.type.toLowerCase() === path[4]
          )
        })
        if (newRaceIndex > -1) {
          const newTarget = {
            type: path[1],
            year: path[2],
            raceClass: path[3],
            race: path[4],
          }
          loadNewRace(newRaceIndex, newTarget)
        } else {
          console.log("Race not found.", thisWOC, location.pathname)
        }
      }
    }
  }

  const goBackOneWOC = useCallback(() => {
    // wocs in reverse order so "back" button needs to go forward in array
    const newIndex = WOCData.index === wocs.length - 1 ? 0 : WOCData.index + 1
    const newTarget = {
      type: wocs[newIndex].type.toLowerCase(),
      year: wocs[newIndex].year,
      raceClass: wocs[newIndex].races[0].class.toLowerCase(),
      race: wocs[newIndex].races[0].type.toLowerCase(),
    }
    navigateTo(newTarget)
  }, [WOCData, wocs, navigateTo])

  const goForwardOneWOC = useCallback(() => {
    // wocs in reverse order so "forward" button needs to go backward in array
    const newIndex = WOCData.index === 0 ? wocs.length - 1 : WOCData.index - 1
    const newTarget = {
      type: wocs[newIndex].type.toLowerCase(),
      year: wocs[newIndex].year,
      raceClass: wocs[newIndex].races[0].class.toLowerCase(),
      race: wocs[newIndex].races[0].type.toLowerCase(),
    }
    navigateTo(newTarget)
  }, [navigateTo, WOCData, wocs])

  const goBackOneRace = useCallback(() => {
    const newRaceIndex =
      raceIndex === 0 ? WOCData.races.length - 1 : raceIndex - 1
    onRaceSelected(newRaceIndex)
  }, [raceIndex, onRaceSelected, WOCData])

  const goForwardOneRace = useCallback(() => {
    const newRaceIndex =
      raceIndex === WOCData.races.length - 1 ? 0 : raceIndex + 1
    onRaceSelected(newRaceIndex)
  }, [raceIndex, onRaceSelected, WOCData])

  const onNameSelected = useCallback(
    (event) => {
      navigate("/person/" + event.node.data.plainname)
    },
    [navigate]
  )

  const onClickMap = useCallback((event) => {
    window.open(event.target.value)
  }, [])

  const title = useMemo(() => {
    return WOCData?.type
      ? WOCData.type +
          " " +
          WOCData.year +
          " " +
          WOCData.races[raceIndex].class +
          " " +
          WOCData.races[raceIndex].type
      : "WOC/JWOC Results"
  }, [WOCData, raceIndex])

  useEffect(() => {
    document.title = title
  }, [title])

  let mapButton
  if (WOCData.races && WOCData.races[raceIndex].link !== "") {
    mapButton = (
      <Button
        variant="info"
        onClick={onClickMap}
        size="sm"
        value={WOCData.races[raceIndex].link}
      >
        Map
      </Button>
    )
  }

  const WOCButtons = (
    <ForwardBack goBack={goBackOneWOC} goForward={goForwardOneWOC} />
  )

  const raceButtons = (
    <ForwardBack goBack={goBackOneRace} goForward={goForwardOneRace} />
  )

  return (
    <div>
      <Card className="mb-3">
        <WOCDBCardHeader
          text={
            WOCData.type ? WOCData.type.toUpperCase() + " Summary" : "Summary"
          }
          buttons={WOCButtons}
        />
        <Card.Body>
          <WOCSummaryTable rowData={WOCData} />
        </Card.Body>
      </Card>
      <Card className="mb-3">
        <WOCDBCardHeader text="Races" buttons={raceButtons} />
        <Card.Body className={theme} style={{ padding: 0 }}>
          <RaceFilter
            details={WOCData}
            raceIndex={raceIndex}
            onRaceSelected={onRaceSelected}
          />
        </Card.Body>
      </Card>
      <Container>
        <Row>
          <Col xs={12} md={true}>
            <Card className="mb-3">
              <WOCDBCardHeader text={title} buttons={mapButton} />
              <Card.Body className={theme} style={{ padding: 0 }}>
                <RaceResultTable
                  isFetching={isFetching}
                  resultData={!isFetching && results ? results : []}
                  raceData={WOCData}
                  onNameSelected={onNameSelected}
                  rowSelection="single"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} lg={5}>
            <Card className="mb-3">
              <WOCDBCardHeader text="Medal table" />
              <Card.Body className={theme} style={{ padding: 0 }}>
                <MedalTableTotals
                  results={!topThreeIsFetching && topThrees ? topThrees : []}
                  isFetching={topThreeIsFetching}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default SingleWOCTable
