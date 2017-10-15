# CIS89C

This website is hosted at http://voyager.deanza.edu/~20198403/.

In this README, I've documented the steps I've taken to facilitate development.

 - [Deploy with GitHub](#deploy-with-github)
 - [Develop Locally](#develop-locally)
 - [Setup Auto-deployment](#setup-auto-deployment)

## Deploy with GitHub

First of all, you can SSH into your Voyager box with

```bash
ssh username@voyager.deanza.edu
```

and you can leave with

```bash
exit
```

To remove the need for a password, generate some SSH keys.

```bash
# Check for existing keys first
ls ~/.ssh

# Generate a key if needed
ssh-keygen -t rsa -b 4096 -C "email@website.com"

# Add `id_rsa.pub` to the server's `authorized_keys`
ssh-copy-id username@voyager.deanza.edu
```

Create another SSH key on your Voyager box. This will be used to make `git pull`s (`git` comes installed). To add the key on GitHub, copy the public key `~/.ssh/id_rsa.pub` to your GitHub SSH keys (https://github.com/settings/keys).

At this point, I assume you already have a repository up with all your website code so that we can replace the `~/public_html` with this repository. First delete `~/public_html`.

```bash
rm -rf ~/public_html
```

Then clone in your repository to `~/public_html`.

```bash
cd ~
git clone git@github.com:username/repo.git public_html
```

Now all your files can be moved using `git` whenever you need to. No more FTP!

```bash
cd ~/public_html
git pull
```

Be aware that now your `.git` folder is made public. Add a `.htaccess` file at the root of your website (`~/public_html`) and add the following line inside it

```
RedirectMatch 404 /\.git
```

## Develop Locally

Ideally you shouldn't have to constantly push your files to the Voyager box in order to check if your code works. You need to start a web server on your own machine, develop there, then push when everything works. You can create an Apache server, but I really don't like Apache so I created a Node.js server instead. After all, this is a JavaScript course.

First step is to install Node.js. For Windows, check out the `.msi` [here](https://nodejs.org/en/download/). For Mac/Linux, I used NVM instead.


Install NVM

```bash
apt-get update
apt-get install build-essential libssl-dev
curl -sL https://raw.githubusercontent.com/creationix/nvm/master/install.sh -o nvm.sh
bash nvm.sh
rm nvm.sh

# Append this to .bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

source ~/.nvm/nvm.sh

# Append this to .profile
source ~/.bashrc
```

Use NVM to install Node.js

```bash
nvm ls-remote
nvm install <version>
```

Check that both `node` and `npm` are installed

```bash
node --version
npm --version
```

Copy over the `_dev` folder onto your machine (in the root of your project folder; mine's at `~/ws/cis89c`). `_dev/deploy` contains the stuff for auto-deployment explained in the next section, and `_dev/local` contains the Node.js server we need. Go into the `_dev/local` folder and install all the necessary dependencies.

```bash
cd ~/ws/cis89c/_dev/local
npm i
```

Run the `setup` script.

```bash
npm run setup
```

This will prompt for your Voyager username so that the website will be served at `/~username`. Next, start up the server.

```bash
npm start
```

Your website is now hosted at `localhost:3000/~username/`! To change the port, add an argument after `npm start`.

```bash
npm start 80
```

To stop the server, press `ctrl-c`. You can try using `pm2` to manage your server if you need to.

```bash
npm i -g pm2
pm2 start ~/ws/cis89c/_dev/local/server.js --name voyager
```

## Setup Auto-deployment

**What I've done here isn't very good, but it's only for one quarter. Be warned. I really have no idea how Linux, Apache, PHP, and SSH work...**

Create an SSH key for user `apache` to use to make the `git pull`s.

```bash
ssh-keygen -t rsa -b 4096 -C "email@website.com"
```

Save this somewhere like `~/apache_ssh/id_rsa` and not the default `~/.ssh/id_rsa` and don't put a password on it. Make sure user `apache` has access to read the `id_rsa` file with `chmod 644 ~/apache_ssh/id_rsa`. (If this was still in `~/.ssh` then Linux would keep complaining).

Add the public key `~/apache_ssh/id_rsa.pub` to your GitHub SSH keys (https://github.com/settings/keys).

Copy over the `_dev` folder onto your server (in `~/public_html`). This assumes that `~/public_html` is a git repository. `_dev/deploy` contains the stuff for auto-deployment, and `_dev/local` contains some Node.js stuff for local testing explained in the previous section.

NOTE: This `_dev` folder may contain some information that should not be public. Only `_dev/deploy/deploy.php` will need to be accessible. Make sure your Apache and `.gitignore` stuff are configured appropriately.

Head over to `_dev/deploy/ssh_wrap` and edit the file to use the SSH key you created for user `apache`. It should look like

```bash
#!/bin/bash
ssh -i /home/student/USERNAME/apache_ssh/id_rsa -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" "$@"
```

Make sure user `apache` can execute this file (use `ls -l`). This may be a reoccurring issue since `git` kept changing this file's permissions on me. If user `apache` can't run it, you will see

```
=== ERROR: Could not pull ===
fatal: cannot exec '/home/student/username/public_html/_dev/deploy/ssh_wrap': Permission denied
```

This file what `git` will use when trying to `git pull`. The problem is that when user `apache` tries to execute `git pull`, it normally tries to do its SSH stuff in `/var/www/.ssh`. User `apache` and I both cannot create that `/var/www/.ssh` folder, so this `_dev/deploy/ssh_wrap` prevents user `apache` from trying to (by specifying the `id_rsa` location and omitting the `known_hosts` checks).

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
| GIT         | Path to your `git` executable. Should be `/usr/bin/git`. |
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

Everything should be set up now! Make sure your `git` working directory is clean and make a test push to the branch you specified in `~/public_html/_dev/deploy/config.php`. Hopefully everything runs smoothly, and your log file will say `SUCCESS` (and not `ERROR`).

**Issues:**

 - When the `deny()` function is called in `deploy.php`, the reason is mysteriously not logged.
 - Sometimes when user `apache` executes the `git pull`, new or modified files will be created as read-only (`644`) and owned by `apache`. Subsequence pulls that try to modify those files again will lead to the following error

```
error: insufficient permission for adding an object to repository database .git/objects
fatal: failed to write object
fatal: unpack-objects failed
```
