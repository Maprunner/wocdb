// Version 0.1.0 2015-07-24T20:16:32;
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
    var year, type, raceid, personid, country;

    wocdb.router = new wocdb.WocdbRouter();
    wocdb.utils.hijackLinks();

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.person = new wocdb.Person();
    wocdb.runners = new wocdb.Runners();
    wocdb.bestlist = new wocdb.BestList();
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
      wocdb.dispatcher.trigger("display:page", "person-page");
      personid = parseInt(wocdb.config.bootstrapPerson[0].personid, 10);
      wocdb.dispatcher.trigger("startup:person", {
        "personid" : personid
      });
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
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
      if (this.attributes.final > 0) {
        if (this.attributes.position < 4) {
          this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
        }
      }
      this.attributes.percentdown = parseFloat(this.attributes.percentdown).toFixed(1);
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
          race = {"year": attr.year, "type": attr.type, "wocid": attr.id, "gender": attr.classes[j], "raceid": attr.raceids[j], "race": attr.races[j]};
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
      this.$el.html(this.template(this.model.attributes)).attr('id', this.model.attributes.personid);
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
      model = wocdb.wocs.findWhere({"id": wocid});
      if (model) {
        return model.attributes.country;
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
      if (wocid < 1000) {
        return "WOC";
      }
      return "JWOC";
    },

    getTypesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["WOC", "JWOC"], this.createTypeDropdownHTML, "");
      return dropdown;
    },

    createTypeDropdownHTML: function (html, type) {
      return html + "<li type='" + type + "'><a>" + type + "</a></li>";
    },

    getClassesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["Men", "Women", "Mixed"], this.createClassDropdownHTML, "");
      return dropdown;
    },

    createClassDropdownHTML: function (html, gender) {
      return html + "<li class='" + gender + "'><a>" + gender + "</a></li>";
    },

    getRacesDropdown: function () {
      var dropdown;
      dropdown = _.reduce(["Long", "Middle", "Sprint", "Relay", "SprintRelay"], this.createRaceDropdownHTML, "");
      return dropdown;
    },

    createRaceDropdownHTML: function (html, race) {
      return html + "<li race='" + race + "'><a>" + race + "</a></li>";
    },


    getCountriesDropdown: function (startHTML) {
      var dropdown;
      dropdown = _.reduce(wocdb.config.countries, this.createCountryDropdownHTML, startHTML);
      return dropdown;
    },

    createCountryDropdownHTML: function (html, country) {
      return html + "<li country='" + country + "'><a>" + country + "</a></li>";
    },

    abbrevList: ["ARG", "AUS", "AUT", "AZE", "BAR", "BEL", "BLR", "BRA", "BUL", "CAN", "CHI", "CHN", "COL", "CRO", "CYP", "CZE", "DEN",
                    "ECU", "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GER", "GRE", "HKG", "HUN", "IRL", "ISR", "ITA", "JPN", "KAZ", "KOR",
                    "LAT", "LTU", "MDA", "MKD", "MNE", "NED", "NOR", "NZL", "POL", "POR", "PRK", "ROU", "RSA", "RUS", "SCG", "SLO", "SRB",
                    "SUI", "SVK", "SWE", "TPE", "TUR", "UKR", "URU", "USA"],

    filePrefix: ["ar", "au", "at", "az", "bb", "be", "by", "br", "bg", "ca", "cl", "cn", "co", "hr", "cy", "cz", "dk",
                 "ec", "es", "ee", "fi", "fr", "gb", "ge", "de", "gr", "hk", "hu", "ie", "il", "it", "jp", "kg", "kr",
                 "lv", "lt", "md", "mk", "me", "nl", "no", "nz", "pl", "pt", "kp", "ro", "za", "ru", "xx", "si", "rs",
                 "ch", "sk", "se", "tw", "tr", "ua", "uy", "us"],

    // passed in GBR, returns gb, to allow png flag file referencing
    getFlagFile: function (abbrev) {
      var index, prefix;
      prefix = "xx";
      index = this.abbrevList.indexOf(abbrev);
      if (index !== -1) {
        prefix = this.filePrefix[index];
      }
      return wocdb.config.url + 'img/' + prefix + '.png';
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
      this.$el.empty().html("<thead><th>Pos</th><th>Name</th><th>Country</th><th></th><th>Time</th><th>% down</th></thead>");
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
      var index;
      wocdb.dispatcher.trigger("display:page", "person-page");
      index = parseInt(evt.currentTarget.id, 10);
      wocdb.dispatcher.trigger('change:person', index);
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
      'click #prev-race-at-woc': 'showPreviousRace'
    },

    initialize : function () {
      // update view once we have the data
      this.listenTo(this.collection, 'update', this.render);
      wocdb.dispatcher.on('startup:race', this.render, this);
    },

    template: _.template($('#race-header-tmpl').html()),

    render : function () {
      var model;
      if (this.collection.length) {
        model = this.collection.models[0].attributes;
        document.title = wocdb.utils.getType(model.wocid) + " " + model.year + " " + model.class + " " + model.race;
        $("#race-result-header-text").html(this.template(model));
      }
      return this;
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
      //"best/all": "initializeBestPage",
      "best/:country/:type/:class/:race": "getBestResults",
      "*other": "showAllWocs"
    },

    initializeBestPage: function () {
      wocdb.bestView.initializeBestPage();
    },

    getBestResults: function (country, type, gender, race) {
      wocdb.bestlist.getBest({"country": country, "type": type, "gender": gender, "race": race});
      wocdb.dispatcher.trigger("display:page", "best-page");
    },

    getPerson: function (person) {
      this.getPerson(person);
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

    getPerson : function (person) {
      this.reset();
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

    pages: ['all-wocs-page', 'single-woc-page', 'person-page', 'country-page', 'best-page'],

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
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
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
      this.reset();
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
      dropdown = wocdb.utils.getCountriesDropdown("");
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
      this.attributes.flag = wocdb.utils.getFlagFile(this.attributes.country);
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
      dropdown = wocdb.utils.getCountriesDropdown("<li country='ALL'><a>All countries</a></li>");
      this.$("#countries").empty().html(dropdown);
      dropdown = wocdb.utils.getRacesDropdown();
      this.$("#races").empty().html(dropdown);
      dropdown = wocdb.utils.getTypesDropdown();
      this.$("#types").empty().html(dropdown);
      dropdown = wocdb.utils.getClassesDropdown();
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

    createDropdownHTML: function (html, country) {
      return html + "<li country='" + country + "'><a>" + country + "</a></li>";
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
            return row.get("position");
          },
          "title" : "Position"
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
          "data" : function (row) {
            return row.get("time");
          },
          "title" : "Time"
        }, {
          "data" : function (row) {
            return row.get("percentdown");
          },
          "title" : "% down"
        }],
        "createdRow": function (row, data) {
          // add personid to newly created row
          $(row).attr('personid', data.attributes.personid);
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
      if (this.collection.models.length > 0) {
        if (this.country === "ALL") {
          text = "Best result by Country for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race);
        } else {
          text = "Best results for " + this.type.toUpperCase() + " : " + wocdb.utils.capitalise(this.gender) + " : " + wocdb.utils.capitalise(this.race) + " : " + this.country.toUpperCase();
        }
        this.$("#best-header-text").empty().html(text);
      }
    },

    // submit button
    getNewResults: function () {
      wocdb.dispatcher.trigger("change:best", {country: this.country, type: this.type, gender: this.gender, race: this.race});
    },

    // click on row in table loads selected person
    selectPerson: function (evt) {
      var personid;
      wocdb.dispatcher.trigger("display:page", "person-page");
      personid = parseInt($(evt.currentTarget).attr('personid'), 10);
      wocdb.dispatcher.trigger("change:person", personid);
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
      this.country = country.toLowerCase();
      this.$("#dropdown-country").empty().html(this.country.toUpperCase() + '<span class="caret">');
    }
  });
}());
