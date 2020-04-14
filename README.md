# MySQL exporter

MySQL exporter is a simple tool for generating data dictionaries from database.

## Configuring

The exporter uses simple config.json, **in the current workind directory**. Just create config.json and use the following format:

```json
{
    "mysql": {
        "host": "localhost",
        "user": "root",
        "password": "",
        "database": "mysql"
    },
    "fields_ignored": []
}
```

Fields ignored is an array of fields which shouldn't be in the report. It's case insensitive.

## Running

If you have [node](http://nodejs.org) and [git](https://git-scm.com/) installed on your system, simply create the config and run `npx github:danbulant/mysqlExporter`.

## Saving and sharing reports

On the newly opened page (opened by running), press `ctrl+s` and save the HTML file. That file is fully self-contained, even for offline use, so you can share the report with others.
