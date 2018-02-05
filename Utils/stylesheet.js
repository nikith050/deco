var file = require("./file");

module.exports = {
  writeStylesIntoStyleSheet: function(output, fileName, styleObject) {
    var content = `
      import {
        StyleSheet
      } from 'react-native';

      const styles = StyleSheet.create({
        ${styleObject}
      })

      export default styles;
    `;

    file.writeContentIntoFile(
      output + "/" + fileName.split(" ").join("") + "/styles.js",
      content
    );
  },

  create: function(output, styleName, style, childrens) {
    var styleObject = `
      ${styleName.split(" ").join("")}: {
        ${style.width ? `width : ${style.width}` : null},
        ${style.height ? `height : ${style.height}` : null}
      },
      ${
        childrens && childrens.length > 0
          ? childrens.map(child => {
              return this.childrensStyle(
                child.name,
                child.frame,
                child.style,
                child.layers
              );
            })
          : " "
      }
    `;

    this.writeStylesIntoStyleSheet(output, styleName, styleObject);
  },

  childrensStyle: function(styleName, frame, style, childrens) {
    return `
      ${styleName.split(" ").join("")}: {
        ${frame.width ? `width : ${frame.width}` : ""},
        ${frame.height ? `height : ${frame.height}` : ""},
        ${frame.x && frame.y ? this.addPositionStyle(frame.x, frame.y) : ""}
        ${
          style.borders && style.borders.length > 0
            ? this.addBorder(style.borders[0])
            : " "
        }
        ${
          style.fills && style.fills.length > 0
            ? this.addBackgroundColor(style.fills[0])
            : " "
        }
      }`;
  },

  addPositionStyle: function(x, y) {
    return `
      left: ${x},
      top: ${y},
      position: "absolute",
    `;
  },

  addBorder: function(border) {
    return `
      ${border.color && "borderColor: " + this.getColor(border.color) + ","}
    `;
  },

  getColor: function(color) {
    return `
      'rgb(${Math.round(color.red * 255)}, ${Math.round(
      color.green * 255
    )}, ${Math.round(color.blue * 255)})'
    `;
  },

  addBackgroundColor: function(background) {
    return `
      ${background.color &&
        "backgroundColor: " + this.getColor(background.color) + ","}
    `;
  }
};
