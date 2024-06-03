import React, { useCallback, useContext } from "react"
import { Card } from "react-bootstrap"
import { AsyncTypeahead } from "react-bootstrap-typeahead"
import "react-bootstrap-typeahead/css/Typeahead.css"
import { useLazyGetNameSearchQuery } from "./reducers/apiSlice.js"
import WOCDBCardHeader from "./WOCDBCardHeader"
import { WOCDataContext } from "./Page.jsx"

const NameSearch = (props) => {
  const [triggerGetNameSearch, { data: options, isFetching }] =
    useLazyGetNameSearchQuery()

  const { theme } = useContext(WOCDataContext)

  const handleInput = (input) => {
    // triggered when item selected from typeahead dropdown list
    if (input.length > 0) {
      props.onNameSelected(input[0])
    }
  }

  const handleSearch = useCallback(
    (query) => {
      // know we have at least 3 characters because of minLength property
      triggerGetNameSearch(query)
    },
    [triggerGetNameSearch]
  )

  return (
    <div className="row">
      <div className="col-md-12 mb-2">
        <Card>
          <WOCDBCardHeader text={props.caption} />
          <Card.Body
            className={theme}
            style={{ height: "50px", marginBottom: "20px" }}
          >
            <AsyncTypeahead
              id="name-search"
              isLoading={isFetching}
              options={options}
              labelKey="name"
              onSearch={handleSearch}
              onChange={handleInput}
              placeholder={props.caption}
              caseSensitive={false}
              minLength={3}
              renderMenuItemChildren={(option) => (
                <div>
                  <span>{option.name}</span>
                </div>
              )}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default NameSearch
