/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultView = Backbone.View.extend({
    el : '#result-table',

    events: {
      'click tr': 'selectPerson'
    },

    initialize : function () {
      // create view once we have the data
      //this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
    },

    render : function () {
      var i, view;
      this.$el.empty().html("<thead><th>Pos</th><th>Name</th><th>Country</th><th></th><th>Time</th><th>% down</th></thead>");
      if (this.collection.length > 0) {
        for (i = 0; i < this.collection.length; i += 1) {
          view = new wocdb.ResultView({model: this.collection.at(i)});
          this.$el.append(view.$el);
          view.render();
        }
      } else {
        this.$el.append('No records found.');
      }
      // attach events to new set of results
      this.delegateEvents();
      return this;
    },

    // click on row loads selected person
    selectPerson: function (evt) {
      var index;
      wocdb.dispatcher.trigger("display:page", "person-page");
      index = parseInt(evt.currentTarget.id, 10);
      wocdb.dispatcher.trigger('change:person', index);
    }
  });
}());
