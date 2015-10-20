var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone'),
    MangoSpaView = require('./mangospa.view'),
    LimeScreenView = require('./limescreen.view');

Backbone.$ = $;

/**
 * RootView is the root view that plugs itself to the DOM on first place
 * and deals with whether or not the SPA should be rendered.
 * It has a single child view — MangoSpaView — that will deal with
 */
var RootView = Backbone.View.extend({
  el: '#mango-spa-root',
  canRenderSPA: false,
  hasRendered: false,
  mangoSpaView: null,
  initialLimeScreenViewTarget: null,

  /**
   * Initializes view. Decides whether SPA is rendered or not.
   * Passed argument is an object of options that must contain
   * at least a `target` key (CSS selector), referencing the
   * DOM element that should be parsed to help building the
   * first LimeScreenView (it would most likely be the form
   * element in the DOM).
   *
   * @param  {Object} opts  The option object.
   * @return {RootView}
   */
  initialize: function (opts) {
    if (!opts || !opts.target) {
      return console.error(
        '[Mango SPA] Missing DOM target for initial LimeScreenView. ' +
        'Set it in `target` key of RootView#initialize options.'
      );
    }

    // If page title (survey title) contains "[IAT]", allow rendering of the SPA
    this.canRenderSPA = $('title').get(0).text.indexOf('[IAT]') > -1;

    if (this.canRenderSPA) {
      console.info('[Mango SPA] Building Mango SPA.');
      this.initialLimeScreenViewTarget = opts.target;
    }

    return this;
  },

  /**
   * Renders view... or remove everything to leave
   * the survey au naturel, Limesurvey style.
   *
   * @return {RootView}
   */
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

  /**
   * Creates the first LimeScreenView,
   * most likely a welcome screen.
   *
   * @return {RootView}
   */
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

  /**
   * Destroys instance and clean it up.
   * @return {void}
   */
  dispose: function () {
    console.info('[Mango SPA] Unbuilding MangoSPA...');

    $('body').removeClass('freeze');

    this.$el.remove();
    this.$el = null;
    this.el = null;
    this.canRenderSPA = null;
    this.hasRendered = null;
    this.mangoSpaView = null;
    this.initialLimeScreenViewTarget = null;

    // TODO: Destroy MangoSpaView and children.
  }
});

module.exports = RootView;
