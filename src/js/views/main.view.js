var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone'),
    MangoSpaView = require('./mangospa.view'),
    LimeScreenView = require('./limescreen.view');

Backbone.$ = $;

var MainView = Backbone.View.extend({
  el: '#mango-spa-root',
  mangoHelperURI: '',
  canRenderSPA: false,
  hasRendered: false,
  mangoSpaView: null,
  initialLimeScreenViewTarget: null,

  initialize: function (opts) {
    if (!opts || !opts.helper) {
      return console.error(
        '[Mango SPA] Missing mango_spa_helper URI. ' +
        'Set it in `helper` key of MainView#initialize options.'
      );
    }

    if (!opts || !opts.target) {
      return console.error(
        '[Mango SPA] Missing DOM target for initial LimeScreenView. ' +
        'Set it in `target` key of MainView#initialize options.'
      );
    }

    // If page title (survey title) contains "[IAT]", allow rendering of the SPA
    this.canRenderSPA = $('title').get(0).text.indexOf('[IAT]') > -1;

    if (this.canRenderSPA) {
      console.info('[Mango SPA] Building Mango SPA.');
      this.mangoHelperURI = opts.helper;
      this.initialLimeScreenViewTarget = opts.target;
    }
  },

  render: function() {
    // If SPA is used, render it.
    // Otherwise remove overlay and start normal Limesurvey.
    if (this.canRenderSPA && !this.hasRendered) {
      this.hasRendered = true;

      // Render first node of the view.
      this.mangoSpaView = new MangoSpaView();
      this.$el.html(this.mangoSpaView.render().el);
      this.setInitialView();

      // Kill interactivity in underlying views.
      $('body').addClass('freeze');
    } else {
      this.dispose();
    }
    return this;
  },

  setInitialView: function () {
    if (!this.canRenderSPA) {
      return;
    }

    var surveyIntro = new LimeScreenView({
      el: this.initialLimeScreenViewTarget,
      success: function (data) {
        console.log(data);
        //surveyIntro.contentForNextScreen()
      },
      done: function (data) {
        console.log('done');
      },
      fail: function () {
        console.log('fail')
      }
    });

    if (this.mangoSpaView.$el) {
      this.mangoSpaView.$el.append(surveyIntro.render().el);
    }

    return this;
  },

  dispose: function () {
    console.info('[Mango SPA] Unbuilding MangoSPA...');

    $('body').removeClass('freeze');

    this.$el.remove();
    this.$el = null;
    this.el = null;
    this.mangoHelperURI = null;
    this.canRenderSPA = null;
    this.hasRendered = null;
    this.mangoSpaView = null;
    this.initialLimeScreenViewTarget = null;
  }
});

module.exports = MainView;
