# phisherman
A real fake social engineering app

## Objectives & Requirements

### Goals:
Educate users on phishing and MFA bypass techniques.
Demonstrate a full killchain—from phishing email delivery to MFA token capture.

### Core Features:
User account creation and legitimate MFA registration (using mobile authenticators).
Mock sensitive data display (first/last name, credit card info, SSN).

* Two distinct backends:
  * Real Backend: Implements standard MFA flows.
  * Fake Backend: Automates MFA challenge responses for simulation.

Phishing simulation using Evilginx (or similar) to generate phishlet links.

### Two attack vectors:
1. Automated Email-based Attack: Backend receives an email containing a phishlet link, automatically clicks the link, simulates authentication, and retrieves the JWT token.

2. Manual (Self-Phishing) Attack: A user clicks the phishlet link and goes through the MFA process manually to see the full end-to-end process.


## Tech stack

### Backend:
* Node.js for robust, asynchronous API development.

### Frontend: 
* React for a modern and interactive UI.

### Database: 
* SQLite - because I like it.

### Email Service: 
* MailHog for simulating email interactions locally.

### Containerization: 
* Docker Compose to tie all these services together, ensuring consistency across development and testing.
