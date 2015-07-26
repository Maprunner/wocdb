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
    var year, type, raceid, name, country;

    wocdb.router = new wocdb.WocdbRouter();
    wocdb.utils.hijackLinks();
    wocdb.countries = new wocdb.Countries(wocdb.config.countrydata);

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.person = new wocdb.Person();
    wocdb.runners = new wocdb.Runners();
    wocdb.bestlist = new wocdb.BestList();
    wocdb.medals = new wocdb.Medals();
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
    wocdb.bestView = new wocdb.BestView({
      collection : wocdb.bestlist
    });
    wocdb.medalView = new wocdb.MedalsView({
      collection : wocdb.medals
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
      if (wocdb.config.bootstrapPerson.length) {
        wocdb.dispatcher.trigger("display:page", "person-page");
        name = wocdb.config.bootstrapPerson[0].plainname;
        wocdb.dispatcher.trigger("startup:person", name);
      }
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
    if (wocdb.config.bootstrapBestList) {
      wocdb.dispatcher.trigger("display:page", "best-page");
      wocdb.dispatcher.trigger("startup:best");
      return;
    }
    if (wocdb.config.bootstrapMedals) {
      wocdb.dispatcher.trigger("display:page", "medal-page");
      wocdb.dispatcher.trigger("startup:medal");
      return;
    }
    wocdb.dispatcher.trigger("display:page", "all-wocs-page");
  }

  return {
    init : init
  };

}(window, window.jQuery));