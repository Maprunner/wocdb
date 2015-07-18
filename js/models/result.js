/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Result = Backbone.Model.extend({
    abbrevList: ["ARG", "AUS", "AUT", "AZE", "BAR", "BEL", "BLR", "BRA", "BUL", "CAN", "CHI", "CHN", "COL", "CRO", "CYP", "CZE", "DEN",
                    "ECU", "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GER", "GRE", "HKG", "HUN", "IRL", "ISR", "ITA", "JPN", "KAZ", "KOR",
                    "LAT", "LTU", "MDA", "MKD", "MNE", "NED", "NOR", "NZL", "POL", "POR", "PRK", "ROU", "RSA", "RUS", "SCG", "SLO", "SRB",
                    "SUI", "SVK", "SWE", "TPE", "TUR", "UKR", "URU", "USA"],
    filePrefix: ["ar", "au", "at", "az", "bb", "be", "by", "br", "bg", "ca", "cl", "cn", "co", "hr", "cy", "cz", "dk",
                 "ec", "es", "ee", "fi", "fr", "gb", "ge", "de", "gr", "hk", "hu", "ie", "il", "it", "jp", "kg", "kr",
                 "lv", "lt", "md", "mk", "me", "nl", "no", "nz", "pl", "pt", "kp", "ro", "za", "ru", "xx", "si", "rs",
                 "ch", "sk", "se", "tw", "tr", "ua", "uy", "us"],

    initialize : function () {
      var flagFile = this.getFlagFile(this.attributes.country);
      this.attributes.flag = wocdb.config.url + 'img/' + flagFile + '.png';
      if (this.attributes.final > 0) {
        if (this.attributes.position < 4) {
          this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
        }
      }
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    },
    getFlagFile: function (abbrev) {
      var index;
      index = this.abbrevList.indexOf(abbrev);
      if (index !== -1) {
        return this.filePrefix[index];
      }
      return "xx";
    }
  });
}());