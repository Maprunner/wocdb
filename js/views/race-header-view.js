/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultHeaderView = Backbone.View.extend({
    el : '#race-result-header',

    events : {
      'click #next-race-at-woc': 'showNextRace',
      'click #prev-race-at-woc': 'showPreviousRace',
      'click #map-link': 'showMap'
    },

    initialize : function () {
      this.raceID = null;
      // update view once we have the data
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
      wocdb.dispatcher.on('change:raceid', this.setRaceID, this);
    },

    template: _.template($('#race-header-tmpl').html()),

    render : function () {
      var model;
      if (this.collection.length) {
        model = this.collection.models[0].attributes;
        model.link = wocdb.utils.getRaceLink(this.raceID);
        document.title = wocdb.utils.getType(model.wocid) + " " + model.year + " " + model.class + " " + model.race;
        $("#race-result-header-text").html(this.template(model));
      }
      return this;
    },

    setRaceID: function (id) {
      this.raceID = id;
    },

    showMap: function () {
      window.open(wocdb.utils.getRaceLink(this.raceID));
    },

    showNextRace: function () {
      wocdb.dispatcher.trigger('click:showNextRaceAtWOC');
    },

    showPreviousRace: function () {
      wocdb.dispatcher.trigger('click:showPreviousRaceAtWOC');
    }
  });
}());
