var $ = require('jquery'),
    Backbone = require('backbone'),
    template = require('../templates/mangospa.template.hbs');

Backbone.$ = $;

var MangoSpaView = Backbone.View.extend({
  tagName: 'div',
  id: 'mango-spa',
  template: template,

  initialize: function () {
    console.log('[Mango SPA] Initializing MangoSpaView.');
  },

  render: function () {
    this.$el.html(template());
    return this;
  }
});

module.exports = MangoSpaView;