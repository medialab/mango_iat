var $ = require('jquery'),
    Backbone = require('backbone'),
    MangoSpaView = require('./mangospa.view');

Backbone.$ = $;

var MainView = Backbone.View.extend({
  el: '#mango-spa-root',
  canRenderSPA: false,
  hasRendered: false,

  initialize: function () {
    this.canRenderSPA = !!$('body').attr('data-spa');
    console.log('[Mango SPA] Initializing MainView.');
  },

  render: function() {
    if (!this.hasRendered) {
      this.hasRendered = true;

      // Render first node of the view.
      var mangoSpaView = new MangoSpaView();
      this.$el.html(mangoSpaView.render().el);

      // Kill interactivity in underlying view.
      $('body').addClass('freeze');
    }
    return this;
  }
});

module.exports = MainView;
