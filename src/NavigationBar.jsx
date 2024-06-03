import React from "react"
import { useLocation } from "react-router-dom"
import { Nav, Navbar, NavDropdown } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"

function NavigationBar() {
  let location = useLocation()
  return (
    <div>
      <Navbar
        collapseOnSelect
        expand="lg"
        bg="dark"
        variant="dark"
        className="p-0"
      >
        <div className="container">
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav className="mr-auto" activeKey={location.pathname}>
              <LinkContainer to="/">
                <Nav.Link eventKey={1}>Home</Nav.Link>
              </LinkContainer>
              <NavDropdown title="Races">
                <LinkContainer to="/">
                  <NavDropdown.Item>All WOCs/JWOCS</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/best/all/woc/women/sprint">
                  <NavDropdown.Item>Best result by country</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown title="Runners">
                <LinkContainer to="/runners/person/gbr">
                  <NavDropdown.Item>Runners by country</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/person">
                  <NavDropdown.Item>Name search</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/fight">
                  <NavDropdown.Item>Fight</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown title="Medals">
                <LinkContainer to="/medals/person/woc/all/all">
                  <NavDropdown.Item>Medals by runner</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/medals/country/woc/all/all">
                  <NavDropdown.Item>Medals by country</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
      <div className="container mb-3">
        <div className="wocdb-banner d-none d-lg-flex justify-content-start align-items-end">
          <h5>Maprunner WOC/JWOC Database</h5>
        </div>
      </div>
    </div>
  )
}

export default NavigationBar
