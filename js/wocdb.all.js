// Version 0.3.0 2019-07-11T16:37:11+0100;
/*
 * Maprunner  WOC Database
 * https://github.com/Maprunner/wocdb
 *
 * Copyright (c) 2015 Simon Errington and contributors
 * Licensed under the MIT license.
 * https://github.com/Maprunner/wocdb/blob/master/LICENSE
 */
// jshint unused:false
/*jslint unparam:true*/
var wocdb = (function (window, $) {
  'use strict';
  function init() {
    var year, type, raceid, name, country;

    wocdb.router = new wocdb.WocdbRouter();
    wocdb.utils.hijackLinks();
    wocdb.countries = new wocdb.Countries(wocdb.config.countrydata);

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.person = new wocdb.Person();
    wocdb.runners = new wocdb.Runners();
    wocdb.bestlist = new wocdb.BestList();
    wocdb.medals = new wocdb.Medals();
    wocdb.activeWOC = new wocdb.ActiveWOC();
    wocdb.masterView = new wocdb.MasterView();
    wocdb.activeWOCView = new wocdb.ActiveWOCView({
      model : wocdb.activeWOC
    });
    wocdb.activeResultView = new wocdb.RaceResultView({
      collection : wocdb.raceResult
    });
    wocdb.activeResultHeaderView = new wocdb.RaceResultHeaderView({
      collection : wocdb.raceResult
    });
    wocdb.raceMenuView = new wocdb.RaceMenuView({
      model : wocdb.activeWOC
    });
    wocdb.runnersView = new wocdb.RunnersView({
      collection : wocdb.runners
    });
    wocdb.bestView = new wocdb.BestView({
      collection : wocdb.bestlist
    });
    wocdb.medalView = new wocdb.MedalsView({
      collection : wocdb.medals
    });
    wocdb.personView = new wocdb.PersonView({
      collection : wocdb.person
    });
    wocdb.wocDbView = new wocdb.WOCDBView({
      collection : wocdb.wocs
    });
    Backbone.history.start({
      pushState : true,
      root : "/wocdb",
      silent : true
    });
    // start
    if (wocdb.config.bootstrapRaceResult) {
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      type = wocdb.utils.getType(parseInt(wocdb.config.bootstrapRaceResult[0].wocid, 10));
      year = parseInt(wocdb.config.bootstrapRaceResult[0].year, 10);
      raceid = parseInt(wocdb.config.bootstrapRaceResult[0].raceid, 10);
      wocdb.dispatcher.trigger("startup:race", {
        "type" : type,
        "year" : year,
        "raceid" : raceid
      });
      return;
    }
    if (wocdb.config.bootstrapPerson) {
      if (wocdb.config.bootstrapPerson.length) {
        wocdb.dispatcher.trigger("display:page", "person-page");
        name = wocdb.config.bootstrapPerson[0].plainname;
        wocdb.dispatcher.trigger("startup:person", name);
      }
      return;
    }
    if (wocdb.config.bootstrapRunners) {
      wocdb.dispatcher.trigger("display:page", "country-page");
      country = parseInt(wocdb.config.bootstrapRunners[0].country, 10);
      wocdb.dispatcher.trigger("startup:runners", {
        "type": "person",
        "country": country
      });
      return;
    }
    if (wocdb.config.bootstrapBestList) {
      wocdb.dispatcher.trigger("display:page", "best-page");
      wocdb.dispatcher.trigger("startup:best");
      return;
    }
    if (wocdb.config.bootstrapMedals) {
      wocdb.dispatcher.trigger("display:page", "medal-page");
      wocdb.dispatcher.trigger("startup:medal");
      return;
    }
    wocdb.dispatcher.trigger("display:page", "all-wocs-page");
  }

  return {
    init : init
  };

}(window, window.jQuery));
/*global wocdb:false */
(function () {
  'use strict';
  // holds details of the WOC currently being displayed on the WOC summary page
  wocdb.ActiveWOC = Backbone.Model.extend({
    initialize : function () {
      wocdb.dispatcher.on('change:activeWOC', this.setActiveWOC, this);
    },

    setActiveWOC: function (details) {
      // save details for new WOC to display
      this.set(details);
    }
  });
}());
/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Woc = Backbone.Model.extend({
    initialize : function () {
      this.attributes.type  = this.attributes.type === "W" ? "WOC" : "JWOC";
      this.attributes.raceids = this.attributes.raceids.split(",").map(function (n) {
        return parseInt(n, 10);
      });
      this.attributes.classes = this.attributes.classes.split(",");
      this.attributes.races = this.attributes.races.split(",");
      this.attributes.links = this.attributes.links.split(",");
    }
  });
}());
/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Race = Backbone.Model.extend({
    initialize: function () {
      // urls are all lower case so this make url handling a bit easier
      this.set('raceLowerCase', this.attributes.race.toLowerCase());
      this.set('genderLowerCase', this.attributes.gender.toLowerCase());
    }
  });
}());
/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Result = Backbone.Model.extend({

    initialize : function () {
      this.attributes.flag = wocdb.countries.getFlagFile(this.attributes.country);
      this.attributes.venue = wocdb.utils.getVenue(this.attributes.wocid);
      // keep numeric copy of position to allow sorting
      this.attributes.numericPosition = this.attributes.position;
      if (this.attributes.final > 0) {
        if (this.attributes.position < 4) {
          this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
        }
      }
      this.attributes.percentdown = this.attributes.percentdown ? parseFloat(this.attributes.percentdown).toFixed(1) : "";
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    }

  });
}());
/*global wocdb:false */
(function () {
  'use strict';

  wocdb.Wocs = Backbone.Collection.extend({
    initialize: function () {
      this.activeWOCIndex = null;
      wocdb.dispatcher.on('click:showWOCID', this.setActiveWOCID, this);
      wocdb.dispatcher.on('click:showNextWOC', this.showNextWOC, this);
      wocdb.dispatcher.on('click:showPreviousWOC', this.showPreviousWOC, this);
      wocdb.dispatcher.on('startup:race', this.setActiveWOCAtStart, this);
      this.reset(wocdb.config.bootstrapWocs);
      this.createRaceCollection();
    },

    model: wocdb.Woc,

    setActiveWOCID: function (details) {
      var model, info;
      model = this.findWhere({id: details.wocid});
      this.activeWocIndex = this.indexOf(model);
      info = this.models[this.activeWocIndex].attributes;
      info.startUpRaceID = details.raceid;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    setActiveWOCAtStart: function (details) {
      var model, info;
      model = this.findWhere({type: details.type, year: details.year});
      this.activeWocIndex = this.indexOf(model);
      info = this.models[this.activeWocIndex].attributes;
      info.startUpRaceID = details.raceid;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    setActiveWOCIndex: function (index) {
      var info;
      this.activeWOCIndex = index;
      info = this.models[index].attributes;
      wocdb.dispatcher.trigger("change:activeWOC", info);
    },

    // Next and Previous look backwards, but it is because of the sort order (year descending) in the initial data
    showPreviousWOC: function () {
      var index;
      index = this.activeWOCIndex + 1;
      if (index >= this.models.length) {
        index = 0;
      }
      this.setActiveWOCIndex(index);
    },

    showNextWOC: function () {
      var index;
      index = this.activeWOCIndex - 1;
      if (index < 0) {
        index = this.models.length - 1;
      }
      this.setActiveWOCIndex(index);
    },

    createRaceCollection: function () {
      // extracts a list of races from the WOC collection: could get via JSON or include in bootstrap data in future
      var race, attr, i, j;
      wocdb.races.reset();
      for (i = 0; i < this.models.length; i += 1) {
        attr = this.models[i].attributes;
        for (j = 0; j < attr.raceids.length; j += 1) {
          race = {"year": attr.year, "type": attr.type, "wocid": attr.id, "gender": attr.classes[j], "raceid": attr.raceids[j], "race": attr.races[j], "link": attr.links[j]};
          wocdb.races.add(race);
        }
      }
    }

  });
}());
/*global wocdb:false */
(function () {
  'use strict';

  wocdb.Races = Backbone.Collection.extend({
    model: wocdb.Race,

    getRaceInfo: function (raceid) {
      var model;
      model = this.findWhere({"raceid": raceid});
      return model.attributes;
    },

    getRaceID: function (type, year, gender, race) {
      var model;
      // careful with case of arguments
      // type comes in as WOC or JWOC, but gender and race are lower case 
      model = this.findWhere({"type": type, "year": parseInt(year, 10), "genderLowerCase": gender, "raceLowerCase": race});
      if (model) {
        return model.attributes.raceid;
      }
      return 0;
    }

  });
}());
/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.RaceResult = Backbone.Collection.extend({
    initialize: function () {
      wocdb.dispatcher.on('change:activeWOC', this.setRaceAtWOC, this);
      wocdb.dispatcher.on('click:showNextRaceAtWOC', this.getNextRaceAtWOC, this);
      wocdb.dispatcher.on('click:showPreviousRaceAtWOC', this.getPreviousRaceAtWOC, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapRaceResult);
      this.listenTo(this, 'update', this.announceNewRaceID);
      this.raceIndex = null;
      this.active = {};
    },

    url: function () {
      return wocdb.config.url + this.active.type.toLowerCase() + '/' + this.active.year + '/' + this.active.classes[this.raceIndex].toLowerCase() +
        '/' + this.active.races[this.raceIndex].toLowerCase();
    },

    model: wocdb.Result,

    announceNewRaceID: function () {
      wocdb.router.navigate(this.active.type.toLowerCase() + '/' + this.active.year + '/' + this.active.classes[this.raceIndex].toLowerCase() +
        '/' + this.active.races[this.raceIndex].toLowerCase());
      wocdb.dispatcher.trigger('change:raceid', this.active.raceids[this.raceIndex]);
    },

    setRaceAtWOC: function (details) {
      this.raceIndex = 0;
      this.active = details;
      if (details.startUpRaceID) {
        this.raceIndex = _.indexOf(details.raceids, details.startUpRaceID);
        if (this.raceIndex === -1) {
          this.raceIndex = 0;
        }
        this.announceNewRaceID();
      }
      // if we have a race loaded
      if (this.length > 0) {
        // but it isn't the requested one
        if (this.models[0].raceid !== this.active.raceids[this.raceIndex]) {
          // load the new race
          this.loadRace();
        }
      } else {
        this.loadRace();
      }
    },

    getPreviousRaceAtWOC: function () {
      this.raceIndex -= 1;
      if (this.raceIndex < 0) {
        this.raceIndex = this.active.races.length - 1;
      }
      this.loadRace();
    },

    getNextRaceAtWOC: function () {
      this.raceIndex += 1;
      if (this.raceIndex >= this.active.races.length) {
        this.raceIndex = 0;
      }
      this.loadRace();
    },

    getResultByRaceID : function (raceid) {
      this.raceIndex = _.indexOf(this.active.raceids, raceid);
      if (this.raceIndex === -1) {
        this.raceIndex = 0;
      }
      this.loadRace();
    },

    loadRace: function () {
      // load the new race
      this.reset();
      this.fetch();
    }
  });
}());
/*global wocdb:false */
(function () {
  'use strict';

  wocdb.ActiveWOCView = Backbone.View.extend({
    el: '#woc-summary-table',

    events: {
      'click #next-woc': 'showNextWOC',
      'click #prev-woc': 'showPreviousWOC'
    },

    summaryTemplate: _.template($('#woc-summary-tmpl').html()),

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    showNextWOC: function () {
      wocdb.dispatcher.trigger('click:showNextWOC');
    },

    showPreviousWOC: function () {
      wocdb.dispatcher.trigger('click:showPreviousWOC');
    },

    render: function () {
      // fill in summary info
      this.$el.html(this.summaryTemplate(this.model.attributes));
      return this;
    }

  });
}());

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
      this.render();
    },
    render : function () {
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
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      index = parseInt(evt.currentTarget.id, 10);
      this.collection.setActiveWOCIndex(index);
    }

  });
}());

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.ResultView = Backbone.View.extend({
    model: wocdb.Result,
    tagName: 'tr',

    template: _.template($('#race-result-tmpl').html()),

    render: function () {
      this.$el.html(this.template(this.model.attributes)).attr('plainname', this.model.attributes.plainname);
      return this;
    }
  });
}());

