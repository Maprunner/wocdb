/*global wocdb:false */
(function () {
  'use strict';
  wocdb.MasterView = Backbone.View.extend({
    el : '#wocdb-container',

    pages: ['all-wocs-page', 'single-woc-page', 'person-page', 'country-page', 'best-page'],

    initialize : function () {
      wocdb.dispatcher.on('display:page', this.setPageVisibility, this);
    },

    setPageVisibility: function (page) {
      // display requested page and hide all others
      _.each(this.pages, this.setDisplay, page);
    },

    setDisplay: function (testPage) {
      var displayType;
      // this comes in as the page name we have been asked to display
      if (testPage === this) {
        displayType = "block";
      } else {
        displayType = "none";
      }
      $('#' + testPage).css("display", displayType);
    }

  });
}());
