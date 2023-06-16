// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

//Listen for click event on start button to begin game
//Retrieve all possible categories
//Randomly select six categories
//Blue card with white text should appear with a question at the center and category on top
//When card is clicked, it should show the clue
//When clicked again, the next question should appear with category on top
//When user has reached the end, pop up should appear indicating the game is over
//Restart game button will load new categories and questions

 
let categories = [];
let cluesClicked = 0;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
function getCategoryIds(categories) {
    let randomIdxs = Array(100).fill().map(() => Math.floor(100 * Math.random()));
    
    let categorieIds = randomIdxs.map((index) => {
        return categories[index];
    })
    return categorieIds;
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
    const res = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    let cluesArray = [];

     res.data.clues.forEach(element => {
          let obj = {
          "question": element.question,
          "answer": element.answer,
          "showing": null
          }
         cluesArray.push(obj)
     })
     
     return {
         title: res.data.title,
         clues: cluesArray
     }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 *
 */

function makeTable(){
    const table = document.createElement("table");
    const headTr = document.createElement("tr");
    const tBody = document.createElement("tbody");
    tBody.setAttribute('id', 't-body');
    const bodyTr = document.createElement("tr");
    bodyTr.setAttribute('id', 'body-tr')
    const bodyTr2 = document.createElement("tr");
    bodyTr2.setAttribute('id', 'body-tr2')

    $("#jeopardy").append(table);
    table.createTHead();
    table.append(tBody);
    $("thead").append(headTr);
    $("tbody").append(bodyTr);
    $("#body-tr").after(bodyTr2);
}

async function fillTable() {

    //filling headTr with categories
    for(let i = 0; i < categories.length; i++){
        const td = document.createElement("td");
        td.setAttribute("id", `category${i}`);
        td.innerHTML = categories[i].title;
        $("tr:first").append(td);
    }

    //filling bodyTr with first row of questions and answers
    for(let i = 0; i < 6; i++){
        const td = document.createElement("td");
        td.setAttribute("id", `clue${i}`);
        const question = document.createElement("p");
        const randomIdx = Math.floor(Math.random() * categories[i].clues.length)
        question.setAttribute("id", `${i}-${randomIdx}`);
        question.innerHTML = "?"  
        $("#body-tr").append(td);
        td.append(question);
    }
    //filling second row of questions
    for(let i = 0; i < 6; i++){
        let newIdx = i + 7;
        const td = document.createElement("td");
        td.setAttribute("id", `clue${newIdx}`);
        const question = document.createElement("p");
        const randomIdx = Math.floor(Math.random() * categories[i].clues.length);
        question.setAttribute("id", `${i}-${randomIdx}`);
        question.innerHTML = "?"
        $("#body-tr2").append(td);
        td.append(question);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
    //add event listener 
    //go through event propagation
    
    console.log(evt.target.id)
    let arr = evt.target.id.split("-");
    let firstIdx = arr[0];
    let secondIdx = arr[1];
    let clue = categories[firstIdx].clues[secondIdx];

    if(clue.showing === null){
        evt.target.innerHTML = "Clue: " + clue.question;
        clue.showing = "question";
    }
    else if(clue.showing === "question"){
        evt.target.innerHTML = "Answer: " + clue.answer;
        clue.showing = "answer";
        cluesClicked++;
        setTimeout(() => {
            if(cluesClicked == 12){
                alert("GAME OVER");
            }
        }, 1000) 
        }
    else if(clue.showing === "answer"){//move to the top
        evt.preventDefault();//used generally for forms
        }
}


/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
    $("#jeopardy").empty();
    $("#start").hide();
    $("#spin-container").show();
    categories = [];
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
    $("#spin-container").hide();
    $("#start").text("Restart");
    $("#start").show();
    cluesClicked = 0;
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    showLoadingView();
    const initialCategories = await axios.get(`http://jservice.io/api/categories`, {
        params: { count: 100 }
    });
    let catIds = getCategoryIds(initialCategories.data);
    
    let res = catIds.filter(category => category.clues_count > 2).splice(0,6);
    for(let i = 0; i < res.length; i++){
        let clue = await getCategory(res[i].id);
        $(`#category${[i]}`).text(clue.title);
        categories.push(clue);
     }
     console.log(categories);

     makeTable();
     fillTable();
     hideLoadingView();    
}



$(document).ready(function() {
    $("#spin-container").hide();
})
/** On click of start / restart button, set up game. */
$("#start").on("click", setupAndStart);
// TODO

/** On page load, add event handler for clicking clues */
$("#jeopardy").on("click", handleClick);
// TODO