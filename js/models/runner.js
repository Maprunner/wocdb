/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Runner = Backbone.Model.extend({
    initialize : function () {
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
    }
  });
}());