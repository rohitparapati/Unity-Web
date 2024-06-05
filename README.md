# Unity Web

## Overview
Unity Web is a web application designed to bridge the gap between customers and home appliance service providers such as plumbers and electricians. This platform enables users to securely sign up or log in to access a vetted list of services. Upon selecting a service, detailed information about various providers is available. Service providers can register as well, but their details undergo a rigorous verification process before being added to the database to ensure authenticity and reliability.

## Objective
The primary objective of Unity Web is to simplify the process of finding reliable home appliance service providers for newcomers, particularly international students at Saint Louis University, and other individuals in unfamiliar areas. By providing a platform with verified and trustworthy service provider information, Unity Web aims to enhance user convenience, ensure safety, and minimize the risk of fraudulent practices.

## Features
- **User Authentication System:** Allows users to securely sign up or log in to access services.
- **Service Listing Interface:** Users can browse and select from different types of home appliance services.
- **Provider Information Page:** Displays detailed profiles of service providers once a service type is selected.
- **Service Provider Registration Form:** Enables new providers to register and join the platform pending verification.
- **Backend Verification System:** A dedicated team reviews and approves service provider applications to ensure authenticity.


## Target Users
- Homeowners and renters requiring maintenance and repair services for home appliances.
- Service providers seeking to expand their customer base through a credible platform.

## Project Structure
The application is divided into several modules:
1. **Login Module:** Manages user authentication.
2. **Signup Module:** Handles new user registration.
3. **Service Listing Module:** Provides a list of available services.
4. **Service Provider Information Module:** Offers detailed provider profiles.
5. **Service Provider Registration Module:** Manages new provider registrations and verification.

## Tech Stack
- **Frontend:** HTML, CSS
- **Backend:** Node.js
- **Database:** MongoDB

### Installing
1. Clone the repository:
   ```bash
   git clone https://github.com/rgangineni02/CSCI-5030-Project.git
2. Install dependencies:
	npm install
	npm install express
	npm install mongoose
	npm install bcrypt
	npm install ejs
	npm install nodemailer
3. Run the index.js
	nodemon src/index.js
Usage
After starting the server, visit http://localhost:3002 in your web browser to access Unity Web. Follow the on-screen instructions to sign up or log in.



