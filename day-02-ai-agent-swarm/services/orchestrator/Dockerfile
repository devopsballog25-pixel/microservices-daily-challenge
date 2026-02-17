FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create directories for SQLite database and report files
RUN mkdir -p /app/data /app/data/reports

EXPOSE 3001

CMD ["npm", "start"]
