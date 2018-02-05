var unzip = require("unzip"),
  fs = require("fs-extra"),
  execSync = require("child_process").execSync;

module.exports = {
  copyFile: function(source, target, cb) {
    var cbCalled = false;
    var pathArray = source.split("/");
    var fileName = pathArray[pathArray.length - 1];
    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      done(err);
    });
    var wr = fs.createWriteStream(target + fileName);
    wr.on("error", function(err) {
      done(err);
    });
    wr.on("close", function(ex) {
      done();
    });
    wr.on("finish", function(r) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      } else {
        cb(true, fileName);
      }
    }
  },

  renameFile: function(output, fileName) {
    fs.rename(
      output + "/" + fileName,
      output + "/" + fileName + ".zip",
      function(err) {
        if (err) console.log("ERROR: " + err);
      }
    );
  },

  unZipFolder: function(output, fileName) {
    var newfileName = fileName.split(".")[0];
    this.createFolder(output, newfileName);
    fs
      .createReadStream(output + "/" + fileName + ".zip")
      .pipe(unzip.Extract({ path: output + newfileName }));
  },

  createFolder: function(folderName) {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  },

  writeContentIntoFile: function(filePath, content) {
    fs.writeFileSync(filePath, content);
  },

  deleteFolder: function(removeDirCmd, dirPath) {
    if (fs.existsSync(dirPath)) {
      console.log(" removing the " + dirPath + " directory.");
      execSync(removeDirCmd + '"' + dirPath + '"', function(err) {
        console.log(err);
      });
    }
  },

  copyDir: function(src, dest, cb) {
    console.log("src", src);
    console.log("dest", dest);
    fs.copy(src, dest, function(err) {
      if (err) return console.error(err);
      console.log("success!");
      cb();
    });
  }
};
