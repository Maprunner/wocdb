/*global wocdb:false */
/*global Bloodhound:false */
(function () {
  'use strict';
  /*jslint unparam: true */
  wocdb.PersonView = Backbone.View.extend({
    el : '#person-page',

    events: {
      'click #person-table tbody tr': 'selectWOCRace',
      'click #name-submit': 'getNewPerson'
    },

    headerTemplate: _.template($('#person-header-tmpl').html()),

    initialize : function () {
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:person', this.render, this);
      this.nameSearch = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: wocdb.config.url + 'namesearch/%QUERY',
          wildcard: '%QUERY'
        }
      });

      $('#suggest-name .typeahead').typeahead({
        highlight: true
      }, {
        display: 'name',
        limit: 20,
        source: this.nameSearch
      }).bind("typeahead:selected", function (obj, datum) {
        $(this).attr("plainname", datum.plainname);
      });
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
            return row.get("venue");
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
            return row.get("numericPosition");
          },
          "title" : "Place",
          "render": function (data, type, full) {
            if (type === 'display') {
              if ((data < 4) && (full.attributes.final > 0)) {
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

    getNewPerson: function () {
      var person;
      person = $('.typeahead.tt-input').attr('plainname');
      wocdb.person.getPerson(person);
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
