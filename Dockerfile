# Chosing a lightweight image with Node LTS as starting point
FROM node:18.15.0-bullseye-slim AS base
#amd64 sha256 to append for production: @575f8d9e973760ffa0f13791959f4cda1c7d4ff00a07cc1766931ddbfe21e010

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# This is done separate to our code to optimize caching
COPY package*.json ./

# Install dependencies for dev stage
FROM base as dev

# npm cache mount to speed up installation of existing dependencies
# For dev we use npm ci for installing the dependencies
# Since npm ci installs dependencies based on the package-lock.json file, 
# it can help ensure that the same versions of dependencies are installed in both stages.
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci

# Use non-elevated user
USER node

# Bundle app source and copy after the dependencies are installed
COPY --chown=node:node . .

# Run the app
CMD ["npm", "start"]

FROM base as production

# Set Node env for production use
ENV NODE_ENV production

# npm cache mount to speed up installation of existing dependencies
# Since we are building our code for production, we use this instead of npm install
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --only=production --omit=dev

# Use non-elevated user
USER node

# Copy app source from dev stage
COPY --chown=node:node --from=dev /usr/src/app .

# Documenting the port where the app will be listening on
EXPOSE 3000

# Adding healthcheck to the container
HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \
  CMD node healthcheck.js

# Add metadata about the image
LABEL version="1.0.0"
LABEL description="Sample of a Relay app that can be queried by a Signalwire inbound call & interacts via the Relay API"
LABEL maintainer="Sebastian Schumann <git@s-schumann.com>"

# Run the app
CMD [ "node", "index.js" ]
