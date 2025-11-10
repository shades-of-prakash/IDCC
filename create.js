// import bcrypt from "bcryptjs";
// const pw = "ssk";

// const hashed = bcrypt.hashSync(pw, 10);

// console.log("Password:", pw);
// console.log("Hashed:", hashed);

const p1 = new Promise((res, rej) => {
  setTimeout(() => {
    res("p1");
  }, 1000);
});
const p2 = new Promise((res, rej) => {
  setTimeout(() => {
    res("p2");
  }, 500);
});

const p3 = new Promise((res, rej) => {
  setTimeout(() => {
    res("p3");
  }, 300);
});

Promise.race([p1, p2, p3]).then((res) => console.log(res));
