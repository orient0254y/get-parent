# get-parent

#### 介绍
获取某个非null对象、数组或函数的父对象;
To obtain a not null objects, arrays, or function of the parent object;

#### 安装

1.  npm install get-parent --save

#### 通过npm引入使用

1.  import GPI from "get-parent"; // GPI自己可以定义其它名字
2.  GPI.init(objectName, object); // 需要用哪个对象在给他初始化
3.  childObject.getParent(); // 获取父对象
4.  object.add(key, value); //对象添加新元素
5.  Array的push/unshift/splice已经改造，增加元素一样可以监听

  例子：
  ```
    <script>
    import GPI from "get-parent";

    export default {
      name: 'Test',
      mounted(){
        console.log(GPI);
        // ==========Object============
        var obj = {
          a: {
            hi: '123',
            hello: '234'
          },
          b: new String('bcd'),
          array: [1,2,3, {
            aa: 234
          },['a', {b: 'asd'}]]
        }

        console.log("obj --- ", obj);
        GPI.init('obj', obj);

        let t1 = obj.b;
        let t2 = obj.array[3];
        let t3 = obj.array[4][1];
        console.log("t1 --- ", t1);
        console.log("t2 --- ", t2);
        console.log("t3 --- ", t3);
        console.log("t1.getParent() --- ", t1.getParent());
        console.log("t2.getParent() --- ", t2.getParent());
        console.log("t3.getParent() --- ", t3.getParent());
        obj.add('test', {
          'what': 'wow'
        })
        let ww = obj.test;
        console.log(ww.getParent());

        // ==========Array============

        let array = [1,23,4, {
          asd: {
            fff: 2323
          }
        }]

        GPI.init('array', array);

        console.log(array[3]);
        console.log(array[3].getParent());
      }
    }
    </script>
  ```

#### 通过script标签引入使用
1.  路径根据自己的文件位置定义<script src="./getParent.js"></script>
2.  let GPI = window.GPI;
3.  GPI.init(objectName, object);// 需要用哪个对象在给他初始化
4.  childObject.getParent(); // 获取父对象
5.  object.add(key, value); //对象添加新元素
6.  Array的push/unshift/splice已经改造，增加元素一样可以监听

  例子：
  ```
    // ==========Object============
    let obj = {
      a: 1,
      b: {
        val : 2,
        c: {
          val: 3
        }
      },
      test(a){
        console.log(a);
      },
      d: [1,2,3,4,{
        e: 123
      }],
      e: null,
      f: new String('adf'),
      g: new Number(123)
    }

    let c = obj.b.c;
    let test = obj.test;
    let d = obj.d;
    let GPI = window.GPI;

    GPI.init("obj", obj);
    console.log(obj, "obj");

    console.log("getParent", d.getParent());

    console.log(obj.b.c);
    console.log(obj.b.c.getParent());

    // ==========Array============

    let array = [1,23,4, {
      asd: {
        fff: 2323
      }
    }]

    GPI.init('array', array);

    console.log(array[3]);
    console.log(array[3].getParent());
  ```