var stylesheet = require("./stylesheet"),
  Files = require("./file"),
  GetComponent = require("./getcomponent"),
  Group = require("./group"),
  Common = require("./common"),
  atob = require("atob");

var bplistParser = require("bplist-parser");
var NSArchiveParser = require("./NSArchiver");


var Buffer = require("buffer/").Buffer;

module.exports = {
  create: function (output, artboard) {
    var artboardName = artboard.name;
    var style = stylesheet.create(
      output,
      artboardName,
      artboard.frame,
      artboard.layers
    );

    var ReactNativeImports = [];
    var imports = [];

    var childrens = artboard.layers
      .map(layer => {
        switch (layer._class) {
          case "shapeGroup":
            return this.addView(layer.name);
            break;
          case "text":
            if (ReactNativeImports.indexOf("Text") == -1) {
              ReactNativeImports.push("Text");
            }
            const buf2 = Buffer.from(
              layer.attributedString.archivedAttributedString._archive,
              "base64"
            );
            const obj = bplistParser.parseBuffer(buf2);
            var res = NSArchiveParser.parse(obj);
            if (res.NSAttributes.NSColor) {
              const colorArray = res.NSAttributes.NSColor.NSRGB.toString().split(
                " "
              );
            }
            var align = 0;
            if (res.NSAttributes.NSParagraphStyle) {
              const paragraphSpacing =
                res.NSAttributes.NSParagraphStyle.NSParagraphSpacing;
              const maxLineHeight =
                res.NSAttributes.NSParagraphStyle.NSMaxLineHeight;
              const minLineHeight =
                res.NSAttributes.NSParagraphStyle.NSMinLineHeight;
              if (res.NSAttributes.NSParagraphStyle.NSAlignment) {
                align = res.NSAttributes.NSParagraphStyle.NSAlignment;
              }
            }

            console.log("res", JSON.stringify(res));
            // console.log("res", JSON.stringify(paragraphSpacing));
            // console.log("res", JSON.stringify(maxLineHeight));
            // console.log("res", JSON.stringify(minLineHeight));
            // console.log("res", JSON.stringify(align));
            // string value
            // console.log(res.string());
            // const parser = NSArchiveParser;
            // const buf = Buffer.from(
            //   layer.style.textStyle.encodedAttributes.NSColor._archive,
            //   "base64"
            // );

            // bplist.parseFile(buf.toString(), function(err, obj) {
            //   if (err) throw err;
            //   // const parser = new NSArchiveParser();
            //   data.decodedTextAttributes = parser.parse(obj);
            // });
            return this.addText(layer.name, res.NSString);
            break;
          case "bitmap":
            if (ReactNativeImports.indexOf("Image") == -1) {
              ReactNativeImports.push("Image");
            }
            var appendPathDir = "../" + this.pathToDir(output);
            return this.addImage(layer.image._ref, layer.name, appendPathDir);
            break;
          case "group":
            var layerName = Common.removeSpaces(layer.name);
            var groupPath = "./" + layerName;
            imports.push({
              name: layerName,
              path: groupPath
            });
            var newOutputPath =
              output + Common.removeSpaces(artboardName) + "/";
            Files.createFolder(
              output + Common.removeSpaces(artboardName) + "/" + layerName
            );
            return this.addGroup(newOutputPath, layer);
            break;
          case "symbolInstance":
            var appendPathDir = this.pathToDir(output);
            // console.log("pathToSymbolDir", pathToSymbolDir);
            var layerName = Common.removeSpaces(layer.name);
            var symbolPath = appendPathDir + "symbols/" + layerName;
            var symbolInst = {
              name: layerName,
              path: symbolPath
            };
            var indexOfImport = this.symbolInstIndex(imports, layer.name);
            if (indexOfImport < 0) {
              imports.push({
                name: layerName,
                path: symbolPath
              });
            }
            return this.addSymbol(layer.name);
            break;
          default:
            break;
        }
      })
      .join("");

    var filePath =
      output + Common.removeSpaces(artboardName) + "/" + "index.js";

    var content = GetComponent.get(
      artboardName,
      childrens,
      ReactNativeImports,
      imports
    );

    Files.writeContentIntoFile(filePath, content);
  },

  addView: function (layerName) {
    return `<View style={styles.${Common.removeSpaces(layerName)}}></View>`;
  },

  addText: function (layerName, text) {
    return `<Text style={styles.${Common.removeSpaces(layerName)}}>${
      text
      }</Text>`;
  },

  addImage: function (imgPath, imgName, appendPathDir) {
    return `<Image source={require('${appendPathDir +
      imgPath}.png')} style={styles.${Common.removeSpaces(imgName)}}></Image>`;
  },

  addGroup: function (output, layer) {
    this.create(output, layer);
    return `<${Common.removeSpaces(
      layer.name
    )} style={styles.${Common.removeSpaces(layer.name)}} />`;
  },

  addSymbol: function (symbolName) {
    return `<${Common.removeSpaces(
      symbolName
    )} style={styles.${Common.removeSpaces(symbolName)}} />`;
  },

  symbolInstIndex: function (imports, layerName) {
    for (var i = 0; i < imports.length; i++) {
      if (imports[i].name === Common.removeSpaces(layerName)) {
        return i;
      }
    }

    return -1;
  },

  pathToDir: function (output) {
    var outputArray = output.split("/");
    var srcIndex = outputArray.indexOf("src");
    var pathToSymbolDir = outputArray.length - 2 - srcIndex;
    var appendPathDir = "../";
    for (var i = 0; i < pathToSymbolDir; i++) {
      appendPathDir += "../";
    }
    return appendPathDir;
  }
};
