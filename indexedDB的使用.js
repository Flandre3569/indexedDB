// 打开数据(和数据库建立连接)
const dbRequest = indexedDB.open("demo");
// 打开数据库失败
dbRequest.onerror = function (err) {
  console.log(打开数据库失败);
}

// 拿到数据库
let db = null;
// 打开数据库成功
dbRequest.onsuccess = function (event) {
  db = event.target.result;
}

// 第一次打开/或者版本发生更新
dbRequest.onupgradeneeded = function (event) {
  // 第一次打开时拿到数据库，进行初始化操作
  const db = event.target.result;

  // 创建存储对象
  // keyPath相当于主键
  db.createObjectStore("students", { keyPath: "id" });
}

class Student {
  constructor(id, name, age) {
    this.id = id;
    this.name = name;
    this.age = age;
  }
}

const students = [
  new Student(1, "gala", 18),
  new Student(2, "xiaohu", 20),
  new Student(3, "bin", 24)
]

// 获取btns，监听点击
const btns = document.querySelectorAll('button');
for (let i = 0; i < btns.length; i++) {
  btns[i].onclick = function () {
    // 使用事务表明对哪张表（存储对象）进行操作
    const transaction = db.transaction("students", "readwrite");
    // 真正拿到store对象
    const store = transaction.objectStore("students");

    switch (i) {
      // 增加
      case 0:
        for (const student of students) {
          const InsertRequest = store.add(student);
          InsertRequest.onsuccess = function () {
            console.log(`${student.name}学生信息插入成功`);
          }
        }
        transaction.oncomplete = function () {
          console.log("添加操作完成");
        }
        break;
      
      // 删除
      case 1:
        // 先进行查询
        const deleteRequest = store.openCursor();
        deleteRequest.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key === 1) {
              // 删除的逻辑
              cursor.delete();
            } else {
              cursor.continue();
            }
          } else {
            console.log("删除完成");
          }
        }
        break; 
      
      // 修改
      case 2:
        // 先进行查询
        const updateRequest = store.openCursor();
        updateRequest.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key === 1) {
              // 修改的逻辑
              const value = cursor.value;
              value.name = "xiaoming";
              cursor.update(value);
            } else {
              cursor.continue();
            }
          } else {
            console.log("更新完成");
          }
        }
        break;
      
      // 查询
      case 3:
        // 查询方式 1,通过主键查询.
        // const request = store.get(1);
        // request.onsuccess = function (event) {
        //   console.log(event.target.result);
        // }

        // 查询方式 2,查询多条 通过游标查询
        const queryRequest = store.openCursor();
        queryRequest.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            // 也可以在此处写停止查询条件，查找所要查找的数据
            // if (cursor.key === 1) {
            //   console.log(cursor.key, cursor.value);
            // } else {
            //   cursor.continue;
            // }
            console.log(cursor.key, cursor.value);
            cursor.continue();
          } else {
            console.log("查询完成");
          }
        }
        break;
    }
  }
}