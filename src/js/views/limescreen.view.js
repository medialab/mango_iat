var $ = require('jquery'),
    Backbone = require('backbone');

Backbone.$ = $;

var LimeScreenView = Backbone.View.extend({
  $question: null,
  $nextBtn: null,

  render: function () {
    if (!this.$el) {
      this.$el = $(this.el);
    }

    this.$question = this.$el.find('.question_wrapper');
    this.$nextBtn = this.$el.find('#movenextbtn');

    this.$nextBtn.on('click', function (e) {
      e.preventDefault();
    });

    return { el: this.el };
  }
});

module.exports = LimeScreenView;