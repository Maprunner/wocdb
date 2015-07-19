/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Result = Backbone.Model.extend({

    initialize : function () {
      var flagFile = wocdb.utils.getFlagFile(this.attributes.country);
      this.attributes.flag = wocdb.config.url + 'img/' + flagFile + '.png';
      if (this.attributes.final > 0) {
        if (this.attributes.position < 4) {
          this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
        }
      }
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    }

  });
}());