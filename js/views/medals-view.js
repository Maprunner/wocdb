/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.MedalsView = Backbone.View.extend({
    el : '#medal-page',

    events: {
      'click #medal-table tbody tr': 'selectFromTable',
      'click #groups li': 'selectGroup',
      'click #races li': 'selectRace',
      'click #classes li': 'selectClass',
      'click #types li': 'selectType',
      'click #medal-submit': 'getNewResults'
    },

    initialize : function () {
      var dropdown;
      this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.collection, 'reset', this.render);
      wocdb.dispatcher.on('startup:medal', this.render, this);
      dropdown = wocdb.utils.getGroupByDropdown("");
      this.$("#groups").empty().html(dropdown);
      dropdown = wocdb.utils.getRacesDropdown("<li race='all'><a>All races</a></li>");
      this.$("#races").empty().html(dropdown);
      dropdown = wocdb.utils.getTypesDropdown("<li type='all'><a>WOC and JWOC</a></li>");
      this.$("#types").empty().html(dropdown);
      dropdown = wocdb.utils.getClassesDropdown("<li class='all'><a>All classes</a></li>");
      this.$("#classes").empty().html(dropdown);
    },

    initializeFromURL: function () {
      var url, bits;
      url = document.URL;
      bits = url.split("/");
      if (bits.length > 5) {
        this.setGroup(bits[bits.length - 4]);
        this.setType(bits[bits.length - 3]);
        this.setClass(bits[bits.length - 2]);
        this.setRace(bits[bits.length - 1]);
      }
    },

    render : function () {
      this.initializeFromURL();
      if (this.medalTable) {
        this.medalTable.destroy();
      }
      this.renderHeader();
      if ((this.group === "person") || (this.group === "country")) {
        this.renderPersonCountryTable();
      } else {
        this.renderMedallistTable();
      }
    },

    renderHeader: function () {
      var text;
      if ((this.group === "person") ||  (this.group === "country")) {
        text = "Medal table by person for" + this.getHeaderText();
      } else {
        text = "Medallists for " + wocdb.countries.getName(this.group) + this.getHeaderText() + this.getMedalCount();
      }
      this.$("#medal-header-text").empty().html(text);
    },

    getHeaderText: function () {
      var text;
      text = ": ";
      if (this.type === "all") {
        text += "WOC and JWOC : ";
      } else {
        text += this.type.toUpperCase() + " : ";
      }
      if (this.gender === "all") {
        text += "All classes : ";
      } else {
        text += wocdb.utils.capitalise(this.gender) + " : ";
      }
      if (this.race === "all") {
        text += "All races.  ";
      } else {
        text += wocdb.utils.capitalise(this.race) + ".  ";
      }
      return text;
    },

    getMedalCount: function () {
      var medals;
      medals = this.collection.getMedalCount();
      return "Gold: " + medals.G + " : Silver: " + medals.S + " : Bronze: " + medals.B + ": Total: " + medals.total + ".";
    },

    renderPersonCountryTable: function () {
      this.medalTable = $('#medal-table').empty().DataTable({
        data : this.collection.models,
        columns : [{
          "data" : function (row) {
            if (row.get("name")) {
              return row.get("name");
            }
            return wocdb.countries.getName(row.get("country"));
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
            return row.get("G");
          },
          "title" : "Gold"
        }, {
          "data" : function (row) {
            return row.get("S");
          },
          "title" : "Silver"
        }, {
          "data" : function (row) {
            return row.get("B");
          },
          "title" : "Bronze"
        }, {
          "data" : function (row) {
            return row.get("total");
          },
          "title" : "Total"
        }],
        "createdRow": function (row, data) {
          // add personid to newly created row
          if (this.group === "person") {
            $(row).attr('plainname', data.attributes.plainname);
          } else {
            $(row).attr('country', data.attributes.country.toLowerCase());
          }
        },
        "lengthMenu" : [[20, 50, 100, -1], [20, 50, 100, "All"]],
        "order" : [[6, 'desc'], [3, 'desc'], [4, 'desc'], [5, 'desc']],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [1, 2, 3, 4, 5, 6]
        }]
      });
    },

    renderMedallistTable: function () {
      this.medalTable = $('#medal-table').empty().DataTable({
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
            return wocdb.utils.getType(row.get("wocid"));
          },
          "title" : "Event"
        }, {
          "data" : function (row) {
            return wocdb.utils.getVenue(row.get("wocid"));
          },
          "title" : "Venue"
        }, {
          "data" : function (row) {
            return row.get("race");
          },
          "title" : "Race"
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
        }],
        "createdRow": function (row, data) {
          $(row).attr('plainname', data.attributes.plainname);
        },
        "lengthMenu" : [[20, 50, 100, -1], [20, 50, 100, "All"]],
        "order" : [[3, 'asc'], [4, 'desc'], [6, 'asc']],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [1, 2, 3, 4, 5, 7, 8]
        }]
      });
    },

    // submit button
    getNewResults: function () {
      wocdb.dispatcher.trigger("change:medals", {group: this.group, type: this.type, gender: this.gender, race: this.race});
    },

    // click on row in table loads selected person
    //think about what to do with click on country
    selectFromTable: function (evt) {
      var name;
      if (this.group === "country") {
        this.group = $(evt.currentTarget).attr('country');
        wocdb.dispatcher.trigger("change:medals", {group: this.group, type: this.type, gender: this.gender, race: this.race});
      } else {
        wocdb.dispatcher.trigger("display:page", "person-page");
        name = $(evt.currentTarget).attr('plainname');
        wocdb.dispatcher.trigger("change:person", name);
      }
    },

    selectClass: function (evt) {
      this.setClass($(evt.currentTarget).attr('class'));
    },

    setClass: function (gender) {
      var text;
      text = gender === "all" ? "All classes" : wocdb.utils.capitalise(gender);
      this.$("#dropdown-class").empty().html(text + '<span class="caret">');
      this.gender = gender.toLowerCase();
    },

    selectType: function (evt) {
      this.setType($(evt.currentTarget).attr('type'));
    },

    setType: function (type) {
      var text;
      text = type === "all" ? "WOC and JWOC" : type.toUpperCase();
      this.$("#dropdown-type").empty().html(text + '<span class="caret">');
      this.type = type.toLowerCase();
    },

    selectRace: function (evt) {
      this.setRace($(evt.currentTarget).attr('race'));
    },

    setRace: function (race) {
      var text;
      this.race = race;
      text = race === "all" ? "All races" : wocdb.utils.capitalise(race);
      this.$("#dropdown-race").empty().html(text + '<span class="caret">');
    },

    selectGroup: function (evt) {
      this.setGroup($(evt.currentTarget).attr('country'));
    },

    setGroup: function (group) {
      // expecting "country" or "person" or a three=-letter country code
      var text;
      this.group = group.toLowerCase();
      if (group === "person") {
        text = "By person";
      } else if (group === "country") {
        text = "By country";
      } else {
        text = group.toUpperCase();
      }
      this.$("#dropdown-group").empty().html(text + '<span class="caret">');
    }
  });
}());
