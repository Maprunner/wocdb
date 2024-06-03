import { raceData } from "./utils"
import { Container, Nav, NavDropdown } from "react-bootstrap"

const TargetFilter = (props) => {
  // used on Best and Medals pages
  // with various minor differences between options

  const { group, type, raceClass, race } = props.target

  const currentTypeValue = type === "all" ? "WOC and JWOC" : type.toUpperCase()

  const currentClassValue =
    raceClass === "all"
      ? "All classes"
      : raceClass[0].toUpperCase() + raceClass.slice(1)

  const currentRaceValue = raceData.find((data) => data[1] === race)[0]

  const raceDropdown = raceData.map((data) => {
    if (props.page === "best" && data[1] === "all") {
      return ""
    } else {
      return (
        <NavDropdown.Item key={data[1]} eventKey={data[1]}>
          {data[0]}
        </NavDropdown.Item>
      )
    }
  })

  const typeDropdown =
    props.page === "medals" ? (
      <>
        <NavDropdown.Item key={"all"} eventKey={"all"}>
          WOC and JWOC
        </NavDropdown.Item>
        <NavDropdown.Item key={"woc"} eventKey={"woc"}>
          WOC
        </NavDropdown.Item>
        <NavDropdown.Item key={"jwoc"} eventKey={"jwoc"}>
          JWOC
        </NavDropdown.Item>
      </>
    ) : (
      <>
        <NavDropdown.Item key={"woc"} eventKey={"woc"}>
          WOC
        </NavDropdown.Item>
        <NavDropdown.Item key={"jwoc"} eventKey={"jwoc"}>
          JWOC
        </NavDropdown.Item>
      </>
    )

  const groupDropdown =
    props.page === "medals" ? (
      <>
        <NavDropdown.Item key="person" eventKey={"person"}>
          By runner
        </NavDropdown.Item>
        <NavDropdown.Item key="country" eventKey={"country"}>
          By country
        </NavDropdown.Item>
      </>
    ) : (
      <NavDropdown.Item key="country" eventKey={"all"}>
        All countries
      </NavDropdown.Item>
    )

  const countriesDropdown = props.countries.map((data) => (
    <NavDropdown.Item
      key={data.abbr.toLowerCase()}
      eventKey={data.abbr.toLowerCase()}
    >
      {data.abbr + " (" + data.country + ")"}
    </NavDropdown.Item>
  ))

  const currentGroupValue =
    group === "person"
      ? "By runner"
      : group === "country"
      ? "By country"
      : group === "all"
      ? "All countries"
      : group.toUpperCase()

  const allClassesDropdown =
    props.page === "medals" ? (
      <NavDropdown.Item key={"all"} eventKey={"all"}>
        All classes
      </NavDropdown.Item>
    ) : (
      <></>
    )

  return (
    <div>
      <Container>
        <Nav className="bg-body-tertiary">
          <NavDropdown
            title={currentGroupValue}
            id="dropdown-group-select"
            onSelect={props.onGroupSelected}
          >
            <div className="wocdb-dropdown">
              {groupDropdown}
              {countriesDropdown}
            </div>
          </NavDropdown>
          <NavDropdown
            title={currentTypeValue}
            id="dropdown-type-select"
            onSelect={props.onTypeSelected}
          >
            {typeDropdown}
          </NavDropdown>
          <NavDropdown
            title={currentClassValue}
            id="dropdown-class-select"
            onSelect={props.onClassSelected}
          >
            {allClassesDropdown}
            <NavDropdown.Item key={"men"} eventKey={"men"}>
              Men
            </NavDropdown.Item>
            <NavDropdown.Item key={"women"} eventKey={"women"}>
              Women
            </NavDropdown.Item>
            <NavDropdown.Item key={"mixed"} eventKey={"mixed"}>
              Mixed
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown
            title={currentRaceValue}
            id="dropdown-race-select"
            onSelect={props.onRaceSelected}
          >
            {raceDropdown}
          </NavDropdown>
        </Nav>
      </Container>
    </div>
  )
}

export default TargetFilter
