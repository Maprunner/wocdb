/*global wocdb:false  */
(function () {
  'use strict';

  wocdb.Country = Backbone.Model.extend({
  });

  wocdb.Countries = Backbone.Collection.extend({
    model: wocdb.Country,

    getCountriesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce(this.models, this.createCountryDropdownHTML, startHTML);
      return dropdown;
    },

    createCountryDropdownHTML: function (html, model) {
      return html + "<li country='" + model.attributes.abbr + "'><a>" + model.attributes.abbr + "</a></li>";
    }

  });

}());