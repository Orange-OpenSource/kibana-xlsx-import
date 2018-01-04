# XLSX import

> Kibana plugin for import XLSX file to ElasticSearch

---
## How to use

### Choose the file you want to import
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s1.gif)

### Define your own mapping (optional)
```diff
- If you want to define your own mapping, you have to use a new index name.
```
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s2.gif)

### Choose an index name
If the index name already exist then it will be add to this index, else it will be create.
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s3.gif)

### Send to ES and check if its working
![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s4.gif)

![](https://raw.githubusercontent.com/kyushy/kibana-xlsx-import/master/assets/s5.gif)

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
