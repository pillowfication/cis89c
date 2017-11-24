# CIS89C

This website is hosted at http://voyager.deanza.edu/~20198403/.

The above link will not work after 2017, so I'm also hosting it at http://pf-n.co/github/cis89c.

In this README, I've documented the steps I've taken to facilitate development.

 - [Deploy with GitHub](#deploy-with-github)
 - [Develop Locally](#develop-locally)
 - [Setup Auto-deployment](#setup-auto-deployment)

## Deploy with GitHub

First of all, you can SSH into your Voyager box with

```bash
ssh username@voyager.deanza.edu
# This will prompt you for your password.
```

and you can leave with

```bash
exit
```

(If you leave your connection on and it "freezes", type `[Enter]~.` to quit.)

To remove the need for a password, generate some SSH keys.

```bash
# Check for existing keys first.
# If you already have a key like `~/.ssh/id_rsa` you can use it instead of generating a new one.
ls ~/.ssh

# Generate a key if needed.
# This will prompt you for a password to encrypt the key.
# You may leave the password blank for no password.
# Save the file at `~/.ssh/id_rsa`.
ssh-keygen -t rsa -b 4096 -C "email@website.com"

# Add `id_rsa.pub` to the server's `authorized_keys`.
ssh-copy-id username@voyager.deanza.edu
```

Try SSH'ing into your Voyager box again. There should be no password prompt anymore.

Create another SSH key on your Voyager box. This will be used to execute `git` commands (`git` comes installed). To add the key on GitHub, copy the public key `~/.ssh/id_rsa.pub` to your [GitHub SSH keys](https://github.com/settings/keys).

At this point, I assume you already have a repository up (located at https://github.com/username/repository) with all your website code so that we can replace the `~/public_html` with this repository. First delete `~/public_html`.

```bash
rm -rf ~/public_html
```

Then clone in your repository to `~/public_html`.

```bash
cd ~
git clone git@github.com:username/repository.git public_html
```

Now all your files can be moved using `git` whenever you need to. No more FTP!

```bash
cd ~/public_html
git pull
```

Be aware that now your `.git` folder is made public. Add a `.htaccess` file at the root of your website (that means `~/public_html/.htaccess`) and add the following line inside it:

```
RedirectMatch 404 /\.git
```

## Develop Locally

Ideally you shouldn't have to constantly push your files to the Voyager box in order to check if your code works. You need to start a web server on your own machine, develop there, then push when everything works. You can create an Apache server, but I really don't like Apache so I created a Node.js server instead. After all, this is a JavaScript course (and we don't need PHP).

First step is to install Node.js. For Windows, check out the `.msi` found [here](https://nodejs.org/en/download/). For Mac/Linux, I used NVM to install Node.js.


Install NVM:

```bash
apt-get update
apt-get install build-essential libssl-dev

# Get the NVM script.
curl -sL https://raw.githubusercontent.com/creationix/nvm/master/install.sh -o nvm.sh

# Execute the NVM script.
bash nvm.sh

rm nvm.sh
```

```bash
# Append the following to `~/.bashrc`.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

source ~/.nvm/nvm.sh
```

```bash
# Append the following to `~/.profile`.
source ~/.bashrc
```

Use NVM to install Node.js:

```bash
# Check the list of available version.
nvm ls-remote

# Install whichever version you choose.
nvm install <version>
```

Check that both `node` and `npm` are properly installed!

```bash
node --version
npm --version
```

Copy over the `_dev` folder onto your machine (in the root of your project folder; mine's at `~/ws/cis89c`). `_dev/deploy` contains the stuff for auto-deployment explained in the next section, and `_dev/local` contains the Node.js server we need. The other folders in `_dev` you can ignore. Go into the `_dev/local` folder and install all the necessary dependencies.

```bash
cd ~/ws/cis89c/_dev/local
npm i
```

Run the `setup` script that I've created at `_dev/local/setup.js`.

```bash
npm run setup
```

This will prompt for your Voyager username so that the website will be served at `/~username`. (Serving at `/~username` instead of `/` is to more closely imitate your Voyager website and to make sure that all your root-relative URLs are correct). Next, start up the server (which is the `_dev/local/server.js` script).

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

**WARNING: Never mind don't use this. It keeps creating read-only files owned by `apache` and I can't get rid of them anymore. This even applies to some files in `.git` which totally messes everything up. I just renamed `~/public_html` to `~/public_trash` and recloned everything.**

This assumes that `~/public_html` is a git repository. The idea is that every time you `git push` your code, a GitHub Webhook will send a little message to a deploy script on the Voygaer server. This deploy script will simply execute `git pull`, and thus your website is magically updated.

Create another SSH key on the Voyager box for user `apache` to use to execute the `git pull`s.

```bash
ssh-keygen -t rsa -b 4096 -C "email@website.com"
```

Save this somewhere like `~/apache_ssh/id_rsa` and not the default `~/.ssh/id_rsa` and don't put a password on it. Make sure user `apache` has access to read the `id_rsa` file with `chmod 644 ~/apache_ssh/id_rsa`. (If this was still in `~/.ssh` then Linux would keep complaining about some security issue I don't care about).

Add the public key `~/apache_ssh/id_rsa.pub` to your [GitHub SSH keys](https://github.com/settings/keys).

Copy over the `_dev` folder onto your server (in `~/public_html` if you didn't already from the previous section). `_dev/deploy` contains the stuff for auto-deployment, and `_dev/local` contains some Node.js stuff for local testing explained in the previous section. The other folders are irrelevant.

NOTE: This `_dev` folder may contain some information that should not be public. Only `_dev/deploy/deploy.php` will need to be accessible. Make sure your Apache and `.gitignore` stuff are configured appropriately.

Head over to `_dev/deploy/ssh_wrap` and edit the file to use the SSH key you created for user `apache` (just change the `username` from mine to yours). It should look like

```bash
#!/bin/bash
ssh -i /home/student/username/apache_ssh/id_rsa -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" "$@"
```

Make sure user `apache` can execute this file (check using `ls -l`). This may be a reoccurring issue since `git` kept changing this file's permissions on me. If user `apache` can't run it, you will see

```
=== ERROR: Could not pull ===
fatal: cannot exec '/home/student/username/public_html/_dev/deploy/ssh_wrap': Permission denied
```

This file is what `git` will use when trying to `git pull`. The problem is that when user `apache` tries to execute `git pull`, it normally tries to do its SSH business in `/var/www/.ssh`. User `apache` and I both cannot create/modify that `/var/www/.ssh` folder, so this `_dev/deploy/ssh_wrap` prevents user `apache` from trying to (by specifying the `id_rsa` location and omitting the `known_hosts` checks).

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
| SECRET      | This secret can be any string. You will need to remember it for when we create the webhook later on. |
| GIT         | Path to your `git` executable. Should be `/usr/bin/git`. |
| SSH_WRAP    | Path to that `ssh_wrap` file. Should be `/home/student/username/public_html/_dev/deploy/ssh_wrap`. |
| REPO_NAME   | The name of your repository in the form `username/repository`. |
| REPO_BRANCH | The name of your branch in that repository. Only pushes to the branch specified will trigger deployment. |
| LOGFILE     | Where to store log messages. |

Head over to your repository's Settings page and click the Webhooks tab  (https://github.com/username/repo/settings/hooks). Create a new Webhook with the following settings:

 - Payload URL: `http://voyager.deanza.edu/~username/_dev/deploy/deploy.php` (make sure this points to your `~/public_html/_dev/deploy/deploy.php` file)
 - Content type: `application/json`
 - Secret: (enter the same secret your created earlier in `~/public_html/_dev/deploy/config.php`)
 - Which events would you like to trigger this webhook?: `Just the push event.`
 - Active: `yes`

Everything should be set up now! Make sure your `git` working directory is clean (check using `git status`) and make a test push to the branch you specified in `~/public_html/_dev/deploy/config.php`. Hopefully everything runs smoothly, and your log file will say `SUCCESS` (and not `ERROR`).

**Issues:**

 - When the `deny()` function is called in `deploy.php`, the reason is mysteriously not logged.
 - Sometimes when user `apache` executes the `git pull`, new or modified files will be created as read-only (`644`) and owned by `apache`. Subsequence pulls that try to modify those files again will error. Right now I'm just deleting and recreating those files with the right permissions.

```
error: insufficient permission for adding an object to repository database .git/objects
fatal: failed to write object
fatal: unpack-objects failed
```
