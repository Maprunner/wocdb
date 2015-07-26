/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.RunnersView = Backbone.View.extend({
    el : '#country-page',

    events: {
      'click #country-table tbody tr': 'selectPerson',
      'click #countries li': 'selectCountry'
    },

    //headerTemplate: _.template($('#person-header-tmpl').html()),

    initialize : function () {
      var dropdown;
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:runners', this.render, this);
      dropdown = wocdb.countries.getCountriesDropdown("");
      this.$("#countries").empty().html(dropdown);
    },

    render : function () {
      if (this.countryTable) {
        this.countryTable.destroy();
      }
      this.$("#country-header-text").empty().html("Runners for " + this.collection.models[0].attributes.country);
      this.$("#dropdown-country").empty().html(this.collection.models[0].attributes.country + ' <span class="caret">');
      //text = 'Results by Country : The database tries to merge people who have run under several names into a single person. \
      //        Search by Name to see all known name variations (Yvette Hague and Yvette Baker as two separate entries),
      //        or by Person to see merged information (Yvette Hague as a single entry, including all other known name variations).
      this.countryTable = $('#country-table').empty().DataTable({
        data : this.collection.models,
        columns : [{
          "data" : function (row) {
            return row.get("name");
          },
          "title" : "Name"
        }, {
          "data" : function (row) {
            return row.get("country");
          },
          "title" : "Country"
        }, {
          "data" : function (row) {
            return "<img src='" + row.get("flag") + "'>";
          },
          "title" : ""
        }, {
          "data" : function (row) {
            return row.get("personid");
          },
          "title" : "Personid"
        }, {
          "data" : function (row) {
            return row.get("nameid");
          },
          "title" : "Nameid"
        }, {
          "data" : function (row) {
            return row.get("woc");
          },
          "title" : "WOCs"
        }, {
          "data" : function (row) {
            return row.get("jwoc");
          },
          "title" : "JWOCs"
        }],
        "createdRow": function (row, data) {
          // add plainname to newly created row
          $(row).attr('plainname', data.attributes.plainname);
        },
        "lengthMenu" : [[20, 50, 100, -1], [20, 50, 100, "All"]],
        "order" : [0, 'asc'],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [1, 3, 4, 5, 6]
        }]
      });
    },

    // click on row loads selected person
    selectPerson: function (evt) {
      var plainname;
      wocdb.dispatcher.trigger("display:page", "person-page");
      plainname = $(evt.currentTarget).attr('plainname');
      wocdb.dispatcher.trigger("change:person", plainname);
    },

    // click on row loads selected country
    selectCountry: function (evt) {
      var country;
      country = $(evt.currentTarget).attr('country').toLowerCase();
      this.collection.getRunnersByCountry("person", country);
    }
  });
}());
