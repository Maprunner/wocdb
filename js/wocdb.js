/*
 * Maprunner  WOC Database
 * https://github.com/Maprunner/wocdb
 *
 * Copyright (c) 2015 Simon Errington and contributors
 * Licensed under the MIT license.
 * https://github.com/Maprunner/wocdb/blob/master/LICENSE
 */
// jshint unused:false
/*jslint unparam:true*/
var wocdb = (function (window, $) {
  'use strict';
  function init() {
    var year, type, raceid, personid, country;

    wocdb.router = new wocdb.WocdbRouter();
    wocdb.utils.hijackLinks();

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.person = new wocdb.Person();
    wocdb.runners = new wocdb.Runners();
    wocdb.activeWOC = new wocdb.ActiveWOC();
    wocdb.masterView = new wocdb.MasterView();
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
    wocdb.runnersView = new wocdb.RunnersView({
      collection : wocdb.runners
    });
    wocdb.personView = new wocdb.PersonView({
      collection : wocdb.person
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
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      type = wocdb.utils.getType(parseInt(wocdb.config.bootstrapRaceResult[0].wocid, 10));
      year = parseInt(wocdb.config.bootstrapRaceResult[0].year, 10);
      raceid = parseInt(wocdb.config.bootstrapRaceResult[0].raceid, 10);
      wocdb.dispatcher.trigger("startup:race", {
        "type" : type,
        "year" : year,
        "raceid" : raceid
      });
      return;
    }
    if (wocdb.config.bootstrapPerson) {
      wocdb.dispatcher.trigger("display:page", "person-page");
      personid = parseInt(wocdb.config.bootstrapPerson[0].personid, 10);
      wocdb.dispatcher.trigger("startup:person", {
        "personid" : personid
      });
      return;
    }
    if (wocdb.config.bootstrapRunners) {
      wocdb.dispatcher.trigger("display:page", "country-page");
      country = parseInt(wocdb.config.bootstrapRunners[0].country, 10);
      wocdb.dispatcher.trigger("startup:runners", {
        "type": "person",
        "country": country
      });
      return;
    }
    wocdb.dispatcher.trigger("display:page", "all-wocs-page");
  }

  return {
    init : init
  };

}(window, window.jQuery));