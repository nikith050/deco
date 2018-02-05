var optimist = require("optimist"),
  fs = require("fs-extra"),
  os = require("os"),
  Common = require("./Utils/common");

var Files = require("./Utils/file");
var artboard = require("./Utils/artboard");

var ARGS = optimist.argv;
var input = ARGS["i"];
var output = ARGS["o"];

const ns = require("node-sketch");

// ns.read(input).then(sketch => {
//   console.log("sketch.textStyles", sketch.textStyles[0].value);
//   // sketch.colors;
// });

var OUTPUTPATH = output + "src/";

let removeDirCmd;

removeDirCmd = os.platform() === "win32" ? "rmdir /s /q " : "rm -rf ";

Files.deleteFolder(removeDirCmd, OUTPUTPATH);

console.log("input", input);
console.log("output", output);

if (input) {
  Files.copyFile(input, output, function(a, fileName) {
    if (a) {
      Files.renameFile(output, fileName);
      var newfileName = fileName.split(".")[0];
      Files.unZipFolder(output, fileName);

      setTimeout(function() {
        fs.readdir(output + newfileName + "/pages", (err, files) => {
          fs.readFile(
            output + newfileName + "/pages" + "/" + files[0],
            "utf8",
            function(err, data) {
              if (err) throw err;
              var obj = JSON.parse(data);
              const Artboards = obj.layers;
              for (var i = 0; i < Artboards.length; i++) {
                Files.createFolder(OUTPUTPATH);
                Files.createFolder(OUTPUTPATH + "artboards");
                var artNameArray = Artboards[i].name.split("/");
                console.log("Artboards[i]", Artboards[i]);
                console.log(artNameArray.length, "artNameArray");
                // if (Artboards[i].name.split("/").length > 0) {
                Files.createFolder(
                  OUTPUTPATH +
                    "artboards" +
                    "/" +
                    Common.removeSpaces(Artboards[i].name)
                );
                artboard.create(output + "src/artboards/", Artboards[i]);
                // }
              }
            }
          );
          if (files[1] != undefined) {
            fs.readFile(
              output + newfileName + "/pages" + "/" + files[1],
              "utf8",
              function(err, data) {
                if (err) throw err;
                var obj = JSON.parse(data);
                const Symbols = obj.layers;
                for (var i = 0; i < Symbols.length; i++) {
                  Files.createFolder(OUTPUTPATH);
                  Files.createFolder(OUTPUTPATH + "symbols");
                  Files.createFolder(
                    OUTPUTPATH +
                      "symbols" +
                      "/" +
                      Common.removeSpaces(Symbols[i].name)
                  );
                  artboard.create(output + "src/symbols/", Symbols[i]);
                }
              }
            );
          }
          var deleteUnzippedFolder = output + fileName.split(".")[0];
          var imageSource = output + fileName.split(".")[0] + "/images";
          var imageDest = output + "images";
          Files.copyDir(imageSource, imageDest, function() {
            // Files.deleteFolder(removeDirCmd, deleteUnzippedFolder);
          });
        });
        var deleteZipFolder = output + fileName + ".zip";
        // console.log("zip", );
        // Files.deleteFolder(removeDirCmd, deleteZipFolder);
      }, 5000);
    } else {
    }
  });
} else {
  console.log("input is required");
}
