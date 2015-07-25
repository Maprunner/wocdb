/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Best = Backbone.Model.extend({
    initialize: function () {
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
      this.attributes.venue = wocdb.utils.getVenue(this.attributes.wocid);
      // keep numeric copy of position to allow sorting
      this.attributes.numericPosition = this.attributes.position;
      // best only used for finals so don't need to check for qualifiers'
      if (this.attributes.position < 4) {
        this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
      }
      this.attributes.percentdown = parseFloat(this.attributes.percentdown).toFixed(1);
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    }
  });
}());