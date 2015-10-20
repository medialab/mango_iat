var Backbone = require('backbone');
var MangoSpaView = require('./views/mangospa.view');

var Router = Backbone.Router.extend({
  routes: {
    '*path': 'default'
  },

  initialize: function() {
    Backbone.history.start();
  },

  default: function() {
    var rootView = new MangoSpaView({
      el: '#mango-spa-root'
    });

    var success = function (data) {
      console.log('success');
      console.log(data);
    }

    var failure = function () {
      console.log('failure');
    }

    rootView
      .createWelcomeScreen('#limesurvey', success, failure)
      .renderWelcomeScreen();
    }
});

module.exports = Router;
