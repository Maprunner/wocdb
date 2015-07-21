/*global wocdb:false */
(function () {
  'use strict';
  wocdb.WocdbRouter = Backbone.Router.extend({
    routes: {
      "wocdb": "showAllWocs",
      "woc/:year/:gender/:race": "getWOCResult",
      "jwoc/:year/:gender/:race": "getJWOCResult",
      "person/:person": "getPerson",
      "*other": "showAllWocs"
    },

    getPerson: function (person) {
      this.getPerson(person);
      wocdb.dispatcher.trigger("display:page", "person-page");
    },

    getWOCResult: function (year, gender, race) {
      this.getResult("WOC", year, gender, race);
    },

    getJWOCResult: function (year, gender, race) {
      this.getResult("JWOC", year, gender, race);
    },

    getResult: function (type, year, gender, race) {
      var raceid;
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      raceid = wocdb.races.getRaceID(type, year, gender, race);
      wocdb.raceResult.getResultByRaceID(raceid);
    },

    showAllWocs: function () {
      document.title = "Maprunner WOC Database";
      wocdb.dispatcher.trigger("display:page", "all-wocs-page");
    }
  });
}());
