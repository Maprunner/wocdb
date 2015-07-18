/*global wocdb:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.WOCDBView = Backbone.View.extend({
    el : '#all-wocs-page',

    events: {
      'click #wocs-table tbody tr': 'selectWOC'
    },

    initialize : function () {
      this.listenTo(this.collection, 'reset', this.render);
    },
    render : function () {
      this.$el.show();
      this.wocsTable = $('#wocs-table').DataTable({
        data : this.collection.models,
        "columns" : [{
          "data" : function (row) {
            return row.get("id");
          },
          "visible" : false
        }, {
          "data" : function (row) {
            return row.get("year");
          },
          "title" : "Year"
        }, {
          "data" : function (row) {
            return row.get("type");
          },
          "title" : "Type"
        }, {
          "data" : function (row) {
            return row.get("country");
          },
          "title" : "Country"
        }, {
          "data" : function (row) {
            return row.get("location");
          },
          "title" : "Location"
        }, {
          "data" : function (row) {
            return row.get("dates");
          },
          "title" : "Dates"
        }, {
          "data" : function (row) {
            return row.get("countries");
          },
          "title" : "Countries"
        }, {
          "data" : function (row) {
            return row.get("runners");
          },
          "title" : "Runners"
        }],
        "createdRow": function (row, data, index) {
          // add id to newly created row
          $(row).attr('id', index);
        },
        "lengthMenu" : [[10, 20, -1], [10, 20, "All"]],
        "order" : [[1, 'desc'], [2, 'desc']],
        'autoWidth' : true,
        'searching' : false,
        "columnDefs" : [{
          className : "dt-center",
          "targets" : [1, 2, 6, 7]
        }]
      });
    },

    // click on row loads selected WOC details
    selectWOC: function (evt) {
      var index;
      this.$el.hide();
      index = parseInt(evt.currentTarget.id, 10);
      this.collection.setActiveWOCIndex(index);
    }

  });
}());
