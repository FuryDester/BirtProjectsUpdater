const fs = require("fs");

// Path to scripts
const g_Path = "C:\\Users\\-\\Downloads\\Telegram Desktop\\test";

function regexIndexOf(string, regex, startpos) {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function getFiles(dir, files_) {
  files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

getFiles(g_Path).forEach(file => {
  if(file.match(/.rptdesign$/)) {
    console.log(`File ${file} is our project!`);
    let fileData = fs.readFileSync(file, "utf8");

    if(fileData.indexOf("<property name=\"createdBy\">Eclipse BIRT Designer Version 4.9.0.v201905231911</property>") != -1 || fileData.indexOf("<list-property name=\"privateDriverProperties\">") != -1) {
      console.log(`File ${file} already was modified!`);
    }
    else {
      fileData = fileData.replace(/<property name="createdBy">.{32,}<\/property>/, "<property name=\"createdBy\">Eclipse BIRT Designer Version 4.9.0.v201905231911</property>");
      console.log(`Changed Eclipse version to 4.9.0.v201905231911`);
      let lastIndex = 0;
      while(regexIndexOf(fileData, "<oda-data-source extensionID=\"org.eclipse.birt.data.oda.mongodb\" name=\".{1,}\" id=\".{0,}\">", lastIndex) != -1) {
        let index = regexIndexOf(fileData, "<oda-data-source extensionID=\"org.eclipse.birt.data.oda.mongodb\" name=\".{1,}\" id=\".{0,}\">", lastIndex);
        if(lastIndex == index + 1) {
          console.log('Error during editing source externsion! Breaking...');
          break;
        }

        console.log(`Found source externsion at ${index}`);
        lastIndex = index + 1;
        let matchInfo = fileData.substr(index).match(/<oda-data-source extensionID="org.eclipse.birt.data.oda.mongodb" name=".{1,}" id=".{0,}">/);

        //Adding data source list-property, which came in v4.9
        fileData = fileData.replace(matchInfo[0], `${matchInfo[0]}
              <list-property name="privateDriverProperties">
                  <ex-property>
                      <name>gssJAASConfig</name>
                  </ex-property>
                  <ex-property>
                      <name>krb5config</name>
                  </ex-property>
                  <ex-property>
                      <name>gssapiServiceName</name>
                  </ex-property>
                  <ex-property>
                      <name>kerberosPrincipal</name>
                  </ex-property>
                  <ex-property>
                      <name>useKerberosAuthentication</name>
                      <value>false</value>
                  </ex-property>
              </list-property>\n`);
      }

      fs.writeFileSync(file.replace(file.substr(0, file.lastIndexOf(".") + 1), file.substr(0, file.lastIndexOf(".")) + "_modified."), fileData);
    }
  }
})
