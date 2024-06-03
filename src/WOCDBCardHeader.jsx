import React from "react"
import { Card } from "react-bootstrap"

const WOCDBCardHeader = (props) => {
  return (
    // standard header with text and an optional set of buttons
    <Card.Header className="bg-wocdb text-white">
      <div className="d-flex justify-content-between align-items-center">
        <h5>{props.text}</h5>
        {props.buttons ? props.buttons : ""}
      </div>
    </Card.Header>
  )
}

export default WOCDBCardHeader
