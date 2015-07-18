/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultView = Backbone.View.extend({
    el : '#result-table',

    initialize : function () {
      // create view once we have the data
      //this.listenTo(this.collection, 'sync', this.render);
      wocdb.dispatcher.on('change:raceid', this.render, this);
    },

    render : function () {
      var i, view;
      this.$el.empty();
      if (this.collection.length > 0) {
        for (i = 0; i < this.collection.length; i += 1) {
          view = new wocdb.ResultView({model: this.collection.at(i)});
          this.$el.append(view.$el);
          view.render();
        }
      } else {
        this.$el.append('No records found.');
      }
      return this;
    }

  });
}());
