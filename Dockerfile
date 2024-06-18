# Use a newer official Node.js image as the base image, such as Node.js 16 or 18
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies defined in package.json
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3002

# Command to start your app
CMD ["node", "src/index.js"]



#Pulling the Docker Image
#To download the Docker image from Docker Hub to your local machine
#docker pull ravaligangineni/my-unity-web:v1
#This command retrieves the version v1 of the my-unity-web Docker image from the Docker Hub account ravaligangineni.
#Running the Docker Image
#0nce the image is pulled, you can run it on your local machine using
#docker run -p 4000:3002 ravaligangineni/my-unity-web:v1

