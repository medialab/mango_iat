# Goal
Set a single page app layer on top of Limesurvey's [mango](https://raw.githubusercontent.com/medialab/mango_core) template,
becoming a bridge between Limesurvey's backend and a IAT. Uses [jsPsych](http://jspsych.org) as a front-end interface.

For more information about Implicit Association Tests, [click here](https://implicit.harvard.edu/implicit/education.html).

# Installation
Because **mangoiat.js** should be a low-footprint, ad-hoc solution, it's purposely not distributed in a **grunt/gulp** setup.
It is dependent to jQuery and Lodash well as jsPsych.

## Install the mango template and router plugin
* Follow instructions [here](https://github.com/medialab/mango_core#readme).

## Add dependencies
* Get [jsPsych](https://github.com/jodeleeuw/jsPsych) and place the distribution folder in your `/upload/templates/mango/scripts/` directory.
* Clone this repository inside `/upload/templates/mango/scripts/` to create a `mango_iat` subfolder.
* Open `/upload/templates/mango/startpage.pstpl` and add the path to the Lodash and jsPsych dependencies in the `<head>` as such:

```
<script type="text/javascript"src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js"></script>
<script type="text/javascript"src="{TEMPLATEURL}scripts/jspsych-4.3/jspsych.js"></script>
<script type="text/javascript" src="{TEMPLATEURL}scripts/jspsych-4.3/plugins/jspsych-text.js"></script>
<script type="text/javascript" src="{TEMPLATEURL}scripts/jspsych-4.3/plugins/jspsych-single-stim.js"></script>
```

* Finally, add `mangoiat.js`, preferably at the end of `/upload/templates/mango/startpage.pstpl`, like this:

```
<script type="text/javascript" src="{TEMPLATEURL}scripts/mango_iat/mangoiat.js"></script>
```

## Usage
1. In the backend, create a survey, stylized using the **Mango** template.
2. **Its name should include "[IAT]"**, e.g. _"[IAT] Trust and well-being"_. Mango IAT looks for the value `[IAT]` within the name to start itself up.
3. Create a question group with its welcome and ending screens.
4. Create a question within the group.
5. Question should be **Mandatory**, with _type_ set to **Short Free Text**.
6. Within the _question_ field, use the WYSIWYG to create a single-row, double-column table.
7. Fill the left column with what you'd want to see on the left half of the screen, and the right column with what you expect on the right half of the screen.
8. Below the table, add the stimulus word for this block.
9. Save and repeat steps 4 to 8 with another question.

Upon completion of the test, the answers will be matched to the related form input set in the backend.

## Limitations
Current limitations will be to circumvented later on as need be. They are, among many others:
* Not possible to deal with several groups of question. One IAT test = one question group.
* Styling is _inline_, making it difficult to edit.


# Credits
[medialab](http://www.medialab.sciences-po.fr/)
