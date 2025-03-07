# phisherman
A real fake social engineering app - [Created for SANS SEC565](https://www.sans.org/cyber-security-courses/red-team-operations-adversary-emulation/) - but OpenSourced to the world. 



https://github.com/user-attachments/assets/32060b97-3692-4a2d-a4a1-d40cb2016ef0




## Objectives & Requirements

### Goals:
Educate users on phishing and MFA bypass techniques.
Demonstrate a full killchain—from phishing email delivery to MFA token capture.


This application has 2 git branches. One intended for self-hosting which includes mailhog and evilginx in a container. This will run the application on the host and have full functionality support.

The other branch is intended for "production" i.e hosted on a webserver.
There is a demo available on [sec565.rocks](https://sec565.rocks) - it does reset itself every 30 minutes.

This version of the application is blocking all write operations and serves as a demo environment. 

You will have to bring your own public facing evilginx instance.

### Core Features:
User account creation and legitimate MFA registration (using mobile authenticators).
Mock sensitive data display (first/last name, credit card info, SSN).

* Two backend functionalities:
  * Real Backend: Implements standard MFA flows, allowing users to register to the application.
  * Fake Backend: Simulates a Victim user (hardcoded) to insert their information into a phishlet provided by the user of this app through the phishing simulation feature.

Phishing simulation using Evilginx (or similar) to generate phishlet links.

### Two attack vectors:
1. Automated Email-based Attack: Backend receives an email containing a phishlet link, automatically clicks the link, simulates authentication, and retrieves the JWT token.

2. Manual (Self-Phishing) Attack: A user clicks the phishlet link and goes through the MFA process manually to see the full end-to-end process.


## Tech stack

### Backend:
* Node.js and express for robust, asynchronous API development.

### Frontend: 
* React and vite for a modern and interactive UI.

### Database: 
* SQLite - because I like it.

### Email Service: 
* MailHog for simulating email interactions locally.

### Containerization: 
* Docker Compose to tie all these services together, ensuring consistency across development and testing.


## Instructions - Self hosted setup 

This repo is intended to be ran on containers, you can with minor tweaks host this outside docker as well. These instructions will cover Docker only. So make sure docker is in fact installed :)

1. clone this git repo
2. cd into phisherman
3. run `docker compose up --build` 


#### IP overview

The docker setup is using the docker network stack for routing. The IP's are hardcoded in the `docker-compose` file. 
For convience, this repo contains a hosts file that you can append to your local machines host file.

```bash
172.13.37.11    sec565.rocks
172.13.37.12    sec565.phish
172.13.37.13    mailhog.local
```

If this would clash with your local subnet, make sure to change the IPs and hostfile, as this hostfile is also used inside the containers themselves. 

#### Web Application
There is a standard database that creates the victim user as well as some mock fake sensitive data. This is hardcoded.
The victim user is hardcoded to `victim@sec565.rocks` with the password `password123`. This user has MFA enabled and is behaving like real MFA would. A TOTP. 

You can also create your own user, you will need a mobile phone to scan the QR code and enroll in MFA. 

Once registered, you can login to the application and perform various Create Read Update Delete operations on the users as well as the sensitive data segment. 

Registering for an account and the CRUD operations are just for show, as you can also choose to directly go to the phishing simulation page. 


##### EvilGinx
Before sending a phish, you will need to setup EvilGinx. For convenience, I added EvilGinx's latest pre-compiled binary in this repo which is used in the build process of the EvilGinx container. Feel free to replace this binary with your own downloaded (or compiled) EvilGinx binary. In this current setup, you will need to use EvilGinx in container form, not hosted on your host, as the backend needs to be able to reach it. You could hack your way around this by using bridged docker networking, but I found it simpler to run it inside the container. 

You can bash into the docker container by running

```bash
docker exec -it phisherman-evilginx-1 /bin/bash
```

From there you can run EvilGinx **IN DEVELOPER MODE**: `.\evilginx -developer`

Again, for convenience the phishlet and redirector folders inside the EvilGinx folder of this project are mounted into the container.
This means that you can modify phishlets and redirectors in your favorite editor on your host instead of inside the container. 


I will not be going into how to configure EvilGinx, I leave this to you. If you need help, I suggest reading the wiki on the official EvilGinx repo or taking the phishing mastery course by Kuba or take [SANS SEC565](https://www.sans.org/cyber-security-courses/red-team-operations-adversary-emulation/) ;) 


#### Phishing Simulation

The main feature of this application is the Phishing Simulated backend. <br>

This backend will automatically try to connect to your phishlet and login as the victim user. 

It is of course imperative that the phishlet is enabled and reachable by your docker containers I.E, once again, run EvilGinx inside the container or, use an internet facing EvilGinx instance if you want, as those can also be reached by your containers. 

You can start a phishing sim without registering an account. You do require a propper to, subject, and mail body that contains your phishlet lure URL. 


#### Mailhog

You can see the emails arriving to your mailbox over at http://mailhog.local:8025, it wasn't actually needed to have a fake mail backend, but it's cool to see the entire phishing chain end to end and make it more realistic. 




## Instructions deployment to "prod"

The "hosted version" branch of this repository is using the actual "production" version of this application. I.E. Vite has built the frontend into a distributable version. 

The frontend can be hosted on any webserver, however the code is currently configured to use dockers internal networking. The dockerfile for the frontend is different in this github branch than it is on the main branch. 

For this setup we are using httpd and this version of the app has middleware that blocks any write operations on the application as this is intended to be able to handle multiple users logging into the webapp. 

If you do decide to host this, make sure to remove the database.sqlite every now and then, if it becomes too large it will barf on you. The code automatically recreates the database when it's deleted. 

The compose in this branch does not compose a mailhog or an evilginx instance. Again, this would be a "bring your own EvilGinx" type of situation. It needs to be internet facing so that your prod app can reach it. 

There is a demo available on https://sec565.rocks - it does reset every 30 minutes though :)
