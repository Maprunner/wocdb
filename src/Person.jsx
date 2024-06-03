import React, { useEffect, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import NameTable from "./NameTable"
import NameSearch from "./NameSearch"
import { useLazyGetResultsByPersonQuery } from "./reducers/apiSlice.js"

const Person = () => {
  const [person, setPerson] = useState({ name: null, plainname: null })
  const [triggerGetResults, { data: results, isFetching }] =
    useLazyGetResultsByPersonQuery()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (person.name === null) {
      // check for deep link to a particular name that needs to be loaded
      // location.pathname is e.g. '/person/simonerrington'
      const bits = location.pathname.split("/")
      if (bits.length === 3) {
        setPerson({ name: "", plainname: bits[2] })
        triggerGetResults(bits[2])
      }
    }
  }, [person, location.pathname, triggerGetResults])

  const onRowSelected = useCallback(
    (event) => {
      navigate(
        "/" +
          event.node.data.type.toLowerCase() +
          "/" +
          event.node.data.year +
          "/" +
          event.node.data.class.toLowerCase() +
          "/" +
          event.node.data.race.toLowerCase()
      )
    },
    [navigate]
  )

  const onNameSelected = (data) => {
    triggerGetResults(data.plainname)
    navigate("/person/" + data.plainname)
  }

  useEffect(() => {
    document.title = `${person.name}` || "Name search"
  }, [person])

  return (
    <div>
      <NameSearch onNameSelected={onNameSelected} caption="Name search" />
      <NameTable
        name={person.name}
        results={!isFetching && results ? results : []}
        onRowSelected={onRowSelected}
        isFetching={isFetching}
      />
    </div>
  )
}

export default Person
