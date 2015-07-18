/*global wocdb:false */
(function () {
  'use strict';

  wocdb.Races = Backbone.Collection.extend({
    model: wocdb.Race,

    getRaceInfo: function (raceid) {
      var model;
      model = this.findWhere({"raceid": raceid});
      return model.attributes;
    },

    getRaceID: function (type, year, gender, race) {
      var model;
      // careful with case of arguments
      // type comes in as WOC or JWOC, but gender and race are lower case 
      model = this.findWhere({"type": type, "year": parseInt(year, 10), "genderLowerCase": gender, "raceLowerCase": race});
      if (model) {
        return model.attributes.raceid;
      }
      return 0;
    }

  });
}());