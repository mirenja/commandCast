FROM node:18


WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 4000
CMD [ "npm", "start" ]
