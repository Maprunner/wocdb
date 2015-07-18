/*
 * Maprunner  WOC Database
 * https://github.com/Maprunner/wocdb
 *
 * Copyright (c) 2015 Simon Errington and contributors
 * Licensed under the MIT license.
 * https://github.com/Maprunner/wocdb/blob/master/LICENSE
 */
/*global location */
/*jslint unparam:true*/
var wocdb = (function (window, $) {
  'use strict';

  function init() {
    var year, type, raceid;

    wocdb.router = new wocdb.WocdbRouter();
    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    // See https://gist.github.com/tbranyen/1142129
    $(document).on("click", "a[href]:not([data-bypass])", function (evt) {
      var href, root;
      // Get the absolute anchor href.
      href = {
        prop : $(this).prop("href"),
        attr : $(this).attr("href")
      };
      // Get the absolute root.
      root = location.protocol + "//" + location.host + '/wocdb';

      // Ensure the root is part of the anchor href, meaning it's relative.
      if (href.prop.slice(0, root.length) === root) {
        // Stop the default event to ensure the link will not cause a page
        // refresh.
        evt.preventDefault();
        wocdb.router.navigate(href.attr, true);
      }
    });

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.activeWOC = new wocdb.ActiveWOC();
    wocdb.activeWOCView = new wocdb.ActiveWOCView({
      model : wocdb.activeWOC
    });
    wocdb.activeResultView = new wocdb.RaceResultView({
      collection : wocdb.raceResult
    });
    wocdb.activeResultHeaderView = new wocdb.RaceResultHeaderView({
      collection : wocdb.raceResult
    });
    wocdb.raceMenuView = new wocdb.RaceMenuView({
      model : wocdb.activeWOC
    });
    wocdb.wocDbView = new wocdb.WOCDBView({
      collection : wocdb.wocs
    });
    Backbone.history.start({
      pushState : true,
      root : "/wocdb",
      silent : true
    });
    // start
    if (wocdb.config.bootstrapRaceResult) {
      type = parseInt(wocdb.config.bootstrapRaceResult[0].wocid, 10);
      type = type < 1000 ? "WOC" : "JWOC";
      year = parseInt(wocdb.config.bootstrapRaceResult[0].year, 10);
      raceid = parseInt(wocdb.config.bootstrapRaceResult[0].raceid, 10);
      wocdb.dispatcher.trigger("startup:race", {
        "type" : type,
        "year" : year,
        "raceid" : raceid
      });
    } else {
      wocdb.wocDbView.render();
    }
  }

  return {
    init : init
  };

}(window, window.jQuery));