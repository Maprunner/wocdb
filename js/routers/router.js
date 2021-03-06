/*global wocdb:false */
(function () {
  'use strict';
  wocdb.WocdbRouter = Backbone.Router.extend({
    routes: {
      "wocdb": "showAllWocs",
      "woc/:year/:gender/:race": "getWOCResult",
      "jwoc/:year/:gender/:race": "getJWOCResult",
      "person/:person": "getPerson",
      "runners/:type/:country": "getRunnersByCountry",
      "medals/:group/:type/:class/:race": "getMedals",
      "best/:country/:type/:class/:race": "getBestResults",
      "person": "nameSearch",
      "*other": "showAllWocs"
    },

    nameSearch: function () {
      wocdb.person.searchName();
      wocdb.dispatcher.trigger("display:page", "person-page");
    },

    getBestResults: function (country, type, gender, race) {
      wocdb.bestlist.getBest({"country": country, "type": type, "gender": gender, "race": race});
      wocdb.dispatcher.trigger("display:page", "best-page");
    },

    getMedals: function (group, type, gender, race) {
      wocdb.medals.getMedals({"group": group, "type": type, "gender": gender, "race": race});
      wocdb.dispatcher.trigger("display:page", "medal-page");
    },

    getPerson: function (person) {
      wocdb.person.getPerson(person);
      wocdb.dispatcher.trigger("display:page", "person-page");
    },

    getRunnersByCountry: function (type, country) {
      wocdb.runners.getRunnersByCountry(type, country);
      wocdb.dispatcher.trigger("display:page", "country-page");
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
