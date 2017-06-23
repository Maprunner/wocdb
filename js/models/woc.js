/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Woc = Backbone.Model.extend({
    initialize : function () {
      this.attributes.type  = this.attributes.type === "W" ? "WOC" : "JWOC";
      this.attributes.raceids = this.attributes.raceids.split(",").map(function (n) {
        return parseInt(n, 10);
      });
      this.attributes.classes = this.attributes.classes.split(",");
      this.attributes.races = this.attributes.races.split(",");
      this.attributes.links = this.attributes.links.split(",");
    }
  });
}());