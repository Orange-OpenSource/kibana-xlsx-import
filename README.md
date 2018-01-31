# XLSX import

> Kibana plugin for import XLSX/CSV file to ElasticSearch

---
## How to use

### Upload a file
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s01.gif)

### Define your own mapping and/or index name (optional)
```diff
- If you want to define your own mapping, you have to use an index name which doesn't already exist.
- Index name must be all lower case.
```
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s02.gif)

### Create a document ID with template  

To create a personnal ID per document you have to use a template with placeholder {fieldname}.  
In our example, if I use the following template `{ID}-{Last_name}-{First_name}` it will set for the first document:  
  - `0-Miller-Katrina`
---
## development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.

  - `npm start`

    Start kibana and have it include this plugin

  - `npm start -- --config kibana.yml`

    You can pass any argument that you would normally send to `bin/kibana` by putting them after `--` when running `npm start`

  - `npm run build`

    Build a distributable archive

  - `npm run test:browser`

    Run the browser tests in a real web browser

  - `npm run test:server`

    Run the server tests using mocha

For more information about any of these commands run `npm run ${task} -- --help`.
