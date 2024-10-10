FROM node:22-alpine

# Install curl to make health checks
RUN apk --no-cache add curl

WORKDIR /app
EXPOSE 3000

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/main"]
