var Backbone = require('backbone');
var RootView = require('./views/root.view');

var Router = Backbone.Router.extend({
  routes: {
    '*path': 'default'
  },

  initialize: function() {
    Backbone.history.start();
  },

  default: function() {
    var view = new RootView({
      target: '#limesurvey'
    });
    view.render();
  }
});

module.exports = Router;
