import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { tidyTime } from "../utils"

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/wocdb/api" : "/api",
  }),
  endpoints: (build) => ({
    getBestResults: build.query({
      query: (target) => {
        const { group, type, raceClass, race } = target
        return `/best/${group}/${type}/${raceClass}/${race}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.position = parseInt(result.position, 10)
          result.time = tidyTime(result.time)
          result.type = result.type === "W" ? "WOC" : "JWOC"
          if (!result.name) {
            result.name = ""
          }
          return result
        })
        return responseData
      },
    }),
    getCountries: build.query({
      query: () => {
        return "/countries"
      },
    }),
    getFightResults: build.query({
      query: (target) => {
        const { name1, name2 } = target
        return `/fight/${name1}/${name2}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.type = result.type === "W" ? "WOC" : "JWOC"
          result.time1 = tidyTime(result.time1)
          result.time2 = tidyTime(result.time2)
          result.position1 = parseInt(result.position1, 10)
          result.position2 = parseInt(result.position2, 10)
          result.final = parseInt(result.final, 10)
          return result
        })
        // for now take out relay results if on the same team...
        return responseData.reduce((results, result) => {
          if (
            (result.final !== 4 && result.final !== 5) ||
            result.country1 !== result.country2
          ) {
            results.push(result)
          }
          return results
        }, [])
      },
    }),
    getMedals: build.query({
      query: (target) => {
        const { group, type, raceClass, race } = target
        return `/medals/${group}/${type}/${raceClass}/${race}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.position = parseInt(result.position, 10)
          result.total = parseInt(result.total, 10)
          result.G = parseInt(result.G, 10)
          result.S = parseInt(result.S, 10)
          result.B = parseInt(result.B, 10)
          result.time = tidyTime(result.time)
          result.type = result.type === "W" ? "WOC" : "JWOC"
          if (!result.name) {
            result.name = ""
          }
          return result
        })
        return responseData
      },
    }),
    getNameSearch: build.query({
      query: (name) => {
        return `/namesearch/${name}`
      },
      transformResponse: (responseData) => {
        return responseData
      },
    }),
    getResultsByPerson: build.query({
      query: (person) => {
        return `/person/${person}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.type = result.type === "W" ? "WOC" : "JWOC"
          result.time = tidyTime(result.time)
          return result
        })
        return responseData
      },
    }),
    getRunnersByCountry: build.query({
      query: (country) => {
        return `/runners/person/${country}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.woc = parseInt(result.woc)
          result.jwoc = parseInt(result.jwoc)
          result.wocraces = parseInt(result.wocraces)
          result.jwocraces = parseInt(result.jwocraces)
          result.personid = parseInt(result.personid)
          result.nameid = parseInt(result.nameid)
          return result
        })

        return responseData
      },
    }),
    getTopThreeByWOCID: build.query({
      query: (wocid) => {
        return `/topthree/${wocid}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.time = tidyTime(result.time)
          result.position = parseInt(result.position, 10)
          result.final = parseInt(result.final, 10)
          return result
        })
        return responseData
      },
    }),
    getWOCs: build.query({
      query: () => "/wocs",
      transformResponse: (responseData) => {
        for (let i = 0; i < responseData.length; i += 1) {
          let woc = responseData[i]
          woc.type = woc.type === "W" ? "WOC" : "JWOC"
          woc.classes = woc.classes.split(",")
          woc.races = woc.races.split(",")
          woc.links = woc.links.split(",")
          woc.raceids = woc.raceids.split(",")
          woc.finals = woc.finals.split(",")
          woc.index = i
          for (let i = 0; i < woc.races.length; i += 1) {
            let r = {}
            r.type = woc.races[i]
            r.class = woc.classes[i]
            r.link = woc.links[i]
            r.raceid = woc.raceids[i]
            r.final = parseInt(woc.finals[i], 10)
            woc.races[i] = r
          }
          delete woc.classes
          delete woc.links
          delete woc.raceids
          delete woc.finals
        }
        return responseData
      },
    }),
    getWOCResults: build.query({
      query: (target) => {
        const { type, year, raceClass, race } = target
        return `/${type.toLowerCase()}/${year}/${raceClass.toLowerCase()}/${race.toLowerCase()}`
      },
      transformResponse: (responseData) => {
        responseData.map((result) => {
          result.time = tidyTime(result.time)
          result.position = parseInt(result.position, 10)
          result.final = parseInt(result.final, 10)
          return result
        })
        return responseData
      },
    }),
  }),
})

export const {
  useGetWOCsQuery,
  useGetCountriesQuery,
  useGetWOCResultsQuery,
  useLazyGetWOCResultsQuery,
  useLazyGetMedalsQuery,
  useLazyGetResultsByPersonQuery,
  useLazyGetRunnersByCountryQuery,
  useLazyGetFightResultsQuery,
  useLazyGetBestResultsQuery,
  useLazyGetNameSearchQuery,
  useLazyGetTopThreeByWOCIDQuery,
} = api
