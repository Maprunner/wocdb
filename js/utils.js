/*global wocdb:false */
/*global location */
(function () {
  'use strict';
  var utils =  {

    getVenue: function (wocid) {
      var model;
      model = wocdb.wocs.findWhere({"id": parseInt(wocid, 10)});
      if (model) {
        return model.attributes.country;
      }
      return "";
    },

    getRaceLink: function (raceid) {
      var model;
      model = wocdb.races.findWhere({"raceid": parseInt(raceid, 10)});
      if (model) {
        return model.attributes.link;
      }
      return "";
    },

    capitalise: function (text) {
      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
      return "";
    },

    getType: function (wocid) {
      if (parseInt(wocid, 10) < 1000) {
        return "WOC";
      }
      return "JWOC";
    },

    getGroupByDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "By person", value: "person"}, {text: "By country", value: "country"}], this.createGroupByDropdownHTML, startHTML);
      dropdown = wocdb.countries.getCountriesDropdown(dropdown);
      return dropdown;
    },

    createGroupByDropdownHTML: function (html, type) {
      return html + "<li country='" + type.value + "'><a>" + type.text + "</a></li>";
    },

    getTypesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "WOC", value: "woc"}, {text: "JWOC", value: "jwoc"}], this.createTypeDropdownHTML, startHTML);
      return dropdown;
    },

    createTypeDropdownHTML: function (html, type) {
      return html + "<li type='" + type.value + "'><a>" + type.text + "</a></li>";
    },

    getClassesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "Men", value: "men"}, {text: "Women", value: "women"}, {text: "Mixed", value: "mixed"}], this.createClassDropdownHTML, startHTML);
      return dropdown;
    },

    createClassDropdownHTML: function (html, gender) {
      return html + "<li class='" + gender.value + "'><a>" + gender.text + "</a></li>";
    },

    getRacesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "Long", value: "long"}, {text: "Middle", value: "middle"}, {text: "Sprint", value: "sprint"}, {text: "Relay", value: "relay"},
                    {text: "Sprint Relay", value: "sprintrelay"}], this.createRaceDropdownHTML, startHTML);
      return dropdown;
    },

    createRaceDropdownHTML: function (html, race) {
      return html + "<li race='" + race.value + "'><a>" + race.text + "</a></li>";
    },

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    // See https://gist.github.com/tbranyen/1142129
    hijackLinks: function () {
      $(document).on("click", "a[href]:not([data-bypass])", function (evt) {
        var href, root;
        // Get the absolute anchor href.
        href = {
          prop : $(this).prop("href"),
          attr : $(this).attr("href")
        };
        // Get the absolute root.
        root = location.protocol + "//" + location.host + '/wocdb';

        // Ensure the root is part of the anchor href, meaning it's relative.
        if (href.prop.slice(0, root.length) === root) {
          // Stop the default event to ensure the link will not cause a page
          // refresh.
          evt.preventDefault();
          wocdb.router.navigate(href.attr, true);
        }
      });
    }
  };
  wocdb.utils = utils;

}());
