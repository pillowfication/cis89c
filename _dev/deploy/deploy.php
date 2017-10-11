<?php

require_once "config.php";
require "jsonwrapper/jsonwrapper.php"; // For PHP < 5.2.0

$content = file_get_contents("php://input");
$json    = json_decode($content, true);
$log     = fopen("deploy.log", "a");

date_default_timezone_set("UTC");
fwrite($log, date("d-m-Y (H:i:s)", time()) . PHP_EOL);

// Forbid connection
function deny($reason) {
  fwrite($log, "=== ERROR: " . $reason . " ===" . PHP_EOL . PHP_EOL);
  fclose($log);
  header("HTTP/1.0 403 Forbidden");
  exit;
}

if (!isset($_SERVER["HTTP_X_HUB_SIGNATURE"])) {
  deny("No token found");
} else {
  // Check token
  list($algo, $token) = explode("=", $_SERVER["HTTP_X_HUB_SIGNATURE"], 2);
  if ($token !== hash_hmac($algo, $content, TOKEN)) {
    deny("Token did not match");
  }

  // Check repo and branch
  if ($json["repository"]["full_name"] !== REPO_NAME || $json["ref"] !== "refs/heads/" . REPO_BRANCH) {
    deny("Repository " . $json["repository"]["full_name"] . "/" . $json["ref"] . " did not match");
  }
}

// Pull the repo
shell_exec(GIT . " pull");
fputs($file, "*** SUCCESS ***" . PHP_EOL);

// Close connection
ob_start();
header("HTTP/1.1 200 OK");
header("Connection: close");
header("Content-Length: " . ob_get_length());
ob_end_flush();
ob_flush();
flush();

fwrite($log, $content . PHP_EOL . PHP_EOL);
fclose($log);
