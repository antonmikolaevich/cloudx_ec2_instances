function deepEqual(obj1, obj2) {
    
    if (obj1 === obj2) {
      return true;
    }
  
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
   
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }

  function hasMatchingKeys(object, keys) {
    const objectKeys = Object.keys(object);
    return keys.every(key => objectKeys.includes(key));
  }

  function getContentTypeValue(object, key){
    if (object.hasOwnProperty(key) === true){
      return object[key];
    } else {
      return 'no value';
    }
  }

  module.exports = {
    deepEqual,
    hasMatchingKeys,
    getContentTypeValue
  }