/**
 * Created by benjamindobler on 08.04.17.
 */

module.exports = {
  parse: function(archive) {
    var result = {};

    var objects = archive[0].$objects;
    // console.log("Objects ", objects);
    var root = archive[0].$top.root.UID;

    var getReferenceById = id => {
      var r = {};
      var o = objects[id];
      if (
        typeof o === "string" ||
        typeof o === "number" ||
        typeof o === "boolean"
      ) {
        return o;
      }

      if (typeof o === "object") {
        for (var i in o) {
          if (o[i].UID) {
            r[i] = getReferenceById(o[i].UID);
          } else if (
            Array.isArray(o[i]) &&
            i !== "NS.keys" &&
            i !== "NS.objects"
          ) {
            r[i] = [];
            o[i].forEach(ao => {
              if (ao.UID) {
                r[i].push(getReferenceById(ao.UID));
              } else {
                r[i].push(ao);
              }
            });
          } else if (i !== "NS.keys" && i !== "NS.objects") {
            r[i] = o[i];
          }
        }
      }

      if (o["NS.keys"]) {
        o["NS.keys"].forEach((keyObj, index) => {
          var key = getReferenceById(keyObj.UID);
          var obj = getReferenceById(o["NS.objects"][index].UID);
          r[key] = obj;
        });
      }
      return r;
    };

    var topObj = objects[root];
    for (var key in topObj) {
      if (topObj[key].UID) {
        result[key] = getReferenceById(topObj[key].UID);
      }
    }
    return result;
    /*
     for(var i in topObj) {
     console.log("i ", i);
     console.log('i UID' , topObj[i].UID);
     if(topObj[i].UID['NS.keys']) {
     console.log("Keys ", topObj[i].UID['NS.keys']);
     }
     }
     */
  }
};
