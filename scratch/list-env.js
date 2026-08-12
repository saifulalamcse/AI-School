import fs from "fs";
const envContent = fs.readFileSync(".env", "utf8");
console.log(envContent.split("\n").map((line) => line.split("=")[0]));
