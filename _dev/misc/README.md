# \_dev/misc

Miscellaneous code...

## CIS89C Students

The original [Student Websites](https://cluster55-files.instructure.com/courses/8683~2627/files/8683~366547/course%20files/websites.html?download=1&inline=1&sf_verifier=bce48cf115a1595f10eec516215b7b21&ts=1508972567&user_id=86830000000010692) page was incomplete and out of date, so I made an updated version at http://voyager.deanza.edu/~20198403/cis89c.html.

 1. Collect all registered student accounts with `ls /home/student > ~/public_html/_dev/misc/students.txt`.

 2. For each student account, make a request to `http://voyager.deanza.edu/~student/` and check for a non-empty response. Write the passed accounts to `students-passed.txt`. (See `check-students.js`).

 3. Each passed account now was found to be either part of CIS89A or CIS89C (or both). I manually checked each URL and kept only the CIS89C ones. The results are found at `/cis89c/cis89c.html`.
