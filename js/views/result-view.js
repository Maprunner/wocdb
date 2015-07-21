/*global wocdb:false */
(function () {
  'use strict';

  wocdb.ResultView = Backbone.View.extend({
    model: wocdb.Result,
    tagName: 'tr',

    template: _.template($('#race-result-tmpl').html()),

    render: function () {
      this.$el.html(this.template(this.model.attributes)).attr('id', this.model.attributes.personid);
      return this;
    }
  });
}());
