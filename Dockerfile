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
