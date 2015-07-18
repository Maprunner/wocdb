/*global wocdb:false */
(function () {
  'use strict';

  wocdb.ActiveWOCView = Backbone.View.extend({
    el: '#woc-summary-table',

    events: {
      'click #next-woc': 'showNextWOC',
      'click #prev-woc': 'showPreviousWOC'
    },

    summaryTemplate: _.template($('#woc-summary-tmpl').html()),

    initialize: function () {
      $('#single-woc-page').hide();
      this.listenTo(this.model, 'change', this.render);
    },

    showNextWOC: function () {
      wocdb.dispatcher.trigger('click:showNextWOC');
    },

    showPreviousWOC: function () {
      wocdb.dispatcher.trigger('click:showPreviousWOC');
    },

    render: function () {
      // fill in summary info
      $("#single-woc-page").show();
      this.$el.html(this.summaryTemplate(this.model.attributes));
      return this;
    }

  });
}());
