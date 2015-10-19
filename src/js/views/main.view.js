var $ = require('jquery'),
    Backbone = require('backbone'),
    Cookies = require('js-cookie'),
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

    this.canRenderSPA = !!$('body').attr('data-spa');

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

      // Get HTTP_COOKIE data to fool LimeSurvey.
      var uri = this.mangoHelperURI + '?csrf=' + Cookies.get('csrftoken');
      $.get(uri)
       .success(function (data) {
          var jsonPayload = JSON.parse(data);

          if (!jsonPayload.success) {
            console.error('[Mango SPA] ' + jsonPayload.message);
            return this.dispose();
          }

          // Render first node of the view.
          this.mangoSpaView = new MangoSpaView();
          this.$el.html(this.mangoSpaView.render().el);

          // Kill interactivity in underlying views.
          $('body').addClass('freeze');
       }.bind(this))
       .fail(function () {
         console.error('[Mango SPA] Failed get HTTP_COOKIE data. Aborting rendering of MainView.');
       }.bind(this))
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
