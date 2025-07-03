import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import Page from "./Page.jsx"
import { api } from "./reducers/apiSlice"
import "bootstrap/dist/css/bootstrap.min.css"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "ag-grid-community/styles/ag-theme-balham.css"
import "./css/wocdb.css"
import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from "ag-grid-community"

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule])

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" })

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
        basename="/wocdb"
      >
        <Page />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
