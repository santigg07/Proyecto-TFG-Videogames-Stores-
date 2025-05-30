FROM node:18-alpine

WORKDIR /app

# Cambiar estas líneas de:
# COPY ./frontend/package*.json ./
# a:
COPY package*.json ./

RUN npm install

# Cambiar esta línea de:
# COPY ./frontend/ .
# a:
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]