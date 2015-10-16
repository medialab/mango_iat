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
    // If SPA is used, render it.
    // Otherwise remove overlay and start normal Limesurvey.
    if (this.canRenderSPA && !this.hasRendered) {
      this.hasRendered = true;

      // Render first node of the view.
      this.mangoSpaView = new MangoSpaView();
      this.$el.html(this.mangoSpaView.render().el);

      // Kill interactivity in underlying views.
      $('body').addClass('freeze');
    } else {
      this.$el.remove();
    }
    return this;
  },

  setInitialView: function (target) {
    var surveyIntro = new LimeScreenView({
      el: target,
      success: function (data) {
        console.log(data);
      },
      done: function (data) {
        console.log('done');
      },
      fail: function () {
        console.log('fail')
      }
    });

    this.mangoSpaView.$el.append(surveyIntro.render().el);

    return this;
  }
});

module.exports = MainView;