/*global wocdb:false */
/*global location */
(function () {
  'use strict';
  var utils =  {

    getVenue: function (wocid) {
      var model;
      model = wocdb.wocs.findWhere({"id": parseInt(wocid, 10)});
      if (model) {
        return model.attributes.country;
      }
      return "";
    },

    getRaceLink: function (raceid) {
      var model;
      model = wocdb.races.findWhere({"raceid": parseInt(raceid, 10)});
      if (model) {
        return model.attributes.link;
      }
      return "";
    },

    capitalise: function (text) {
      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
      return "";
    },

    getType: function (wocid) {
      if (parseInt(wocid, 10) < 1000) {
        return "WOC";
      }
      return "JWOC";
    },

    getGroupByDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "By person", value: "person"}, {text: "By country", value: "country"}], this.createGroupByDropdownHTML, startHTML);
      dropdown = wocdb.countries.getCountriesDropdown(dropdown);
      return dropdown;
    },

    createGroupByDropdownHTML: function (html, type) {
      return html + "<li country='" + type.value + "'><a>" + type.text + "</a></li>";
    },

    getTypesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "WOC", value: "woc"}, {text: "JWOC", value: "jwoc"}], this.createTypeDropdownHTML, startHTML);
      return dropdown;
    },

    createTypeDropdownHTML: function (html, type) {
      return html + "<li type='" + type.value + "'><a>" + type.text + "</a></li>";
    },

    getClassesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "Men", value: "men"}, {text: "Women", value: "women"}, {text: "Mixed", value: "mixed"}], this.createClassDropdownHTML, startHTML);
      return dropdown;
    },

    createClassDropdownHTML: function (html, gender) {
      return html + "<li class='" + gender.value + "'><a>" + gender.text + "</a></li>";
    },

    getRacesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce([{text: "Long", value: "long"}, {text: "Middle", value: "middle"}, {text: "Sprint", value: "sprint"}, {text: "Relay", value: "relay"},
                    {text: "Sprint Relay", value: "sprintrelay"}], this.createRaceDropdownHTML, startHTML);
      return dropdown;
    },

    createRaceDropdownHTML: function (html, race) {
      return html + "<li race='" + race.value + "'><a>" + race.text + "</a></li>";
    },

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    // See https://gist.github.com/tbranyen/1142129
    hijackLinks: function () {
      $(document).on("click", "a[href]:not([data-bypass])", function (evt) {
        var href, root;
        // Get the absolute anchor href.
        href = {
          prop : $(this).prop("href"),
          attr : $(this).attr("href")
        };
        // Get the absolute root.
        root = location.protocol + "//" + location.host + '/wocdb';

        // Ensure the root is part of the anchor href, meaning it's relative.
        if (href.prop.slice(0, root.length) === root) {
          // Stop the default event to ensure the link will not cause a page
          // refresh.
          evt.preventDefault();
          wocdb.router.navigate(href.attr, true);
        }
      });
    }
  };
  wocdb.utils = utils;

}());

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

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultView = Backbone.View.extend({
    el : '#result-table',

    events: {
      'click tr': 'selectPerson'
    },

    initialize : function () {
      // create view once we have the data
      //this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
    },

    render : function () {
      var i, view;
      this.$el.empty().html("<thead><th class='center-text'>Pos</th><th>Name</th><th>Country</th><th></th><th class='center-text'>Time</th><th class='center-text'>% down</th></thead>");
      if (this.collection.length > 0) {
        for (i = 0; i < this.collection.length; i += 1) {
          view = new wocdb.ResultView({model: this.collection.at(i)});
          this.$el.append(view.$el);
          view.render();
        }
      } else {
        this.$el.append('No records found.');
      }
      // attach events to new set of results
      this.delegateEvents();
      return this;
    },

    // click on row loads selected person
    selectPerson: function (evt) {
      var name;
      wocdb.dispatcher.trigger("display:page", "person-page");
      name = $(evt.currentTarget).attr('plainname');
      wocdb.dispatcher.trigger('change:person', name);
    }
  });
}());

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultHeaderView = Backbone.View.extend({
    el : '#race-result-header',

    events : {
      'click #next-race-at-woc': 'showNextRace',
      'click #prev-race-at-woc': 'showPreviousRace',
      'click #map-link': 'showMap'
    },

    initialize : function () {
      this.raceID = null;
      // update view once we have the data
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
      wocdb.dispatcher.on('change:raceid', this.setRaceID, this);
    },

    template: _.template($('#race-header-tmpl').html()),

    render : function () {
      var model;
      if (this.collection.length) {
        model = this.collection.models[0].attributes;
        model.link = wocdb.utils.getRaceLink(this.raceID);
        document.title = wocdb.utils.getType(model.wocid) + " " + model.year + " " + model.class + " " + model.race;
        $("#race-result-header-text").html(this.template(model));
      }
      return this;
    },

    setRaceID: function (id) {
      this.raceID = id;
    },

    showMap: function () {
      window.open(wocdb.utils.getRaceLink(this.raceID));
    },

    showNextRace: function () {
      wocdb.dispatcher.trigger('click:showNextRaceAtWOC');
    },

    showPreviousRace: function () {
      wocdb.dispatcher.trigger('click:showPreviousRaceAtWOC');
    }
  });
}());

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceMenuView = Backbone.View.extend({
    el: '#race-nav-list',

    events: {
    },

    menuTemplate: _.template($('#race-menu-tmpl').html()),

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      wocdb.dispatcher.on('change:raceid', this.setNewRaceID, this);
      this.oldRaceID = null;
    },

    render: function () {
      var i, data;
      // set up menu for race selection
      data = this.model.attributes;
      this.$el.empty();
      for (i = 0; i < data.races.length; i += 1) {
        this.$el.append(this.menuTemplate({type: data.type, year: data.year, gender: data.classes[i], race: data.races[i], raceid: data.raceids[i]}));
      }
      // get round a race condition on start-up with an active race
      if (this.oldRaceID) {
        this.$('#' + this.oldRaceID).addClass('active');
      }
      return this;
    },

    setNewRaceID: function (raceid) {
      if (this.oldRaceID) {
        this.$('#' + this.oldRaceID).removeClass('active');
      }
      this.$('#' + raceid).addClass('active');
      this.oldRaceID = raceid;
    }

  });
}());

