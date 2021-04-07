let cdnUrl = "https://server.cocreate.app/";



let glob = require("glob");
let fs = require('fs');
const prettier = require("prettier");
const path = require("path")

function globUpdater(er, files) {
    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => update(filename))
}




function update(YmlPath) {
    // component name
    let name = path.basename(path.resolve(path.dirname(YmlPath), '../..'));
 

    let fileContent = `name: CI

on:
  push:
    branches:
    - master
  pull_request:
    branches:
    - master
  create:
    branches:
    - master

jobs:
  about:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
          
      - name: Jaid/action-sync-node-meta
        uses: jaid/action-sync-node-meta@v1.4.0
        with:
          direction: overwrite-github # default is overwrite-file
          githubToken: \${{ secrets.GITHUB }}
  
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v2
        with:
          # You can specify specifying version range for the extra plugins if you prefer.
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/npm
            @semantic-release/git
            @semantic-release/github
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}  # Auto Changog generator
           
  docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: update documentation
        uses: CoCreate-app/CoCreate-docs@master
          
  
  cdn:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
          
      - name: upload cdn
        uses: CoCreate-app/CoCreate-s3@master
        with:
          aws-key-id: \${{ secrets.AWSACCESSKEYID }}
          aws-access-key: \${{ secrets.AWSSECERTACCESSKEY }}
          source: './dist/${name}.min.js'
  

`;
    let formated = prettier.format(fileContent, { semi: false, parser: "yaml" });
    // console.log(fileContent);
    // process.exit()
    if (fs.existsSync(YmlPath))
        fs.unlinkSync(YmlPath)
    fs.writeFileSync(YmlPath, formated)
    

}



glob("../CoCreate-components/*/.github/workflows/automation.yml", globUpdater)
glob("../CoCreate-modules/*/.github/workflows/automation.yml", globUpdater)
glob("../CoCreate-plugins/*/.github/workflows/automation.yml", globUpdater)
// glob("../CoCreateCSS/.github/workflows/automation.yml", globUpdater)

console.log('finished')