/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Race = Backbone.Model.extend({
    initialize: function () {
      // urls are all lower case so this make url handling a bit easier
      this.set('raceLowerCase', this.attributes.race.toLowerCase());
      this.set('genderLowerCase', this.attributes.gender.toLowerCase());
    }
  });
}());