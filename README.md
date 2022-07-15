# Actionables Web

> Show actionable items from an [Actionables service](https://github.com/penguineer/RedmineActionablesCollector) in the Browser.

## Usage

### Configuration

Configuration is done using environment variables:

* `PORT`: Target port when used with docker-compose (default `8080`)
* `ACTIONABLES_URL` URL to the actionables collector service, e.g. [Redmine Actionables](https://github.com/penguineer/RedmineActionablesCollector)


### Run with Docker

```bash
docker run --rm -it \
    -p 8080:8080 \
    -e ACTIONABLES_URL="<service url>" \
    mrtux/actionables-web
```

### Run with Docker-Compose (Development)

To run with [docker-compose](https://docs.docker.com/compose/) copy  [`.env.template`](.env.template) to `.env` and edit the necessary variables. Then start with:

```bash
docker-compose up --build
```

Please note that this compose file will rebuild the image based on the repository. This is helpful during development and not intended for production use.

When done, please don't forget to remove the deployment with
```bash
docker-compose down
```
