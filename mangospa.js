if (!window.$ || !window._) {
  console.error('[Mango Single Page App] Dependencies missing. Aborting...');
} else {
  var $ = window.$,
      _ = window._;

  $(function () {
      // Declare and/or assign parsable DOM node,
      // jQuery-wrapped DOM for building single page app,
      // object holding relevant element from the parsing
      // of the welcome page, and boolean flag to check
      // if preliminary work is done.
      var $content = $('#content'),
          $rootView = null,
          welcomePageObject = {},
          isReady = false;

      // Constants for keyboard inputs.
      var KEYCODE_E = 69,
          KEYCODE_I = 73;

      var answerFormMatchingInputs = [],
          resultsFormData = {};

    // Check to see we go further with SPA or quit.
    if (!verifyIfSinglePageAppIsRequired()) {
      return;
    }

    // If this point is reached, SPA is initializing.
    // Place an overlay on top of LimeSurvey's regular content,
    // and check if no error code is appearing in the page
    // (e.g. if we're not authorized to see the content) to
    // ensure we can proceed.
    console.info('[Mango Single Page App] Initializing.');
    replaceLimeSurveyLayout();
    if (!isReady) {
      return;
    }

    // Parse the welcome page and extract relevant data from it,
    // including form information to spoof submission via AJAX,
    // and DOM elements we need.
    welcomePageObject = getScrapedWelcomePage();

    // Set up a UI using parsed element.
    $rootView.append(welcomePageObject.$el);

    // Hijack submit button to prevent regular form submission,
    // while fetching the actual POST result via ajax.
    // Get the HTML raw string as a result, DOMize it via jQuery,
    // and use it as a base to build jsPsych-related content.
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
        initJsPsych(parseForJsPsych($domExtract));
        resultsFormData = prepareFormAnswerPostData($(htmlString));
        answerFormMatchingInputs = prepareFormAnswerMatching($domExtract);
        console.log(resultsFormData, answerFormMatchingInputs);
      }).fail(function () {
        console.error('[Mango Single Page App] Fetching questions — request failed.');
        return dispose();
      });
    });

    function verifyIfSinglePageAppIsRequired() {
      return $('title').get(0).text.indexOf('[IAT]') > -1;
    }

    function replaceLimeSurveyLayout() {
      console.log('[Mango Single Page App] Hiding LimeSurvey layout.');

      if (findPossibleStartupError()) {
        console.info('[Mango Single Page App] Looks like there is a LimeSurvey displayed on page. I\'m aborting...');
        return dispose();
      }

      isReady = true;

      $('body')
        .append('<div id="mangospa"></div>')
        .css({
          'overflow': 'hidden'
        });

      $rootView = $('#mangospa');

      $rootView
        .css({
          'position': 'absolute',
          'overflow': 'auto',
          'top': 0,
          'left': 0,
          'width': '100%',
          'height': '100%',
          'background-color': '#CCC'
        });
    }

    function findPossibleStartupError() {
      var $errorMessage = $content.find('#tokenmessage .error');
      return $errorMessage.length > 0;
    }

    function getScrapedWelcomePage() {
      var $formNode = $content.find('form#limesurvey'),
          $nextBtn = $formNode.find('#movenextbtn'),
          $formInputs = $formNode.find('input'),
          formAction = $formNode.attr('action'),
          dataToPost = {},
          promise = null,
          moveNext = $nextBtn.attr('value');

          // Get a pivotal piece of data from
          // the 'next' button, to move LimeSurvey's
          // state manager.
          dataToPost[moveNext] = moveNext;

      // Create request body for POSTing.
      _.each($formInputs, function (input) {
        dataToPost[input.name] = input.value;
      });

      // Ensure form submit without clicking on our
      // hijacked button is void.
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

      return (match && match.length > 1) ? match[1] : '';
    }

    function parseForJsPsych($domTree) {
      // From LimeSurvey's raw DOM, get the pieces used as
      // choices (left and right parts of the screens).
      var choicesElements = [];
      _.each($domTree.find('td').find('p'), function (p, i) {
        if (i % 2 === 0) {
          choicesElements.push([p.innerText]);
        } else {
          choicesElements[choicesElements.length - 1].push(p.innerText);
        }
      });

      // From LimeSurvey's raw DOM, get the stimuli words
      var stimuliWords = _.map($domTree.find('table ~ p'), function (p) {
        return p.innerText;
      });

      // Use this data to create the pieces for jsPsych
      // (ignore the misleading/ambiguous usage of words like "stimuli" in jsPsych).
      var jsPsychStimuli = createJsPsychStimuli(choicesElements, stimuliWords)
          jsPsychKeyChoices = _.times(jsPsychStimuli.length, function () {
            return [KEYCODE_E, KEYCODE_I];
          });

      return {
        choices: jsPsychKeyChoices,
        stimuli: jsPsychStimuli
      };
    }

    function initJsPsych(data) {
      $rootView.html('');

      var jsPsychBlocks = _.map(data.stimuli, function (stim, i) {
        return {
          type: 'single-stim',
          stimuli: [stim],
          is_html: true,
          choices: data.choices[i]
        };
      });

      return jsPsych.init({
        display_element: $rootView,
        experiment_structure: jsPsychBlocks,
        on_finish: function (data) {
          parseTestResults(data);
        }
      });
    }

    function createJsPsychStimuli(choicesElements, stimuliWords) {
      var howMany = stimuliWords.length,
          htmlChunks = [];

      // Rearrange choices elements by pair so that we have
      // arrays grouping left and right choices on screen.
      var choicesElements = _.chunk(choicesElements, 2);

      // Create markup for each jsPsych stimuli.
      _.each(choicesElements, function (choice, i) {
        var markup = '<div class="jspsych-stimulus" rel="{left:\'' + choice[0][0] + '|' + choice[0][1] + '\',right:\'' + choice[1][0] + '|' + choice[1][1] + '\'}">' +
                     '  <div class="jspsych-choices">' +
                     '    <div class="jspsych-choice-left"><p>' + choice[0][0] + '</p><p>' + choice[0][1] + '</p></div>' +
                     '    <div class="jspsych-choice-right"><p>' + choice[1][0] + '</p><p>' + choice[1][1] + '</p></div>' +
                     '  </div>' +
                     '  <div class="jspsych-stimulus-word">' + stimuliWords[i] + '</div>' +
                     '</div>';
        htmlChunks.push(markup);
      });

      return htmlChunks;
    }

    function prepareFormAnswerPostData($domTree) {
      var resultsFormData = {};

      // Value extracted from submit button,
      // needed to alter LimeSurvey's state manager.
      resultsFormData['movesubmit'] = 'movesubmit';

      _.each($domTree.find('input[type="hidden"]'), function (elm) {
        resultsFormData[elm.name] = elm.value;
      });
      return resultsFormData;
    }

    function prepareFormAnswerMatching($domTree) {
      var answerFormMatchingInputs = [];
      _.each($domTree.find('input[type="text"]'), function (input) {
        answerFormMatchingInputs.push({
          name: input.name,
          value: ''
        });
      });
      return answerFormMatchingInputs
    }

    function parseTestResults(rawData) {
      console.log(rawData);
    }

    function dispose() {
      console.info('[Mango Single Page App] Stopping and cleaning up...');
    }

  }());
}