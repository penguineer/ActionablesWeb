# build environment
FROM node:24.4.1-alpine3.21 AS build

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

RUN npm --no-audit --no-fund ci

COPY . ./

RUN npm run build

# production environment
FROM httpd:2.4

RUN apt-get update && apt-get install -y \
    gettext-base \
    jq \
    && rm -rf /var/lib/apt/lists/*

COPY ./entrypoint.sh /usr/bin/
    
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY www/config.json.template /usr/local/apache2/htdocs/
COPY --from=build /app/dist /usr/local/apache2/htdocs/

ENTRYPOINT [ "entrypoint.sh" ]
