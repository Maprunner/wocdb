import React from "react"
import pic from "./img/wocwinners.jpg"

const Footer = () => (
  <div className="wocdb-footer">
    <footer className="container">
      <div className="row justify-content-between">
        <div className="col-lg-4 col-6 p-2">
          <img src={pic} alt="WOC winners" title="WOC winners"></img>
        </div>
        <div className="col-8">
          <h3>About</h3>
          <p>
            The Maprunner WOC/JWOC database includes results from all WOCs
            (except B Finals) and JWOCs (except Qualification races, and
            excluding second relay teams). Select a menu option to try out the
            various queries available and see what you find. The information in
            the database has come from a number of sources, but most notably the
            records maintained by Bryan Teahan, Blair Trewin, the IOF, event
            websites, CompassSport and Orienteering World. Flag icons courtesy
            of{" "}
            <a
              href="http://www.IconDrawer.com"
              target="_blank"
              rel="noreferrer"
            >
              IconDrawer
            </a>
            .
          </p>
          <p>
            <span>Copyright © {new Date().getFullYear()} </span>
            <a
              href="https://www.maprunner.co.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Maprunner
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  </div>
)

export default Footer
