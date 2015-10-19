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
    var view = new MainView({
      helper: $('meta[name="templateurl"]').attr('content') + 'scripts/mango_spa/mango_spa_helper.php',
      target: '#limesurvey'
    });
    view.render();
  }
});

module.exports = Router;
