/////////////// Object.assign
// const target = { a: 1, b: 2 };
// const source = { b: 4, c: 5 };

// const returnedTarget = Object.assign(target, source);

// console.log(target);
// //// Expected output: Object { a: 1, b: 4, c: 5 }

// console.log(returnedTarget === target);
// // Expected output: true

//////////// Object
// var person = {
//     name: {
//         first: "Bob",
//         last: "Smith",
//     },
// };
// console.log(person.name.first);
// console.log(person["name"]["last"]);

//////////// const, let, var
// // const
// {
//     const A = 10;

//     // 會發生錯誤，常數值不能再被改變
//     // TypeError: Assignment to constant variable
//     // A = 10;

//     // 陣列是一個有趣的例子
//     const ARR = [1, 2];

//     // 可以改變陣列裡的內容
//     // 因為 ARR 變數值沒有改變，還是指向同一個陣列
//     ARR.push(3);

//     // [1, 2, 3]
//     console.log(ARR);

//     // 錯誤，不能改常數值
//     // TypeError: Assignment to constant variable
//     // ARR = 123;

//     // 但可以改變陣列裡面的內容
//     ARR[0] = 4;

//     // [4, 2, 3]
//     console.log(ARR);
// }

// // hoisting
// bla = 2;

// var bla;

// function foo() {
//     // 會造成程式錯誤 ReferenceError
//     console.log(bar);

//     let bar = 101;
// }
// foo();

// // // Function
// var multiply = function(a, b) {
//     return a * b;
// };

// var multiply = (a, b) => {
//     return a * b;
// };

// ans = multiply(2, 10);
// console.log(ans);

// let numbers = [1, 2, 3];

// // callback 用 Arrow Functions 的寫法更精簡
// let doubles = numbers.map(num => {
//     return num * 2;
// });

// [2, 4, 6]
// console.log(doubles);

// class
// class TEST {
//     constructor(a, b) {
//         this.a = a;
//         this.b = b;
//     }

//     add() {
//         return this.a + this.b;
//     }
// }

// const a = TEST(2, 3).add();
// console.log(a);

// JSOn.stringify
// const object = { name: "Andy", age: 12 };
// console.log(object, typeof object);
// console.log(JSON.stringify(object), typeof JSON.stringify(object));

// Startwith
// console.log("ee".startsWith("4") ? "404" : "500");

// Error
// const myObject = {};
// Error.captureStackTrace(myObject);
// console.log(myObject.stack, typeof myObject.stack);

// class Test extends Error {
//     constructor(message, tmp) {
//         super();
//         this.tmp = tmp;
//     }
// }

// const testObject = new Test("tmp");
// console.log(testObject.stack);

// catchAsync
// const Tour = require("./models/tourModel");

// const catchAsync = fn => {
//     return (req, res, next) => {
//         fn(req, res, next).catch(error => next(error));
//     };
// };

// exports.createTour = catchAsync(async (req, res) => {
//     const newTour = await Tour.create(req.body);
//     res.stauts.json({
//         status: "success",
//         newTour
//     });
// });

// exports.createTour = async (req, res, next) => {
//         const newTour = await Tour.create(req.body);
//         res.status(200).json({
//             stauts: "success",
//             newTour
//         };
// };

// APIFeature class
// class APIFeatures {
//     constructor(query, queryString) {
//         this.query = query;
//         this.queryString = queryString;
//     }
//     filter() {}
// }

// Object.values
// const object = { a: 1, b: 2, c: 3 };
// console.log(Object.values(object));
// console.log(Object.entries(object));

// parseInt
// console.log(parseInt("5", 5));

// async await
// console.log("開始");

// setTimeout(() => {
//     console.log("非同步事件");
// }, 0);

// console.log("程式碼結束");

//
// function promise() {
//     return new Promise((resolve, reject) => {
//         // 隨機取得 0 or 1
//         const num = Math.random() > 0.5 ? 1 : 0;

//         // 1 則執行 resolve，否則執行 reject
//         if (num) {
//             resolve("成功");
//         }
//     });
// }

// console.log(promise());

// Object
// let rectangle = { width: 16, height: 9 };
// // console.log(Object.keys(rectangle));
// // console.log(Object.values(rectangle));
// // console.log(Object.entries(rectangle));
// Object.entries(rectangle).forEach(([w, h]) => {
//     console.log(w, h);
// });

// Array method
// array.filter
// const nums = [89, 32, 104, 46, 249, 71, 515];

// const numsBiggerThan100 = nums.filter(num => num > 100);

// console.log(numsBiggerThan100);

// array.reduce
// const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// const total = nums.reduce((prevValue, num) => prevValue + num, 0);

// console.log(total);

// array.find
// const todos = [
//     { id: 1, title: "倒垃圾" },
//     { id: 2, title: "洗衣服" },
//     { id: 3, title: "運動" }
// ];

// const targetTodo = todos.find(todo => todo.id === 2);
// console.log(targetTodo);
// // { id: 2, title: '洗衣服' }

// const targetTodoIndex = todos.findIndex(todo => todo.id === 2);
// console.log(targetTodoIndex);
// 1
// const todos = [
//     { id: 1, title: "倒垃圾" },
//     { id: 2, title: "洗衣服" },
//     { id: 3, title: "運動" }
// ];

// const result = todos.some(todo => todo.id === 2);

// console.log(result);
// // true

// object
// const todos = [
//     { id: 1, title: "倒垃圾" },
//     { id: 2, title: "洗衣服" },
//     { id: 3, title: "運動" }
// ];
// const newObj = Object.assign({}, todos);
// console.log(newObj);

// callback
// function dosthAsync(callback) {
//     setTimeout(function() {
//         console.log("A");
//         callback();
//     }, 2000);
// }

// function callbackFunction() {
//     console.log("B");
// }

// console.log("START");
// dosthAsync(callbackFunction);
// console.log("END");
//

// Promise
// const axiosRequest = require("axios");

// // Promise
// axiosRequest
//     .get("https://www.boredapi.com/api/activity")
//     .then(response => {
//         console.log(response.data.activity);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// console.log("START");

// async function test() {
//     const response = await axiosRequest.get(
//         "https://www.boredapi.com/api/activity"
//     );
//     console.log(response.data.activity);
// }

// test();

// randomNumber
// const randomNumber = Math.random();
// console.log(randomNumber);

// array
// const array = [1, 2, "me"];
// console.log(array);

// function stringCapital(str) {
//     const strArray = str.split("");
//     const newArray = strArray.map((el, idx) => {
//         if (idx % 2 === 0) {
//             return el.toUpperCase();
//         } else {
//             return el;
//         }
//     });
//     return newArray.join("");
// }
// console.log(stringCapital("hello"));

// Array
let test = [1, 2, 3, 4, 5];
test = test.slice(1);
console.log(test);
