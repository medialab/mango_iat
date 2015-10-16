var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone');

Backbone.$ = $;

var LimeScreenView = Backbone.View.extend({
  $nextBtn: null,
  formAction: null,
  promise: null,
  promiseSuccessCallback: null,
  promiseDoneCallback: null,
  promiseFailCallback: null,

  initialize: function (opts) {
    this.promiseSuccessCallback = opts.success || null;
    this.promiseDoneCallback = opts.done || null;
    this.promiseFailCallback = opts.fail || null;
  },

  render: function () {
    // Create cached jQ element if not available yet.
    if (!this.$el) {
      this.$el = $(this.el);
    }

    // Assign useful part of the DOM pertaining to this view.
    this.$nextBtn = this.$el.find('#movenextbtn');
    this.formAction = this.$el.attr('action');

    this.$nextBtn.on('click', function (e) {
      e.preventDefault();
      this.createPromise();
    }.bind(this));
    return {
      el: this.el
    };
  },

  createPromise: function () {
    // Populate the POST data object with key/values
    // from the original form inputs (including metadata
    // in invisible inputs).
    var data = {},
        inputs = this.$el.find('input');

    _.each(inputs, function (input) {
      data[input.name] = input.value;
    });

    console.log(data);

    // Set the views' promise.
    // The 'done' and 'fail' method specified in the initializer
    // will be attached to it. This is how you can control the outcome
    // of click the 'next' button, POSTing away the content, etc...
    this.promise = $.post(this.formAction, data)
                    .success(this.promiseSuccessCallback)
                    .done(function () {

                    })
                    .fail(this.promiseFailCallback);
  }
});

module.exports = LimeScreenView;