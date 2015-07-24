/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.BestList = Backbone.Collection.extend({
    // handles best results by country
    initialize: function () {
      wocdb.dispatcher.on("change:best", this.getBest, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapBestList);
    },

    url: function () {
      return wocdb.config.url + 'best/' + this.country + '/' + this.type + '/' + this.gender + '/' + this.race;
    },

    model: wocdb.Best,

    getBest : function (details) {
      this.country = details.country;
      this.type = details.type;
      this.gender = details.gender;
      this.race = details.race;
      wocdb.router.navigate('best/' + this.country + '/' + this.type + '/' + this.gender + '/' + this.race);
      this.fetch();
    }
  });
}());