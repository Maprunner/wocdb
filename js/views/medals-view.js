/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.MedalsView = Backbone.View.extend({
    el : '#medal-page',

    events: {
      'click #medal-table tbody tr': 'selectPerson',
      'click #groups li': 'selectGroup',
      'click #races li': 'selectRace',
      'click #classes li': 'selectClass',
      'click #types li': 'selectType',
      'click #medal-submit': 'getNewResults'
    },

    initialize : function () {
      var dropdown;
      this.listenTo(this.collection, 'update', this.render);
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
          $(row).attr('plainname', data.attributes.plainname);
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

    renderHeader: function () {
      var text;
      if (this.group === "person") {
        text = "Medals by person for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race);
      } else {
        text = "Medals by country for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race);
      }
      this.$("#medal-header-text").empty().html(text);
    },

    // submit button
    getNewResults: function () {
      wocdb.dispatcher.trigger("change:medals", {group: this.group, type: this.type, gender: this.gender, race: this.race});
    },

    // click on row in table loads selected person
    //think about what to do with click on country
    selectPerson: function (evt) {
      var name;
      if (this.group === "person") {
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
      this.setGroup($(evt.currentTarget).attr('group'));
    },

    setGroup: function (group) {
      // expecting "country" or "person"
      var text;
      this.group = group;
      text = group === "person" ? "By person" : "By country";
      this.$("#dropdown-group").empty().html(text + '<span class="caret">');
    }
  });
}());
