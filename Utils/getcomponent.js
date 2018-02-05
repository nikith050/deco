module.exports = {
  get: function(componentName, childrens, ReactNativeImports, imports) {
    return `
      import React, { Component } from 'react'
      import {
        View,
        ${ReactNativeImports.map(imp => {
          return imp;
        })}
      } from 'react-native'

      ${
        imports && imports.length > 0
          ? imports
              .map(imp => {
                return `import ${imp.name} from '${imp.path}'`;
              })
              .join(";")
          : ""
      }

      import styles from './styles.js'

      export default class ${componentName
        .split(" ")
        .join("")} extends Component {
        render() {
          return (
            <View style={styles.${componentName.split(" ").join("")}} >
              ${childrens}
            </View>
          )
        }
      }
    `;
  }
};
