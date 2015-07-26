/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.Medals = Backbone.Collection.extend({
    // handles best results by country
    initialize: function () {
      wocdb.dispatcher.on("change:medals", this.getMedals, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapMedals);
    },

    url: function () {
      return wocdb.config.url + 'medals/' + this.group + '/' + this.type + '/' + this.gender + '/' + this.race;
    },

    model: wocdb.Medal,

    getMedals : function (details) {
      this.group = details.group;
      this.type = details.type;
      this.gender = details.gender;
      this.race = details.race;
      wocdb.router.navigate('medals/' + this.group + '/' + this.type + '/' + this.gender + '/' + this.race);
      this.fetch();
    }
  });
}());