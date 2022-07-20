FROM httpd:2.4

RUN apt-get update && apt-get install -y \
    gettext-base \
    jq \
    && rm -rf /var/lib/apt/lists/*

COPY ./entrypoint.sh /usr/bin/
    
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./www/ /usr/local/apache2/htdocs/

ENTRYPOINT exec entrypoint.sh