/*global wocdb:false */
(function () {
  'use strict';
  wocdb.WocdbRouter = Backbone.Router.extend({
    routes: {
      "wocdb": "showAllWocs",
      "woc/:year/:gender/:race": "getWOCResult",
      "jwoc/:year/:gender/:race": "getJWOCResult",
      "person/:person": "getPerson",
      "runners/:type/:country": "getRunnersByCountry",
      "medals/:group/:type/:class/:race": "getMedals",
      "best/:country/:type/:class/:race": "getBestResults",
      "person": "nameSearch",
      "*other": "showAllWocs"
    },

    nameSearch: function () {
      wocdb.person.searchName();
      wocdb.dispatcher.trigger("display:page", "person-page");
    },

    getBestResults: function (country, type, gender, race) {
      wocdb.bestlist.getBest({"country": country, "type": type, "gender": gender, "race": race});
      wocdb.dispatcher.trigger("display:page", "best-page");
    },

    getMedals: function (group, type, gender, race) {
      wocdb.medals.getMedals({"group": group, "type": type, "gender": gender, "race": race});
      wocdb.dispatcher.trigger("display:page", "medal-page");
    },

    getPerson: function (person) {
      wocdb.person.getPerson(person);
      wocdb.dispatcher.trigger("display:page", "person-page");
    },

    getRunnersByCountry: function (type, country) {
      wocdb.runners.getRunnersByCountry(type, country);
      wocdb.dispatcher.trigger("display:page", "country-page");
    },

    getWOCResult: function (year, gender, race) {
      this.getResult("WOC", year, gender, race);
    },

    getJWOCResult: function (year, gender, race) {
      this.getResult("JWOC", year, gender, race);
    },

    getResult: function (type, year, gender, race) {
      var raceid;
      wocdb.dispatcher.trigger("display:page", "single-woc-page");
      raceid = wocdb.races.getRaceID(type, year, gender, race);
      wocdb.raceResult.getResultByRaceID(raceid);
    },

    showAllWocs: function () {
      document.title = "Maprunner WOC Database";
      wocdb.dispatcher.trigger("display:page", "all-wocs-page");
    }
  });
}());

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

    searchName: function () {
      this.personid = null;
    },

    getPerson : function (person) {
      this.personid = person;
      wocdb.router.navigate('person/' + this.personid);
      this.fetch();
    }
  });
}());
/*global wocdb:false */
(function () {
  'use strict';
  wocdb.MasterView = Backbone.View.extend({
    el : '#wocdb-container',

    pages: ['all-wocs-page', 'single-woc-page', 'person-page', 'country-page', 'best-page', 'medal-page'],

    initialize : function () {
      wocdb.dispatcher.on('display:page', this.setPageVisibility, this);
    },

    setPageVisibility: function (page) {
      // display requested page and hide all others
      _.each(this.pages, this.setDisplay, page);
    },

    setDisplay: function (testPage) {
      var displayType;
      // this comes in as the page name we have been asked to display
      if (testPage === this) {
        displayType = "block";
      } else {
        displayType = "none";
      }
      $('#' + testPage).css("display", displayType);
    }

  });
}());

