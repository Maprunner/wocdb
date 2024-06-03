import React from "react"
import { Button, ButtonToolbar } from "react-bootstrap"

const RaceFilter = (props) => {
  const onClickRace = (event) => {
    props.onRaceSelected(event.target.value)
  }

  let buttons = ""
  const raceIndex = props.raceIndex
  if (props.details && props.details.races) {
    buttons = props.details.races.map(function (race, index) {
      return (
        <Button
          className="m-1"
          variant={
            raceIndex === index
              ? "active"
              : race.final > 0
              ? "info"
              : "secondary"
          }
          onClick={onClickRace}
          key={index}
          size="sm"
          value={index}
          active={raceIndex === index ? "active" : undefined}
        >
          {race.class + " " + race.type}
        </Button>
      )
    })
  }

  return (
    <div>
      <ButtonToolbar className="p-2">{buttons}</ButtonToolbar>
    </div>
  )
}

export default RaceFilter
