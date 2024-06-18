# Unity Web

## Overview

Unity Web is a web application designed to connect customers with home appliance service providers such as plumbers, electricians, and other specialists. It enables users to securely sign up or log in to access a vetted list of services, view detailed provider information, and allows service providers to register but undergoes a rigorous verification process before being added to ensure authenticity.

## Objective

The primary objective of Unity Web is to facilitate the discovery of reliable home appliance service providers for individuals, particularly newcomers in unfamiliar areas. By providing a platform with verified and trustworthy service provider information, Unity Web aims to enhance user convenience, ensure safety, and minimize the risk of fraudulent practices.

## Features

- **User Authentication System**: Secure sign up and log in access to the platform.
- **Service Listing Interface**: Users can browse and select from various home appliance services.
- **Provider Information Page**: Displays detailed profiles of service providers once a service type is selected.
- **Service Provider Registration Form**: Enables new providers to register and join the platform pending verification.
- **Backend Verification System**: Ensures all service provider applications are thoroughly reviewed before approval.

## Target Users

- **Homeowners and renters** who need maintenance and repair services for home appliances.
- **Service providers** who seek to expand their customer base and credibility through an authenticated listing.

## Project Structure

- **Login Module**: Manages user authentication.
- **Signup Module**: Handles new user registration.
- **Service Listing Module**: Provides a list of available services.
- **Service Provider Information Module**: Offers detailed provider profiles.
- **Service Provider Registration Module**: Manages new provider registrations and verification.

## Tech Stack

- **Frontend**: HTML, CSS
- **Backend**: Node.js
- **Database**: MongoDB


## Setting Up Development Environment

To set up your development environment for Unity Web, follow these steps:

### Prerequisites

- Node.js
- MongoDB
- NPM

## Installation

Clone the repository:

git clone https://github.com/rgangineni02/CSCI-5030-Project.git

## Install dependencies:
-npm install
-npm install express 
-npm install mongoose 
-npm install bcrypt 
-npm install ejs
-npm install nodemailer


## Testing
To run tests, use the following command:
npm test


##S tart the server:
nodemon src/index.js

Access the application via the web browser:
http://localhost:3002

![image](https://github.com/rgangineni02/CSCI-5030-Project/assets/152373497/aa95bc07-f3e3-4576-87ae-2c9f6fda8d19)



##Pulling the Docker Image
Download the Docker image from Docker Hub to your local machine:

docker pull ravaligangineni/my-unity-web:v1

This command retrieves version v1 of the my-unity-web Docker image from the Docker Hub account ravaligangineni

##Running the Docker Image
Once the image is pulled, run it on your local machine using

docker run -p 4000:3002 ravaligangineni/my-unity-web:v1

docker run: This command tells Docker to run a container from the specified image.

-p 4000:3002: This flag maps port 4000 on your local machine to port 3002 inside the Docker container, allowing you to access the application by visiting http://localhost:4000 in your web browser.

ravaligangineni/my-unity-web:v1: Specifies the image to use, including the username, repository, and tag.





