export const tidyTime = (time) => {
  if (time) {
    // convert hh:mm:ss to mmm:ss
    const fields = time.split(":")
    if (fields.length === 3) {
      const hours = parseInt(fields[0], 10)
      const minutes = parseInt(fields[1], 10)
      time = `${60 * hours + minutes}:${fields[2]}`
    }
  }
  return time === "0" ? "" : time
}

// formats a URL as a link for display if it exists
// params is the AG-Grid row info sent to a Cell Renderer
export const formatLink = (params) => {
  return params.data.Link === "" || params.data.Link === null ? (
    ""
  ) : (
    <a href={params.data.Link} target="_blank" rel="noreferrer">
      Map
    </a>
  )
}

export class positionRenderer {
  init(params) {
    let cell
    let position
    // called with parameter of 1 or 2 to render fight positions
    if (params.type === 1) {
      position = params.data.position1
    } else {
      if (params.type === 2) {
        position = params.data.position2
      } else {
        position = params.data.position
      }
    }
    if (position === 999) {
      cell = "-"
    } else {
      if (position === 998) {
        cell = "nc"
      } else if (!isMedalRace(params.data.final) || position > 3) {
        cell = position
      } else {
        cell = `<img src="/wocdb/img/${position}.svg" />`
      }
    }
    this.eGui = document.createElement("span")
    this.eGui.innerHTML = cell
  }
  getGui() {
    return this.eGui
  }
}

export const formatPerCent = (params) => {
  if (params.value === "0") {
    return ""
  }
  if (params.value.indexOf(".") === -1) {
    return params.value + ".0"
  }
  return params.value
}

export const getFlagCSS = (params) => {
  return "flag flag-" + params.data.country.toLowerCase()
}

export const getFlag1CSS = (params) => {
  return "flag flag-" + params.data.country1.toLowerCase()
}

export const getFlag2CSS = (params) => {
  return "flag flag-" + params.data.country2.toLowerCase()
}

const isMedalRace = (final) => {
  return final > 0
}

export const capitalise = (text) => {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : ""
}

export const raceData = [
  ["All races", "all"],
  ["Long", "long"],
  ["Middle", "middle"],
  ["Sprint", "sprint"],
  ["Relay", "relay"],
  ["Sprint Relay", "sprintrelay"],
  ["KOSprint", "kosprint"],
]

export const getRaceName = (plainname) => {
  const data = raceData.find((race) => race[1] === plainname)

  return data ? data[0] : "Race"
}
