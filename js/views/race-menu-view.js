/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceMenuView = Backbone.View.extend({
    el: '#race-nav-list',

    events: {
    },

    menuTemplate: _.template($('#race-menu-tmpl').html()),

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      wocdb.dispatcher.on('change:raceid', this.setNewRaceID, this);
      this.oldRaceID = null;
    },

    render: function () {
      var i, data;
      // set up menu for race selection
      data = this.model.attributes;
      this.$el.empty();
      for (i = 0; i < data.races.length; i += 1) {
        this.$el.append(this.menuTemplate({type: data.type, year: data.year, gender: data.classes[i], race: data.races[i], raceid: data.raceids[i]}));
      }
      // get round a race condition on start-up with an active race
      if (this.oldRaceID) {
        this.$('#' + this.oldRaceID).addClass('active');
      }
      return this;
    },

    setNewRaceID: function (raceid) {
      if (this.oldRaceID) {
        this.$('#' + this.oldRaceID).removeClass('active');
      }
      this.$('#' + raceid).addClass('active');
      this.oldRaceID = raceid;
    }

  });
}());
