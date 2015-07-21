/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.Person = Backbone.Collection.extend({
    initialize: function () {
      wocdb.dispatcher.on("change:person", this.getPerson, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapPerson);
      if (this.length > 0) {
        this.personid = this.models[0].personid;
      } else {
        this.personid = null;
      }
    },

    url: function () {
      return wocdb.config.url + 'person/' + this.personid;
    },

    model: wocdb.Result,

    getPerson : function (person) {
      this.reset();
      this.personid = person;
      wocdb.router.navigate('person/' + this.personid);
      this.fetch();
    }
  });
}());