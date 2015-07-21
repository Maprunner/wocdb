/*global wocdb:false */
(function () {
  'use strict';

  wocdb.Wocs = Backbone.Collection.extend({
    initialize: function () {
      this.activeWOCIndex = null;
      wocdb.dispatcher.on('click:showWOCID', this.setActiveWOCID, this);
      wocdb.dispatcher.on('click:showNextWOC', this.showNextWOC, this);
      wocdb.dispatcher.on('click:showPreviousWOC', this.showPreviousWOC, this);
      wocdb.dispatcher.on('startup:race', this.setActiveWOCAtStart, this);
      this.reset(wocdb.config.bootstrapWocs);
      this.createRaceCollection();
    },

    model: wocdb.Woc,

    setActiveWOCID: function (details) {
      var model, info;
      model = this.findWhere({id: details.wocid});
      this.activeWocIndex = this.indexOf(model);
      info = this.models[this.activeWocIndex].attributes;
      info.startUpRaceID = details.raceid;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    setActiveWOCAtStart: function (details) {
      var model, info;
      model = this.findWhere({type: details.type, year: details.year});
      this.activeWocIndex = this.indexOf(model);
      info = this.models[this.activeWocIndex].attributes;
      info.startUpRaceID = details.raceid;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    setActiveWOCIndex: function (index) {
      var info;
      this.activeWOCIndex = index;
      info = this.models[index].attributes;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    // Next and Previous look backwards, but it is because of the sort order (year descending) in the initial data
    showPreviousWOC: function () {
      var index;
      index = this.activeWOCIndex + 1;
      if (index >= this.models.length) {
        index = 0;
      }
      this.setActiveWOCIndex(index);
    },

    showNextWOC: function () {
      var index;
      index = this.activeWOCIndex - 1;
      if (index < 0) {
        index = this.models.length - 1;
      }
      this.setActiveWOCIndex(index);
    },

    createRaceCollection: function () {
      // extracts a list of races from the WOC collection: could get via JSON or include in bootstrap data in future
      var race, attr, i, j;
      wocdb.races.reset();
      for (i = 0; i < this.models.length; i += 1) {
        attr = this.models[i].attributes;
        for (j = 0; j < attr.raceids.length; j += 1) {
          race = {"year": attr.year, "type": attr.type, "wocid": attr.id, "gender": attr.classes[j], "raceid": attr.raceids[j], "race": attr.races[j]};
          wocdb.races.add(race);
        }
      }
    }

  });
}());