/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Runner = Backbone.Model.extend({
    initialize : function () {
      this.attributes.flag = wocdb.countries.getFlagFile(this.attributes.country);
    }
  });
}());
/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.Runners = Backbone.Collection.extend({
    // handles get runner by country
    // type is name or person for get by nameid or personid
    initialize: function () {
      wocdb.dispatcher.on("change:person", this.getPerson, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapRunners);
      if (this.length > 0) {
        this.personid = this.models[0].personid;
        this.type = "person";
      } else {
        this.type = "person";
        this.personid = "gbr";
      }
    },

    url: function () {
      return wocdb.config.url + 'runners/' + this.type + '/' + this.country;
    },

    model: wocdb.Runner,

    getRunnersByCountry : function (type, country) {
      this.country = country;
      this.type = type;
      wocdb.router.navigate('runners/' + this.type + '/' + this.country);
      this.fetch();
    }
  });
}());
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
            return row.get("wocraces");
          },
          "title" : "WOC races"
        }, {
          "data" : function (row) {
            return row.get("jwoc");
          },
          "title" : "JWOCs"
        }, {
          "data" : function (row) {
            return row.get("jwocraces");
          },
          "title" : "JWOC races"
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
          "targets" : [1, 3, 4, 5, 6, 7, 8]
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

/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Best = Backbone.Model.extend({
    initialize: function () {
      this.attributes.flag = wocdb.countries.getFlagFile(this.attributes.country);
      // keep numeric copy of position to allow sorting
      this.attributes.numericPosition = this.attributes.position;
      // best only used for finals so don't need to check for qualifiers'
      if (this.attributes.position < 4) {
        this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
      }
      this.attributes.percentdown = parseFloat(this.attributes.percentdown).toFixed(1);
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    }
  });
}());
/*global wocdb:false  */
(function () {
  'use strict';
  wocdb.BestList = Backbone.Collection.extend({
    // handles best results by country
    initialize: function () {
      wocdb.dispatcher.on("change:best", this.getBest, this);
      // load results if they were provided in HTML at start-up
      this.reset(wocdb.config.bootstrapBestList);
    },

    url: function () {
      return wocdb.config.url + 'best/' + this.country + '/' + this.type + '/' + this.gender + '/' + this.race;
    },

    model: wocdb.Best,

    getBest : function (details) {
      this.country = details.country;
      this.type = details.type;
      this.gender = details.gender;
      this.race = details.race;
      wocdb.router.navigate('best/' + this.country + '/' + this.type + '/' + this.gender + '/' + this.race);
      this.fetch();
    }
  });
}());
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

