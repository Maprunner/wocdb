/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.PersonView = Backbone.View.extend({
    el : '#person-page',

    events: {
      'click #person-table tbody tr': 'selectWOCRace'
    },

    headerTemplate: _.template($('#person-header-tmpl').html()),

    initialize : function () {
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:person', this.render, this);
    },

    render : function () {
      if (this.personTable) {
        this.personTable.destroy();
      }
      this.$("#person-header").empty().html(this.headerTemplate(this.collection.models[0].attributes));
      this.personTable = $('#person-table').empty().DataTable({
        data : this.collection.models,
        paging: false,
        info: false,
        columns : [{
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
            return row.get("class");
          },
          "title" : "Class"
        }, {
          "data" : function (row) {
            return row.get("race");
          },
          "title" : "Race"
        }, {
          "data" : function (row) {
            if (row.get("position") === 999) {
              return "-";
            }
            return row.get("position");
          },
          "title" : "Place"
        }, {
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
            return row.get("time");
          },
          "title" : "Time"
        }],
        "createdRow": function (row, data) {
          // add wocid to newly created row
          $(row).attr('wocid', data.attributes.wocid).attr('raceid', data.attributes.raceid);
        },
        "order" : [[0, 'desc'], [1, 'desc']],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [0, 1, 5, 7, 9]
        }]
      });
    },

    // click on row loads selected WOC race details
    selectWOCRace: function (evt) {
      var wocid, raceid;
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      wocid = parseInt($(evt.currentTarget).attr('wocid'), 10);
      raceid = parseInt($(evt.currentTarget).attr('raceid'), 10);
      wocdb.dispatcher.trigger("click:showWOCID", {'wocid': wocid, 'raceid': raceid});
    }

  });
}());
