var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone');

Backbone.$ = $;

var LimeScreenView = Backbone.View.extend({
  $nextBtn: null,
  formAction: null,

  promise: null,
  successCallback: null,
  failureCallback: null,

  initialize: function (opts) {
    this.el = this.parseDom(opts.target);
    this.successCallback = opts.success || null;
    this.failureCallback = opts.failure || null;

    _.bindAll(this, 'processSuccess');

    return this;
  },

  render: function () {
    this.$el = $(this.el);

    // Assign useful part of the DOM pertaining to this view.
    this.$nextBtn = this.$el.find('button');
    this.formAction = this.$el.attr('action');

    this.$nextBtn.on('click', function (e) {
      e.preventDefault();
      this.createPromise(this.$nextBtn.attr('value'));
      return false;
    }.bind(this));

    return {
      el: this.el
    };
  },

  parseDom: function (target) {
    return $(target).get(0);
  },

  createPromise: function (injectable) {
    // Populate the POST data object with key/values
    // from the original form inputs (including metadata
    // in invisible inputs).
    var data = {},
        inputs = this.$el.find('input');

    _.each(inputs, function (input) {
      data[input.name] = input.value;
    });

    // Inject value from 'next' button to fool Limesurvey's state manager.
    data[injectable] = injectable;

    // Set the views' promise.
    // The 'done' and 'fail' method specified in the initializer
    // will be attached to it. This is how you can control the outcome
    // of click the 'next' button, POSTing away the content, etc...
    this.promise = $.ajax({
      url: this.formAction,
      type: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .success(this.processSuccess)
    .fail(this.processFailure);
  },

  processSuccess: function (data) {
    var nodeTree = this.extractNodeTree(data);
    return this.successCallback(nodeTree);
  },

  processFailure: function () {
    this.dispose();
    console.error('[Mango SPA] Failed to create LimeScreenView...')
    return this.failureCallback();
  },

  extractNodeTree: function (domString) {
    var match = domString
                  .replace(/(\r\n|\n|\r|\s{3,})/gm, '')
                  .match(/<!-- START THE GROUP -->(.*)<!-- END THE GROUP -->/);
    return (_.isArray(match) && match.length > 1) ? match[1] : '';
  },

  dispose: function () {
    this.successCallback = null;
    this.failureCallback = null;
    this.promise = null;
    this.$nextBtn = null;
    this.formAction = null;
  }
});

module.exports = LimeScreenView;