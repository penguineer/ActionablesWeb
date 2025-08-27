# Actionables Web

![Docker Image](https://github.com/penguineer/ActionablesWeb/actions/workflows/docker-image.yml/badge.svg)

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

## Maintainers

* Stefan Haun ([@penguineer](https://github.com/penguineer))

## Contributing

PRs are welcome!

If possible, please stick to the following guidelines:

* Keep PRs reasonably small and their scope limited to a feature or module within the code.
* If a large change is planned, it is best to open a feature request issue first, then link subsequent PRs to this issue, so that the PRs move the code towards the intended feature.


## License

MIT © 2020-2025 Stefan Haun and contributors
