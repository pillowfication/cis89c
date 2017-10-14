# CIS89C

This website is hosted at http://voyager.deanza.edu/~20198403/.

## Setup Auto-deployment

**What I've done here isn't very good, but it's only for one quarter. Be warned. I really have no idea how Linux, Apache, PHP, and SSH work...**

Create an SSH key for user `apache` to use to make the Git pulls.

```bash
ssh-keygen -t rsa -b 4096 -C "thebluepillow@gmail.com"
```

Save this somewhere like `~/apache_ssh/id_rsa` and not the default `~/.ssh/id_rsa` and don't put a password on it. Make sure user `apache` has access to read the `id_rsa` file with `chmod 644 ~/apache_ssh/id_rsa`. (If this was still in `~/.ssh` then Linux would keep complaining).

Add the public key `~/apache_ssh/id_rsa.pub` to your GitHub SSH keys (https://github.com/settings/keys).

Copy over the `_dev` folder onto your server (in `~/public_html`). This assumes that `~/public_html` is a git repository. `_dev/deploy` contains the stuff for auto-deployment, and `_dev/local` contains some Node.js stuff for local testing. You can ignore `_dev/local` for now, or just delete it if you want.

NOTE: This `_dev` folder may contain some information that should not be public. Only `_dev/deploy/deploy.php` will need to be accessible. Make sure your Apache and `.gitignore` stuff are configured appropriately.

Head over to `_dev/deploy/ssh_wrap` and edit the file to use the SSH key you created for user `apache`. It should look like

```bash
#!/bin/bash
ssh -i /home/student/USERNAME/apache_ssh/id_rsa -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" "$@"
```

Make sure user `apache` can execute this file (use `ls -l`). This may be a reoccurring issue since git kept changing this file's permissions on me. If user `apache` can't run it, you will see

```
=== ERROR: Could not pull ===
fatal: cannot exec '/home/student/username/public_html/_dev/deploy/ssh_wrap': Permission denied
```

This file what git will use when trying to `git pull`. The problem is that when user `apache` tries to execute `git pull`, it normally tries to do its SSH stuff in `/var/www/.ssh`. User `apache` and I both cannot create that `/var/www/.ssh` folder, so this `_dev/deploy/ssh_wrap` prevents user `apache` from trying to (by specifying the `id_rsa` location and omitting the `known_hosts` checks).

```
=== ERROR: Could not pull ===
Could not create directory '/var/www/.ssh'.
```

Now copy `config.sample.php` to `config.php` and edit that file to match your settings.

```bash
cd ~/public_html/_dev/deploy
cp config.sample.php config.php
nano config.php
```

| key         | description |
|-------------|-------------|
| TOKEN       | This token can be anything. You will need to remember it for when we create the webhook later on. |
| GIT         | Path to your git executable. Should be `/usr/bin/git`. |
| SSH_WRAP    | Path to that `ssh_wrap` file. Should be `/home/student/username/public_html/_dev/deploy/ssh_wrap`. |
| REPO_NAME   | The name of your repository in the form `username/repo`. |
| REPO_BRANCH | The name of your branch in that repository. Only pushes to the branch specified will trigger deployment. |
| LOGFILE     | Where to store log messages. |

Head over to your repository's Settings page and click the Webhooks tab  (https://github.com/username/repo/settings/hooks). Create a new Webhook with the following settings:

 - Payload URL: `http://voyager.deanza.edu/~username/_dev/deploy/deploy.php` (make sure this points to your `~/_dev/deploy/deploy.php` file)
 - Content type: `application/json`
 - Secret: (enter the secret your created in `~/public_html/_dev/deploy/config.php`)
 - Which events would you like to trigger this webhook?: `Just the push event.`
 - Active: `yes`

Everything should be set up now! Make sure your git working directory is clean and make a test push to the branch you specified in `~/public_html/_dev/deploy/config.php`. Hopefully everything runs smoothly, and your log file will say `SUCCESS` (and not `ERROR`).
