import React from "react"

const LoadingOverlay = (props) => {
  // Messy way to get table to show that it is loading
  // driven by isFetching from reducer
  // Send empty array to Grid if isFetching and then use this as "No rows" overlay component
  // since can't see another way of triggering the "loading" overlay
  return (
    <div
      role="presentation"
      className="ag-overlay-loading-center"
      style={{ backgroundColor: "#b4bebe", height: "9%" }}
    >
      {props.text}
    </div>
  )
}

export default LoadingOverlay
