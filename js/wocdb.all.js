// Version 0.1.0 2015-07-18T16:43:46;
/*
 * Maprunner  WOC Database
 * https://github.com/Maprunner/wocdb
 *
 * Copyright (c) 2015 Simon Errington and contributors
 * Licensed under the MIT license.
 * https://github.com/Maprunner/wocdb/blob/master/LICENSE
 */
/*global location */
/*jslint unparam:true*/
var wocdb = (function (window, $) {
  'use strict';

  function init() {
    var year, type, raceid;

    wocdb.router = new wocdb.WocdbRouter();
    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    // See https://gist.github.com/tbranyen/1142129
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

    // create objects
    wocdb.dispatcher = _.clone(Backbone.Events);
    wocdb.races = new wocdb.Races();
    wocdb.wocs = new wocdb.Wocs();
    wocdb.raceResult = new wocdb.RaceResult();
    wocdb.activeWOC = new wocdb.ActiveWOC();
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
      type = parseInt(wocdb.config.bootstrapRaceResult[0].wocid, 10);
      type = type < 1000 ? "WOC" : "JWOC";
      year = parseInt(wocdb.config.bootstrapRaceResult[0].year, 10);
      raceid = parseInt(wocdb.config.bootstrapRaceResult[0].raceid, 10);
      wocdb.dispatcher.trigger("startup:race", {
        "type" : type,
        "year" : year,
        "raceid" : raceid
      });
    } else {
      wocdb.wocDbView.render();
    }
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
    abbrevList: ["ARG", "AUS", "AUT", "AZE", "BAR", "BEL", "BLR", "BRA", "BUL", "CAN", "CHI", "CHN", "COL", "CRO", "CYP", "CZE", "DEN",
                    "ECU", "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GER", "GRE", "HKG", "HUN", "IRL", "ISR", "ITA", "JPN", "KAZ", "KOR",
                    "LAT", "LTU", "MDA", "MKD", "MNE", "NED", "NOR", "NZL", "POL", "POR", "PRK", "ROU", "RSA", "RUS", "SCG", "SLO", "SRB",
                    "SUI", "SVK", "SWE", "TPE", "TUR", "UKR", "URU", "USA"],
    filePrefix: ["ar", "au", "at", "az", "bb", "be", "by", "br", "bg", "ca", "cl", "cn", "co", "hr", "cy", "cz", "dk",
                 "ec", "es", "ee", "fi", "fr", "gb", "ge", "de", "gr", "hk", "hu", "ie", "il", "it", "jp", "kg", "kr",
                 "lv", "lt", "md", "mk", "me", "nl", "no", "nz", "pl", "pt", "kp", "ro", "za", "ru", "xx", "si", "rs",
                 "ch", "sk", "se", "tw", "tr", "ua", "uy", "us"],

    initialize : function () {
      var flagFile = this.getFlagFile(this.attributes.country);
      this.attributes.flag = wocdb.config.url + 'img/' + flagFile + '.png';
      if (this.attributes.final > 0) {
        if (this.attributes.position < 4) {
          this.attributes.position = '<img src="' + wocdb.config.url + 'img/' + this.attributes.position + '.svg">';
        }
      }
      // needed to get round problem with reserved words in templates!
      this.attributes.gender = this.attributes.class;
    },
    getFlagFile: function (abbrev) {
      var index;
      index = this.abbrevList.indexOf(abbrev);
      if (index !== -1) {
        return this.filePrefix[index];
      }
      return "xx";
    }
  });
}());
/*global wocdb:false, wocdbconfig */
(function () {
  'use strict';

  wocdb.Wocs = Backbone.Collection.extend({
    initialize: function () {
      this.activeWOCIndex = null;
      wocdb.dispatcher.on('click:showNextWOC', this.showNextWOC, this);
      wocdb.dispatcher.on('click:showPreviousWOC', this.showPreviousWOC, this);
      wocdb.dispatcher.on('startup:race', this.setActiveWOCAtStart, this);
      this.reset(wocdbconfig.bootstrapWocs);
      this.createRaceCollection();
    },

    model: wocdb.Woc,

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
      } else {
        this.reset();
        this.fetch();
      }
    },

    getPreviousRaceAtWOC: function () {
      this.reset();
      this.raceIndex -= 1;
      if (this.raceIndex < 0) {
        this.raceIndex = this.active.races.length - 1;
      }
      this.fetch();
    },

    getNextRaceAtWOC: function () {
      this.reset();
      this.raceIndex += 1;
      if (this.raceIndex >= this.active.races.length) {
        this.raceIndex = 0;
      }
      this.fetch();
    },

    getResultByRaceID : function (raceid) {
      this.reset();
      this.raceIndex = _.indexOf(this.active.raceids, raceid);
      if (this.raceIndex === -1) {
        this.raceIndex = 0;
      }
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
      $('#single-woc-page').hide();
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
      $("#single-woc-page").show();
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

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.ResultView = Backbone.View.extend({
    model: wocdb.Result,
    tagName: 'tr',

    template: _.template($('#race-result-tmpl').html()),

    render: function () {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });
}());

/*global wocdb:false */
(function () {
  'use strict';

  wocdb.RaceResultView = Backbone.View.extend({
    el : '#result-table',

    initialize : function () {
      // create view once we have the data
      //this.listenTo(this.collection, 'sync', this.render);
      wocdb.dispatcher.on('change:raceid', this.render, this);
    },

    render : function () {
      var i, view;
      this.$el.empty();
      if (this.collection.length > 0) {
        for (i = 0; i < this.collection.length; i += 1) {
          view = new wocdb.ResultView({model: this.collection.at(i)});
          this.$el.append(view.$el);
          view.render();
        }
      } else {
        this.$el.append('No records found.');
      }
      return this;
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
      // create view once we have the data
      wocdb.dispatcher.on('change:raceid', this.render, this);
    },

    template: _.template($('#race-header-tmpl').html()),

    render : function () {
      $("#race-result-header-text").html(this.template(this.collection.models[0].attributes));
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
      "*other": "showAllWocs"
    },

    getWOCResult: function (year, gender, race) {
      this.getResult("WOC", year, gender, race);
    },

    getJWOCResult: function (year, gender, race) {
      this.getResult("JWOC", year, gender, race);
    },

    getResult: function (type, year, gender, race) {
      var raceid;
      raceid = wocdb.races.getRaceID(type, year, gender, race);
      wocdb.raceResult.getResultByRaceID(raceid);
    },

    showAllWocs: function () {
      $("#all-wocs-page").show();
      $("#single-woc-page").hide();
    }
  });
}());
