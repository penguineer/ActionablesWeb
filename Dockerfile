# build environment
FROM --platform=linux/amd64 node:24.4.1-alpine3.21 AS build_arm64

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

RUN npm --no-audit --no-fund ci

COPY . ./

RUN npm run build

# This is here to satiyfy
# https://docs.docker.com/reference/build-checks/from-platform-flag-const-disallowed/
FROM build_arm64 as build

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

ENTRYPOINT [ "/usr/bin/entrypoint.sh" ]
