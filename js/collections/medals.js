/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.Medals = Backbone.Collection.extend({
    // handles best results by country
    initialize: function () {
      wocdb.dispatcher.on("change:medals", this.getMedals, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapMedals);
    },

    url: function () {
      return wocdb.config.url + 'medals/' + this.group + '/' + this.type + '/' + this.gender + '/' + this.race;
    },

    model: wocdb.Medal,

    getMedals : function (details) {
      this.group = details.group;
      this.type = details.type;
      this.gender = details.gender;
      this.race = details.race;
      wocdb.router.navigate('medals/' + this.group + '/' + this.type + '/' + this.gender + '/' + this.race);
      this.fetch({reset: true});
    },

    // looks through a colletion of medal winners and generates a G:S:B count
    // which would be easy but you need to avoid counting relay medals more than once...
    // but multiple medals in individual races do count so you can't just filter on unique raceid...
    getMedalCount : function () {
      var medals;
      medals = {G: 0, S: 0, B: 0, relayids: []};
      medals = _.reduce(this.models, function (medals, model) {
        var pos, raceid, countThis;
        countThis = false;
        pos = parseInt(model.attributes.numericPosition, 10);
        // shoud only a winners but we might call it from somewhere else later
        if (pos < 4) {
          // finals 4 and 5 are relays
          if (parseInt(model.attributes.final, 10) > 3) {
            raceid = parseInt(model.attributes.raceid, 10);
            // only count if we haven't counted this raceid already'
            if (_.indexOf(medals.relayids, raceid) === -1) {
              medals.relayids.push(raceid);
              countThis = true;
            }
          } else {
            // count all individual races
            countThis = true;
          }
        }
        if (countThis) {
          if (pos === 1) {
            medals.G += 1;
          } else if (pos === 2) {
            medals.S += 1;
          } else {
            medals.B += 1;
          }
        }
        return medals;
      }, medals);
      medals.total = medals.G + medals.S + medals.B;
      return medals;
    }
  });
}());