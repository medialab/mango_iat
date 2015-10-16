var Backbone = require('backbone');
var MainView = require('./views/main.view');

var Router = Backbone.Router.extend({
  routes: {
    '*path': 'default'
  },

  initialize: function() {
    Backbone.history.start();
  },

  default: function() {
    var view = new MainView();
    view.render().setInitialView('#limesurvey');
  }
});

module.exports = Router;
