import React, { useMemo } from "react"
import { Container, Nav, NavDropdown } from "react-bootstrap"

const CountryFilter = (props) => {
  const countryDropdown = useMemo(
    () =>
      props.countries.map((data) => (
        <NavDropdown.Item
          key={data.abbr.toLowerCase()}
          eventKey={data.abbr.toLowerCase()}
        >
          {data.abbr + " (" + data.country + ")"}
        </NavDropdown.Item>
      )),
    [props.countries]
  )

  return (
    <div>
      <Container>
        <Nav className="bg-body-tertiary">
          <NavDropdown
            title={props.country.toUpperCase()}
            id="dropdown-country-select"
            onSelect={props.onCountrySelected}
          >
            <div className="wocdb-dropdown">{countryDropdown}</div>
          </NavDropdown>
        </Nav>
      </Container>
    </div>
  )
}

export default CountryFilter
