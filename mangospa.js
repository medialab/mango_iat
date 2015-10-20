if (!window.$ || !window._) {
  console.error('[Mango Single Page App] Dependencies missing. Aborting...');
} else {
  var $ = window.$,
      _ = window._;

  $(function () {
      var $content = $('#content'),
          $rootView = null,
          numOfQuestions = 0,
          welcomePageObject = {};

    if (!verifyIfSinglePageAppIsRequired()) {
      return;
    }

    console.info('[Mango Single Page App] Initializing.');

    replaceLimeSurveyLayout();

    welcomePageObject = getScrapedWelcomePage();
    $rootView.append(welcomePageObject.$el);

    welcomePageObject.$nextBtn.on('click', function (e) {
      e.preventDefault();
      $.ajax({
        type: 'POST',
        url: welcomePageObject.requestUrl,
        data: welcomePageObject.requestBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function (htmlString) {
        var $domExtract = $(extractNodeTree(htmlString));
        $rootView.html($domExtract);
      }).fail(function () {
        console.error('[Mango Single Page App] Fetching questions — request failed.');
      });
    });

    function verifyIfSinglePageAppIsRequired() {
      return $('title').get(0).text.indexOf('[IAT]') > -1;
    }

    function replaceLimeSurveyLayout() {
      console.log('[Mango Single Page App] Hiding LimeSurvey layout.');

      $('body')
        .append('<div id="mangospa"></div>')
        .css({
          'overflow': 'hidden'
        });

      $rootView = $('#mangospa');

      $rootView
        .css({
          'position': 'fixed',
          'overflow': 'auto',
          'top': 0,
          'left': 0,
          'width': '100%',
          'height': '100%',
          'background-color': '#CCC'
        });
    }

    function getScrapedWelcomePage() {
      numOfQuestions = getNumberOfQuestions();
      console.log('[Mango Single Page App] Survey has ' + numOfQuestions + ' questions.');

      var $formNode = $content.find('form#limesurvey'),
          $nextBtn = $formNode.find('#movenextbtn'),
          $formInputs = $formNode.find('input'),
          formAction = $formNode.attr('action'),
          dataToPost = {},
          promise = null,
          moveNext = $nextBtn.attr('value');

          dataToPost[moveNext] = moveNext;

      _.each($formInputs, function (input) {
        dataToPost[input.name] = input.value;
      });

      $formNode.on('submit', function (e) {
        e.preventDefault();
      });

      return {
        requestBody: dataToPost,
        requestUrl: formAction,
        $el: $formNode,
        $nextBtn: $nextBtn
      };
    }

    function extractNodeTree(htmlString) {
      var match = htmlString
                    .replace(/(\r\n|\n|\r|\s{3,})/gm, '')
                    .match(/<!-- START THE GROUP -->(.*)<!-- END THE GROUP -->/);

      return (_.isArray(match) && match.length > 1) ? match[1] : '';
    }

    function getNumberOfQuestions() {
      var domString = $content.find('.question_wrapper').prop('outerHTML');
      var match = domString.match(/There are (\d) question/);
      return (_.isArray(match) && match.length > 1) ? parseInt(match[1]) : 0;
    }

  }());
}