FROM node:18-alpine

WORKDIR /app

# Copy both package.json and package-lock.json
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of your application code
COPY . .

RUN npm run build

EXPOSE 4173

CMD [ "npm", "run", "preview" ]
