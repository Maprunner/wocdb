/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultHeaderView = Backbone.View.extend({
    el : '#race-result-header',

    events : {
      'click #next-race-at-woc': 'showNextRace',
      'click #prev-race-at-woc': 'showPreviousRace'
    },

    initialize : function () {
      // update view once we have the data
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
    },

    template: _.template($('#race-header-tmpl').html()),

    render : function () {
      var model;
      if (this.collection.length) {
        model = this.collection.models[0].attributes;
        document.title = wocdb.utils.getType(model.wocid) + " " + model.year + " " + model.class + " " + model.race;
        $("#race-result-header-text").html(this.template(model));
      }
      return this;
    },

    showNextRace: function () {
      wocdb.dispatcher.trigger('click:showNextRaceAtWOC');
    },

    showPreviousRace: function () {
      wocdb.dispatcher.trigger('click:showPreviousRaceAtWOC');
    }
  });
}());
