FROM node:23.8-bullseye

# Set the working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN apt-get update && apt-get install -y \
  sqlite3 \
  openssl \
  libnss3 \
  libatk1.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango1.0-0 \
  libpangocairo-1.0-0 \
  libgdk-pixbuf-2.0-0 \
  libxshmfence1 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils \
  libu2f-udev \
  chromium

RUN npm install

# Copy the rest of the application code
COPY . .


# Expose the port
EXPOSE 3000

# Start the application using nodemon for development
CMD ["npx", "nodemon", "index.js"]
