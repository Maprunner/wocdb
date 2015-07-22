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
      dropdown = "";
      dropdown = _.reduce(wocdb.config.countries, this.createDropdownHTML, "");
      this.$("#countries").empty().html(dropdown);
    },

    createDropdownHTML: function (html, country) {
      return html + "<li country='" + country + "'><a>" + country + "</a></li>";
    },

    render : function () {
      if (this.countryTable) {
        this.countryTable.destroy();
      }
      this.$("#country-header-text").empty().html("Runners for " + this.collection.models[0].attributes.country);
      this.$("#dropdown-country").empty().html(this.collection.models[0].attributes.country);
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
          // add personid to newly created row
          $(row).attr('personid', data.attributes.personid);
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
      var personid;
      wocdb.dispatcher.trigger("display:page", "person-page");
      personid = parseInt($(evt.currentTarget).attr('personid'), 10);
      wocdb.dispatcher.trigger("change:person", personid);
    },

    // click on row loads selected person
    selectCountry: function (evt) {
      var country;
      country = $(evt.currentTarget).attr('country').toLowerCase();
      this.collection.getRunnersByCountry("person", country);
    }
  });
}());
