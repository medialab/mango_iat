var $ = require('jquery'),
    Backbone = require('backbone'),
    LimeScreenView = require('./limescreen.view');

Backbone.$ = $;

/**
 * Root view for the single page app.
 *
 * All but getter/setter/handler methods are chainable.
 * This view doesn't need implement a `render` (but calls it internally
 * anyway to ensure processes launched during rendering are all set).
 *
 * Use it to create subviews ont it using the `createScreen` method.
 * You *must* start with a welcome screen using `createWelcomeScreen` method.
 *
 * The `renderLatestScreen` displays the latest screen available.
 *
 * @usage
 * var view = new MangoSpaView({ el: '#my-root-element' });
 * view.createWelcomeScreen(
 *   '#form-id',
 *   function successCallback(data) {
 *     // `data` holds the DOM of the next screen
 *   },
 *   function failureCallback() {
 *     // log error
 *   }
 * ).renderLatestScreen();
 */
var MangoSpaView = Backbone.View.extend({
  screens: [],
  numOfQuestions: 0,

  initialize: function () {
    console.log('[Mango SPA] Initializing MangoSpaView.');
    this.render();
    return this;
  },

  createWelcomeScreen: function (target, success, fail, done) {
    this.createScreen(target, success, fail, done);
    this.numOfQuestions = this.setNumQuestions();
    return this;
  },

  setNumQuestions: function () {
    var domString = $('.question_wrapper').prop('outerHTML'),
        match = domString.match(/There are (\d) question/);

    return match.length > 1 ? parseInt(match[1]) : 0;
  },

  createScreen: function (target, success, fail, done) {
    var screen = new LimeScreenView({
      target: target,
      success: this.onScreenSuccessCallback,
      failure: this.onScreenFailCallback
    });
    screen.render();
    this.screens.push(screen);
    return this;
  },

  getLatestScreen: function () {
    return this.screens[this.screens.length - 1];
  },

  renderWelcomeScreen: function () {
    if (this.screens.length > 0) {
      this.$el.html(this.screens[0].el);
    }
    return this;
  },

  renderLatestScreen: function() {
    this.$el.html(this.getLatestScreen().el);
    return this;
  },

  onScreenSuccessCallback: function (data) {
    console.log('success');
    console.log(data);
  },

  onScreenFailCallback: function (data) {
    console.log('failure');
    console.log(data);
  },

  dispose: function () {
    _.each(screens, function (screen) {
      screen.dispose();
    });
    screens = null;
  }
});

module.exports = MangoSpaView;