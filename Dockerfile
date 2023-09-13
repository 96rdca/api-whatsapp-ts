FROM node:20-alpine as node

WORKDIR /app

# Installs latest Chromium (92) package.
RUN apk add --no-cache \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Install Google Chrome
RUN curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb \
    && dpkg -i chrome.deb \
    && apt-get install -f -y \
    && rm chrome.deb

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Puppeteer v10.0.0 works with Chromium 92.
COPY . .
RUN npm install puppeteer@10.0.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

RUN npm install
RUN npm run build
ARG PUBLIC_URL
ARG PORT
CMD ["npm", "start"]