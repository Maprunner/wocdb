/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.BestView = Backbone.View.extend({
    el : '#best-page',

    events: {
      'click #best-table tbody tr': 'selectPerson',
      'click #countries li': 'selectCountry',
      'click #races li': 'selectRace',
      'click #classes li': 'selectClass',
      'click #types li': 'selectType',
      'click #best-submit': 'getNewResults'
    },

    //headerTemplate: _.template($('#person-header-tmpl').html()),

    initialize : function () {
      var dropdown;
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:best', this.render, this);
      // add "ALL" as first entry in list
      dropdown = wocdb.countries.getCountriesDropdown("<li country='all'><a>All countries</a></li>");
      this.$("#countries").empty().html(dropdown);
      dropdown = wocdb.utils.getRacesDropdown("");
      this.$("#races").empty().html(dropdown);
      dropdown = wocdb.utils.getTypesDropdown("");
      this.$("#types").empty().html(dropdown);
      dropdown = wocdb.utils.getClassesDropdown("");
      this.$("#classes").empty().html(dropdown);
    },

    initializeFromURL: function () {
      var url, bits;
      url = document.URL;
      bits = url.split("/");
      if (bits.length > 5) {
        this.setCountry(bits[bits.length - 4]);
        this.setType(bits[bits.length - 3]);
        this.setClass(bits[bits.length - 2]);
        this.setRace(bits[bits.length - 1]);
      }
    },

    render : function () {
      this.initializeFromURL();
      if (this.bestTable) {
        this.bestTable.destroy();
      }
      this.renderHeader();
      this.bestTable = $('#best-table').empty().DataTable({
        data : this.collection.models,
        columns : [{
          "data" : function (row) {
            return row.get("name");
          },
          "title" : "Name",
          "width": "20%"
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
            return row.get("numericPosition");
          },
          "title" : "Position",
          "render": function (data, type) {
            if (type === 'display') {
              if (data < 4) {
                return '<img src="' + wocdb.config.url + 'img/' + data + '.svg">';
              }
              if (data === 999) {
                return "-";
              } else if (data === 998) {
                return "nc";
              }
            }
            return data;
          }
        }, {
          "data" : function (row) {
            return row.get("year");
          },
          "title" : "Year"
        }, {
          "data" : function (row) {
            return row.get("venue");
          },
          "title" : "Venue"
        }, {
          "data" : {
            "_": function (row) {
              return row.get("time");
            },
            "sort": function (row) {
              return parseInt(row.get("seconds"), 10);
            }
          },
          "title" : "Time",
          "type": "num"
        }, {
          "data" : function (row) {
            return row.get("percentdown");
          },
          "title" : "% down"
        }],
        "createdRow": function (row, data) {
          // add personid to newly created row
          $(row).attr('plainname', data.attributes.plainname);
        },
        "lengthMenu" : [[20, 50, 100, -1], [20, 50, 100, "All"]],
        "order" : [1, 'asc'],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [1, 2, 3, 4, 6, 7]
        }]
      });
    },

    renderHeader: function () {
      var text;
      if (this.country === "all") {
        text = "Best result by Country for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race);
      } else {
        text = "Best results for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race) + " : " + wocdb.countries.getName(this.country);
      }
      this.$("#best-header-text").empty().html(text);
    },

    // submit button
    getNewResults: function () {
      wocdb.dispatcher.trigger("change:best", {country: this.country, type: this.type, gender: this.gender, race: this.race});
    },

    // click on row in table loads selected person
    selectPerson: function (evt) {
      var name;
      wocdb.dispatcher.trigger("display:page", "person-page");
      name = $(evt.currentTarget).attr('plainname');
      wocdb.dispatcher.trigger("change:person", name);
    },

    selectClass: function (evt) {
      this.setClass($(evt.currentTarget).attr('class'));
    },

    setClass: function (gender) {
      this.gender = gender.toLowerCase();
      this.$("#dropdown-class").empty().html(wocdb.utils.capitalise(this.gender) + '<span class="caret">');
    },

    selectType: function (evt) {
      this.setType($(evt.currentTarget).attr('type'));
    },

    setType: function (type) {
      this.type = type.toLowerCase();
      this.$("#dropdown-type").empty().html(this.type.toUpperCase() + '<span class="caret">');
    },

    selectRace: function (evt) {
      this.setRace($(evt.currentTarget).attr('race'));
    },

    setRace: function (race) {
      this.race = race.toLowerCase();
      this.$("#dropdown-race").empty().html(wocdb.utils.capitalise(this.race) + '<span class="caret">');
    },

    selectCountry: function (evt) {
      this.setCountry($(evt.currentTarget).attr('country'));
    },

    setCountry: function (country) {
      var text;
      this.country = country.toLowerCase();
      text = this.country === "all" ? "All countries" : this.country.toUpperCase();
      this.$("#dropdown-country").empty().html(text + '<span class="caret">');
    }
  });
}());
