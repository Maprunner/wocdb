/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Runner = Backbone.Model.extend({
    initialize : function () {
      this.attributes.flag = wocdb.countries.getFlagFile(this.attributes.country);
    }
  });
}());