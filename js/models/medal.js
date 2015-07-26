/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Medal = Backbone.Model.extend({
    initialize: function () {
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
      this.attributes.numericPosition = this.attributes.position;
      if (this.attributes.position < 4) {
        this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
      }
    }
  });
}());