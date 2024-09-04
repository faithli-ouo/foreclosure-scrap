FROM oven/bun:latest

# Install Firefox and Xvfb
RUN apt-get update && apt-get install -y \
    wget \
    firefox-esr \
    xvfb \
    libxtst6 \
    libxss1 \
    libgconf-2-4 \
    libnss3 \
    libasound2

# Install geckodriver
RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux64.tar.gz \
    && tar -xvzf geckodriver-v0.32.0-linux64.tar.gz \
    && chmod +x geckodriver \
    && mv geckodriver /usr/local/bin/ \
    && rm geckodriver-v0.32.0-linux64.tar.gz

# Set up your app
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .

# Use Xvfb to create a virtual display
CMD ["bun", "start"]