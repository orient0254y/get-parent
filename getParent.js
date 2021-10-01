/**
 * 初始化 GPI.init(objectName);
 * let obj1 = {
 *  obj2: {},
 *  'string1': 'asd',
 *  'number1': 123
 * }
 * obj2.getParent();获取某个子对象obj2（引用类型，包含对象、数组、函数）的父对象obj1，Number、Boolean、String、undefined、null基本类型无此功能
 */

; (function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.GPI = factory());
}((window || global), function () {
  'use strict';
  const _toString = Object.prototype.toString;
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const _define = Object.defineProperty;
  let initFlag = true;
  let ancestors = null; // 祖先
  const GP = {
    /**
     * 通过父对象的名字获取父对象
     * @param {*} parentName 
     * @returns 
     */
    getParent2(objectName) {
      let array = objectName.split("-");
      let parent = ancestors;
      let nameArray = [];
      nameArray.push(array[0])
      if (parent) {
        for (let index = 1; index < array.length; index++) {
          parent = parent[array[index]];
          if (parent) {
            if (index === array.length - 1) {
              return parent;
            }
          } else {
            console.error(`找不到${nameArray.join('.')}的${array[index]}属性`);
          }
          nameArray.push(array[index]);
        }
      } else {
        console.error(`找不到对象${array[0]}，请检查作用域`);
        return undefined;
      }
      return ancestors;
    },
    setProto(objectName, object) {
      if(!object){
        return
      }
      let proType = _toString.call(object);
      if (proType === '[object Object]') {
        if(initFlag){
          object = this.resetPrototype(object, {}, objectName);
        }
        this.objectWatcher(object, objectName, function () { });
      } else if (proType === '[object Array]') {
        if(initFlag){
          // 只修改父数组的方法
          object = this.resetPrototype(object, {}, objectName);
        }
      } else {
        return;
      }
      initFlag = false;
      this.judgeChildType(objectName, object);
    },
    /**
     * 
     * @param {*} objectName 
     * @param {*} object 
     */
    judgeChildType(objectName, object) {
      let keys = Object.keys(object);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let element = object[keys[i]];
        if (typeof element === 'object' && element !== null || typeof element === 'function') {
          this.addGetParentToProto(element, key, object, objectName);
        }
      }
    },
    /**
     * 
     * @param {子元素} element 
     * @param {子元素对应的 key} key 
     * @param {父对象} parentObject 
     * @param {父对象的 名字} parentObjectName 
     */
    addGetParentToProto(element, key, parentObject, parentObjectName) {
      let parentName = ""
      if(parentObject === null){
        parentName = null;
      } else {
        if (parentObject.__parent) {
          parentName = parentObject.__parent + '-' + parentObjectName;
        } else {
          parentName = parentObjectName;
        }
      }

      let protoAttr = {
        '__parent': {
          configurable: false,
          writable: true,
          value: parentName
        },
        "getParent": {
          configurable: false,
          writable: false,
          value: () => {
            if(parentObject === null){
              return null;
            }
            return this.getParent2(parentName)
          }
        }
      };
      element = this.resetPrototype(element, protoAttr, key);

      this.setProto(key, element);
    },
    /**
     * 修改对象的原型链方法
     * @param {*} object 
     * @param {需要传入一个对象，该对象的属性类型参照Object.defineProperties()的第二个参数} protoAttr 
     * @param {*} objectName 
     * @returns 修改原型链上属性后的原对象
     */
    resetPrototype(object, protoAttr, objectName) {
      let proType = _toString.call(object);
      if (proType === "[object String]") {
        protoAttr = Object.create(String.prototype, protoAttr);
      } else if (proType === "[object Number]") {
        protoAttr = Object.create(Number.prototype, protoAttr);
      } else if (proType === "[object Object]") {
        // 给object增加add方法；
        protoAttr.add = {
          configurable: false,
          writable: false,
          value: (...args) => {
            let key = args[0], val = args[1];
            object[key] = val;
            if(typeof val === 'object' && val !== null || typeof val === 'function'){
              this.addGetParentToProto(val, key, object, objectName);
            }
            return true;
          }
        }
        protoAttr = Object.create(Object.prototype, protoAttr);
      } else if (proType === "[object Boolean]") {
        protoAttr = Object.create(Boolean.prototype, protoAttr);
      } else if (proType === "[object Array]") {
        const arrayProtoAttr = this.arrayPatch(object,objectName);
        protoAttr = Object.assign({},protoAttr, arrayProtoAttr);
        protoAttr = Object.create(Array.prototype, protoAttr);
      } else if (proType === "[object Function]") {
        protoAttr = Object.create(Function.prototype, protoAttr);
      }

      Object.setPrototypeOf(object, protoAttr);
      return object;
    },
    /**
     * 监听对象的属性修改
     * @param {要监听的对象} object 
     * @param {对象的名称} objectName 
     * @param {*} callback 
     */
    objectWatcher(object, objectName, callback) {
      let keysArray = Object.keys(object);
      let that = this;
      for (const key in object) {
        if (_hasOwnProperty.call(object, key)) {
          let val = object[key];
          if (keysArray.includes(key)) {
            _define(object, key, {
              enumerable: true,
              configurable: true,
              get: function getter() {
                return val;
              },
              set: function setter(newVal) {
                if (newVal === val) {
                  return
                }
                if ((typeof newVal === 'object' && newVal !== null || typeof newVal === 'function')) {
                  that.addGetParentToProto(newVal, key, object, objectName)
                }

                val = newVal;
                return val;
              }
            })
          } else {
            callback(val, object, key, objectName);
          }
        }
      }
    },
    /**
     * 修改Array的push、shift、splice方法，添加监听方法
     * @param {要监听的array} array 
     * @param {array的名字} arrayName 
     * @returns 修改后的方法的对象；
     */
    arrayPatch(array,arrayName) {
      let that = this;
      const methodsToPatch = [
        'push',
        'unshift',
        'splice'
      ];
      let protoAttr = {};
      // 将上面的方法重写
      methodsToPatch.forEach(function (method) {
        protoAttr[method] = {
          enumerable: true,
          configurable: true,
          value: function (...args) {
            // 获取原生的方法
            let original = Array.prototype[method];
            // 执行原生方法
            const result = original.apply(this, args);
            // 做方法类型判断
            if(method === 'splice'){
              // args [index, length, arg1, arg2, ...]
              let startIndex = args[0];
              for (let index = 2; index < args.length; index++) {
                let thisIndex = startIndex + index - 2
                that.addGetParentToProto(array[thisIndex],thisIndex, array, arrayName);
              }
            } else if(method === 'unshift'){
              // 在0位置添加新元素
              that.addGetParentToProto(array[0], 0, array, arrayName);
            } else if(method === 'push'){
              // 在末尾添加元素
              let thisIndex = array.length - 1;
              that.addGetParentToProto(array[thisIndex],thisIndex, array, arrayName);
            }
            return result;
          }
        }
      })
      return protoAttr
    }
  }

  const GPI = {
    init(objectName, object) {
      initFlag = true;
      ancestors = object;
      GP.setProto(objectName, object);
    },
  }
  return GPI;
}));