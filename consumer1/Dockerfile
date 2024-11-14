# Stage 2: Run the application
FROM node:20.17.0

# Install build-essential for native module compilation
RUN apt-get update && apt-get install -y build-essential

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install global NestJS CLI
RUN npm install -g @nestjs/cli

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Optionally rebuild native modules if needed
RUN npm rebuild

# Expose the port the app runs on
EXPOSE 9000

# Command to run the application
CMD ["npm", "run", "start:dev"]
