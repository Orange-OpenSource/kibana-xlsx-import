# XLSX import

> Kibana plugin for import XLSX/CSV file to ElasticSearch

---
## Installation
Use this example or manually pick a [release](https://github.com/Orange-OpenSource/kibana-xlsx-import/releases)  
<pre>
/opt/kibana/bin/kibana-plugin install https://github.com/Orange-OpenSource/kibana-xlsx-import/releases/download/6.5.4/kibana-xlsx-import-6.5.4-latest.zip
</pre>

---
## How to use

### 1 - Select your file and sheet
![](https://raw.githubusercontent.com/Orange-OpenSource/kibana-xlsx-import/master/assets/step1.png)

### 2 - Configure  
![](https://raw.githubusercontent.com/Orange-OpenSource/kibana-xlsx-import/master/assets/step2.png)  
```diff
- If you want to define your own mapping, you have to use an index name which doesn't already exist.
- Index name must be all lower case.
```  
#### Use your own mapping  
For every field you can choose the type and apply more options with the advanced JSON.  
The list of parameters can be found here, https://www.elastic.co/guide/en/elasticsearch/reference/6.2/mapping-params.html

#### Use a custom Kibana ID
To create a custom Kibana ID with your field values you can use a template with placeholder {fieldname}.  
In our example, if I use the following template `{ID}-{Nom}` this will lead us to the following ID for the first document :
  - `1-Toto`

### You're done !  


### Advanced settings  

In the kibana advanced setting you can find those parameters  
__Warning :__ All those options might cause crash or slowing the plugin.  

  - `kibana-xlsx-import:bulk_package_size`  
  Allow you to define the number of json item you want to send per bulk package  

  - `kibana-xlsx-import:displayed_rows`  
  Define the number of rows which will be displayed in the preview


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
