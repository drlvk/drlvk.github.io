// Input references

let container = document.querySelector(".container");
let result = document.querySelector(".result");
let homework = document.querySelector("#homework");
let quiz = document.querySelector("#quiz");
let exam1 = document.querySelector("#exam1");
let exam2 = document.querySelector("#exam2");
let exam3 = document.querySelector("#exam3");
let finalexam = document.querySelector("#finalexam");

let btn = document.querySelector(".btn");

let form = document.querySelector(".input");

function allCalculation() {
  let overall =
    parseFloat(homework.value)/100 * 10 +
    parseFloat(quiz.value)/100 * 15 +
    parseFloat(exam1.value)/50 * 16 +
    parseFloat(exam2.value)/50 * 16 +
    parseFloat(exam3.value)/50 * 16 +
    parseFloat(finalexam.value)/100 * 27;

  overall = overall.toFixed(2);
  result.innerHTML = "";
  let output = document.createElement("div");
  output.setAttribute("class", "output");
  let p1 = document.createElement("p");
  p1.textContent = ` Final Grade : ${overall}`;
  output.append(p1);
  result.append(output);
}

btn.addEventListener("click", () => {
  allCalculation();
});
