var $ = require('jquery'),
    Backbone = require('backbone'),
    MangoSpaView = require('./mangospa.view'),
    LimeScreenView = require('./limescreen.view');

Backbone.$ = $;

var MainView = Backbone.View.extend({
  el: '#mango-spa-root',
  canRenderSPA: false,
  hasRendered: false,
  mangoSpaView: null,

  initialize: function () {
    this.canRenderSPA = !!$('body').attr('data-spa');
    console.log('[Mango SPA] Initializing MainView.');
  },

  render: function() {
    if (!this.hasRendered) {
      this.hasRendered = true;

      // Render first node of the view.
      this.mangoSpaView = new MangoSpaView();
      this.$el.html(this.mangoSpaView.render().el);

      // Kill interactivity in underlying views.
      $('body').addClass('freeze');
    }
    return this;
  },

  setInitialView: function (target) {
    var surveyIntro = new LimeScreenView({ el: target });
    this.mangoSpaView.$el.append(surveyIntro.render().el);
    return this;
  }
});

module.exports = MainView;