/*global wocdb:false  */
(function () {
  'use strict';

  wocdb.Country = Backbone.Model.extend({
  });

  wocdb.Countries = Backbone.Collection.extend({
    model: wocdb.Country,

    getCountriesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce(this.models, this.createCountryDropdownHTML, startHTML);
      return dropdown;
    },

    createCountryDropdownHTML: function (html, model) {
      return html + "<li country='" + model.attributes.abbr + "'><a>" + model.attributes.abbr + " (" + model.attributes.country + ")</a></li>";
    },

    getName: function (abbreviation) {
      var model;
      model = this.findWhere({"abbr": abbreviation.toUpperCase()});
      if (model) {
        return model.attributes.country;
      }
      return "";
    },

    // passed in GBR, returns gb, to allow png flag file referencing
    getFlagFile: function (abbrev) {
      var model, prefix;
      prefix = "xx";
      model = this.findWhere({"abbr": abbrev});
      if (model) {
        prefix = model.attributes.code;
      }
      return wocdb.config.url + 'img/' + prefix + '.png';
    }
  });

}());
/*global wocdb:false */
(function () {
  'use strict';
  wocdb.Medal = Backbone.Model.extend({
    initialize: function () {
      this.attributes.flag = wocdb.countries.getFlagFile(this.attributes.country);
      this.attributes.numericPosition = this.attributes.position;
      if (this.attributes.position < 4) {
        this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
      }
    }
  });
}());
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
      var self = this;
      this.medalTable = $('#medal-table').empty().DataTable({
        data : this.collection.models,
        columns : [{
          "data" : function (row) {
            if (row.get("name")) {
              return row.get("name");
            }
            return wocdb.countries.getName(row.get("country"));
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
          if (self.group === "person") {
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
