#! /usr/bin/env bash

ROOT=/usr/local/apache2/htdocs/
CONFIG_TMPL=$ROOT/config.json.template
CONFIG=$ROOT/config.json

echo "Actionables URL is set to $ACTIONABLES_URL"

export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
cat $CONFIG_TMPL | envsubst $EXISTING_VARS | tee $CONFIG

# Check the config

cat $CONFIG | jq -reM '""' 1>/dev/null  #|| ( exit_code="$?"; echo 'ERROR: Invalid JSON file. See errors above' 1>&2; exit "$exit_code" )
exit_code="$?"

if [ $exit_code -ne 0 ] ; then
    echo "Configuration is invalid, please check the environment!"
    exit $exit_code
fi

# Original entrypoint
exec httpd-foreground "$@"
