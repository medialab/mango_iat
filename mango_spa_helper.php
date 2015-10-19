<?php
/**
 * Helper function to return results as a JSON payload.
 *
 * @param  array $args An array of optional arguments (success, message, data).
 * @return string      A JSON-encoded payload - (bool)success, (str)message, (mixed)data
 */
function json($args) {
  $defaults = [
    'success' => false,
    'message' => '',
    'data' => null
  ];

  $params = array_merge($defaults, $args);

  echo json_encode([
    'success' => $params['success'],
    'message' => $params['message'],
    'data' => $params['data']
  ]);
}

// A 'csrf' variable from user input must match
// that of the server to proceed.
if (array_key_exists('csrfInput', $_GET)) {

  /**
   * Extract the CSRF token for the cookies string.
   * @param  string $cookies The cookies string from HTTP_COOKIE.
   * @return string          The string value of the CSRF token.
   */
  function getCSRFToken($cookies) {
    // The regex pattern we're looking for in the array of cookies.
    $pattern = 'csrftoken=';

    // Split the string right in the ';' to turn it into array indices.
    $data = explode('; ', $cookies);

    // Within this array, pick up the entry matching our search pattern.
    // Note that $match is an array.
    $match = preg_grep("/^($pattern)(.*)$/", $data);

    // If any result is found, extract the value. Because preg_grep has
    // kept the index of the picked up value when creating the $match
    // array, we can't rely on any index number to extract the data.
    // The array_values functions comes to the rescue.
    if ($match && count($match) > 0) {
      $tokenString = array_values($match)[0];
      return substr($tokenString, strlen($pattern));
    }
  }

  // Get the 'csrfInput' variable.
  $csrfInput = filter_input(INPUT_GET, 'csrf', FILTER_SANITIZE_STRING);

  // Get the cookies when extract the CSRF token.
  $cookies = $_SERVER['HTTP_COOKIE'];
  $csrfServer = getCSRFToken($cookies);

  if ($csrfInput == $csrfServer) {
    echo $cookies;
    return;
  }

  return json(['success' => false, 'message' => 'Token mismatch.']);
}

return json(['success' => false, 'message' => 'Missing CSRF token.']);
?>