import React from "react"

import { Button, ButtonGroup } from "react-bootstrap"

const ForwardBack = (props) => {
  return (
    <>
      <ButtonGroup>
        <Button
          onClick={props.goBack}
          variant="info"
          size="sm"
          className="me-2"
        >
          <strong>{"<"}</strong>
        </Button>
        <Button onClick={props.goForward} variant="info" size="sm">
          <strong>{">"}</strong>
        </Button>
      </ButtonGroup>
    </>
  )
}

export default ForwardBack
