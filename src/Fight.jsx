import React, { useCallback, useEffect, useState } from "react"
import FightTable from "./FightTable.jsx"
import NameSearch from "./NameSearch.jsx"
import { useLocation, useNavigate } from "react-router-dom"
import { useLazyGetFightResultsQuery } from "./reducers/apiSlice.js"

const Fight = () => {
  const [person1, setPerson1] = useState({ name: "Runner 1", plainname: null })
  const [person2, setPerson2] = useState({ name: "Runner 2", plainname: null })
  const [triggerFight, { data: fightResult, isFetching }] =
    useLazyGetFightResultsQuery()
  const location = useLocation()
  const navigate = useNavigate()

  const onFightSelected = useCallback(
    (name1, name2, doPush = true) => {
      triggerFight({ name1: name1, name2: name2 })
      if (doPush) {
        navigate("/fight/" + name1 + "/" + name2)
      }
    },
    [navigate, triggerFight]
  )

  useEffect(() => {
    if (person1.plainname === null && person2.plainname === null) {
      // location.pathname is e.g. '/fight/simonerrington/helenerrington'
      const bits = location.pathname.split("/")
      if (bits.length === 4) {
        const n1 = bits[2]
        const n2 = bits[3]
        setPerson1({ name: "Runner 1", plainname: n1 })
        setPerson2({ name: "Runner 2", plainname: n2 })
        onFightSelected(n1, n2, false)
      }
    }
  }, [person1.plainname, person2.plainname, location.pathname, onFightSelected])

  const onFightRowSelected = (event) => {
    navigate(
      "/" +
        event.data.type.toLowerCase() +
        "/" +
        event.data.year +
        "/" +
        event.data.class.toLowerCase() +
        "/" +
        event.data.race.toLowerCase()
    )
  }

  const onName1Selected = (person1) => {
    setPerson1(person1)
    if (person2.plainname !== null) {
      onFightSelected(person1.plainname, person2.plainname)
    }
  }

  const onName2Selected = (person2) => {
    setPerson2(person2)
    if (person1.plainanme !== null) {
      onFightSelected(person1.plainname, person2.plainname)
    }
  }

  useEffect(() => {
    document.title =
      person1.name !== "Runner 1" && person2.name !== "Runner 2"
        ? person1.name + "/" + person2.name
        : "WOC/JWOC Fight"
  }, [person1.name, person2.name])

  if (fightResult && fightResult.length > 0) {
    if (person1.name === "Runner 1") {
      setPerson1({ ...person1, name: fightResult[0].name1 })
    }
    if (person2.name === "Runner 2") {
      setPerson2({ ...person2, name: fightResult[0].name2 })
    }
  }

  return (
    <div>
      <NameSearch onNameSelected={onName1Selected} caption={person1.name} />
      <NameSearch onNameSelected={onName2Selected} caption={person2.name} />
      <FightTable
        name1={person1}
        name2={person2}
        results={!isFetching && fightResult ? fightResult : []}
        onFightRowSelected={onFightRowSelected}
        isFetching={isFetching}
      />
    </div>
  )
}

export default Fight
