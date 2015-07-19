/*global wocdb:false */
(function () {
  'use strict';
  var utils =  {
    getType: function (wocid) {
      if (wocid < 1000) {
        return "WOC";
      }
      return "JWOC";
    }
  };
  wocdb.utils = utils;
}());
