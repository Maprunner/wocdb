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

    capitalise: function (text) {
      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
      return "";
    },

    getType: function (wocid) {
      if (wocid < 1000) {
        return "WOC";
      }
      return "JWOC";
    },

    getTypesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["WOC", "JWOC"], this.createTypeDropdownHTML, "");
      return dropdown;
    },

    createTypeDropdownHTML: function (html, type) {
      return html + "<li type='" + type + "'><a>" + type + "</a></li>";
    },

    getClassesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["Men", "Women", "Mixed"], this.createClassDropdownHTML, "");
      return dropdown;
    },

    createClassDropdownHTML: function (html, gender) {
      return html + "<li class='" + gender + "'><a>" + gender + "</a></li>";
    },

    getRacesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["Long", "Middle", "Sprint", "Relay", "SprintRelay"], this.createRaceDropdownHTML, "");
      return dropdown;
    },

    createRaceDropdownHTML: function (html, race) {
      return html + "<li race='" + race + "'><a>" + race + "</a></li>";
    },

    abbrevList: ["ARG", "AUS", "AUT", "AZE", "BAR", "BEL", "BLR", "BRA", "BUL", "CAN", "CHI", "CHN", "COL", "CRO", "CYP", "CZE", "DEN",
                    "ECU", "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GER", "GRE", "HKG", "HUN", "IRL", "ISR", "ITA", "JPN", "KAZ", "KOR",
                    "LAT", "LTU", "MDA", "MKD", "MNE", "NED", "NOR", "NZL", "POL", "POR", "PRK", "ROU", "RSA", "RUS", "SCG", "SLO", "SRB",
                    "SUI", "SVK", "SWE", "TPE", "TUR", "UKR", "URU", "USA"],

    filePrefix: ["ar", "au", "at", "az", "bb", "be", "by", "br", "bg", "ca", "cl", "cn", "co", "hr", "cy", "cz", "dk",
                 "ec", "es", "ee", "fi", "fr", "gb", "ge", "de", "gr", "hk", "hu", "ie", "il", "it", "jp", "kg", "kr",
                 "lv", "lt", "md", "mk", "me", "nl", "no", "nz", "pl", "pt", "kp", "ro", "za", "ru", "xx", "si", "rs",
                 "ch", "sk", "se", "tw", "tr", "ua", "uy", "us"],

    // passed in GBR, returns gb, to allow png flag file referencing
    getFlagFile: function (abbrev) {
      var index, prefix;
      prefix = "xx";
      index = this.abbrevList.indexOf(abbrev);
      if (index !== -1) {
        prefix = this.filePrefix[index];
      }
      return wocdb.config.url + 'img/' + prefix + '.png';
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
