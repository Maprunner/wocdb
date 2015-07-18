/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.RaceResult = Backbone.Collection.extend({
    initialize: function () {
      wocdb.dispatcher.on('change:activeWOC', this.setRaceAtWOC, this);
      wocdb.dispatcher.on('click:showNextRaceAtWOC', this.getNextRaceAtWOC, this);
      wocdb.dispatcher.on('click:showPreviousRaceAtWOC', this.getPreviousRaceAtWOC, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapRaceResult);
      this.listenTo(this, 'update', this.announceNewRaceID);
      this.raceIndex = null;
      this.active = {};
    },

    url: function () {
      return wocdb.config.url + this.active.type.toLowerCase() + '/' + this.active.year + '/' + this.active.classes[this.raceIndex].toLowerCase() +
        '/' + this.active.races[this.raceIndex].toLowerCase();
    },

    model: wocdb.Result,

    announceNewRaceID: function () {
      wocdb.router.navigate(this.active.type.toLowerCase() + '/' + this.active.year + '/' + this.active.classes[this.raceIndex].toLowerCase() +
        '/' + this.active.races[this.raceIndex].toLowerCase());
      wocdb.dispatcher.trigger('change:raceid', this.active.raceids[this.raceIndex]);
    },

    setRaceAtWOC: function (details) {
      this.raceIndex = 0;
      this.active = details;
      if (details.startUpRaceID) {
        this.raceIndex = _.indexOf(details.raceids, details.startUpRaceID);
        if (this.raceIndex === -1) {
          this.raceIndex = 0;
        }
        this.announceNewRaceID();
      } else {
        this.reset();
        this.fetch();
      }
    },

    getPreviousRaceAtWOC: function () {
      this.reset();
      this.raceIndex -= 1;
      if (this.raceIndex < 0) {
        this.raceIndex = this.active.races.length - 1;
      }
      this.fetch();
    },

    getNextRaceAtWOC: function () {
      this.reset();
      this.raceIndex += 1;
      if (this.raceIndex >= this.active.races.length) {
        this.raceIndex = 0;
      }
      this.fetch();
    },

    getResultByRaceID : function (raceid) {
      this.reset();
      this.raceIndex = _.indexOf(this.active.raceids, raceid);
      if (this.raceIndex === -1) {
        this.raceIndex = 0;
      }
      this.fetch();
    }
  });
}());