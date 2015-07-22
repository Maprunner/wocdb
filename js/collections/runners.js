/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.Runners = Backbone.Collection.extend({
    // handles get runner by country
    // type is name or person for get by nameid or personid
    initialize: function () {
      wocdb.dispatcher.on("change:person", this.getPerson, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapRunners);
      if (this.length > 0) {
        this.personid = this.models[0].personid;
        this.type = "person";
      } else {
        this.type = "person";
        this.personid = "gbr";
      }
    },

    url: function () {
      return wocdb.config.url + 'runners/' + this.type + '/' + this.country;
    },

    model: wocdb.Runner,

    getRunnersByCountry : function (type, country) {
      this.reset();
      this.country = country;
      this.type = type;
      wocdb.router.navigate('runners/' + this.type + '/' + this.country);
      this.fetch();
    }
  });
}());