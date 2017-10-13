<?php

echo "<pre>";
exec("GIT_SSH=/home/student/20198403/public_html/_dev/deploy/ssh_wrap /usr/bin/git pull 2>&1", $output, $exit);
if ($exit == 0) {
  echo "*** SUCCESS ***" . PHP_EOL;
} else {
  echo "=== ERROR: Could not pull ===" . PHP_EOL;
  echo implode(PHP_EOL, $output) . PHP_EOL;
}
echo "</pre>";
