import React, { createContext, useState } from "react"
import { Route, Routes } from "react-router-dom"
import NavigationBar from "./NavigationBar"
import Footer from "./Footer"
import WOCsTable from "./WOCsTable"
import Person from "./Person"
import Medals from "./Medals"
import Fight from "./Fight"
import SingleWOCTable from "./SingleWOCTable"
import { useGetCountriesQuery, useGetWOCsQuery } from "./reducers/apiSlice.js"
import Runners from "./Runners.jsx"
import Best from "./Best.jsx"

export const WOCDataContext = createContext({})
export const countriesContext = createContext({})

export default function Page() {
  const { data: WOCdata } = useGetWOCsQuery()
  const { data: countries } = useGetCountriesQuery()
  const [theme] = useState("ag-theme-balham")

  return (
    <div>
      <WOCDataContext.Provider
        value={{ wocData: WOCdata, countries: countries, theme: theme }}
      >
        <NavigationBar />
        <div className="container">
          <Routes>
            <Route path="/" element={<WOCsTable />} />
            <Route path="/person/:name?" element={<Person />} />
            <Route path="/runners/person/:country?" element={<Runners />} />
            <Route path="/person" element={<Person />} />
            <Route path="/fight/:name1?/:name2?" element={<Fight />} />
            <Route path="/fight" element={<Fight />} />
            <Route
              path="/medals/:group?/:type?/:class?/:race?"
              element={<Medals />}
            />
            <Route
              path="/best/:group?/:type?/:class?/:race?"
              element={<Best />}
            />
            <Route
              path="/woc/:year?/:class?/:race?"
              element={<SingleWOCTable />}
            />
            <Route
              path="/jwoc/:year?/:class?/:race?"
              element={<SingleWOCTable />}
            />
            <Route element={<WOCsTable />} />
          </Routes>
        </div>
        <Footer />
      </WOCDataContext.Provider>
    </div>
  )
}
