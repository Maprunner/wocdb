import React from "react"
import { Table, Container } from "react-bootstrap"

const WOCSummaryTable = (props) => {
  const { rowData } = props

  return (
    <>
      <Container>
        <Table striped responsive size="sm" className="table-bordered">
          <thead>
            <tr>
              <th>Year</th>
              <th>Event</th>
              <th>Country</th>
              <th>Venue</th>
              <th>Dates</th>
              <th>Countries</th>
              <th>Runners</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            <tr>
              <td>{rowData.year}</td>
              <td>{rowData.type}</td>
              <td>{rowData.country}</td>
              <td>{rowData.location}</td>
              <td>{rowData.dates}</td>
              <td>{rowData.countries}</td>
              <td>{rowData.runners}</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </>
  )
}

export default WOCSummaryTable
