/*global wocdb:false */
(function () {
  'use strict';
  // holds details of the WOC currently being displayed on the WOC summary page
  wocdb.ActiveWOC = Backbone.Model.extend({
    initialize : function () {
      wocdb.dispatcher.on('change:activeWOC', this.setActiveWOC, this);
    },

    setActiveWOC: function (details) {
      // save details for new WOC to display
      this.set(details);
    }
  });
}());