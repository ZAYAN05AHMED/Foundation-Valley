
var questions = []//this should be empty by default as allthe questions will be added to this object from database
questions_temp =
    {
        key: "",
        question: "",
        answer: "",
        options: []//this sould be an array
    }

var quizHeader = document.getElementById("quizHeader")
var quizBody = document.getElementById("quizBody")
var qNum = 0
var answers = []//array to show the correct answers and false ones
var minutes = 0
var seconds = 0
var formattedMinutes = 0
var formattedSeconds = 0
var interval = 0
var addingRec = false
var editingRec = false
var rVal = ''

getQuestions()

function startQuiz(){
    document.getElementById("mainBody").style.display = "flex"
    document.getElementById("startBtn").style.display = "none"    
    document.getElementById("adminBtn").style.display = "none"   

    appendQuestion()
    interval = setInterval(function(){
        if(seconds<59) seconds++
        else{
            seconds=0
            if(minutes<59) minutes++
            else{
                minutes=0
                clearInterval(interval)
            }
        }
        formattedSeconds = seconds<10 ? `0${seconds}` : seconds
        formattedMinutes = minutes<10 ? `0${minutes}` : minutes
        document.getElementById("timer").innerHTML = `${formattedMinutes}:${formattedSeconds}`
    }, 1000)
}
function appendQuestion(){
    quizHeader.innerHTML = `<h3 class='quizHeader'>Q${qNum+1}/${questions.length}</h3><span id='timer'${minutes}:${seconds}</span>`
    var divBody = `<h3 class='quizHeader'>Q: ${questions[qNum].question}</h3>`
    divBody += "<ul class='option_group' id='option_group'>"
    for(var i=0; i<questions[qNum].options.length; i++)
        divBody += `<li class='option' onclick='activeOpt(this)'>${questions[qNum].options[i]}</li>`
    divBody += "</ul>"
    divBody += "<button class='btn btn-primary nxtBtn' onclick='nxtQuestion()'>Next question</button>"
    quizBody.innerHTML = divBody
}
function activeOpt(id){
    var ul = document.getElementById("option_group")
    for(var i=0; i<questions[qNum].options.length; i++){
        if(ul.childNodes[i].className === 'active')
            ul.childNodes[i].classList.remove('active')
        ul.childNodes[i].className = 'option'
    }   
    id.className = 'active'
    if(id.innerHTML === questions[qNum].answer) answers[qNum] = true
    else answers[qNum] = false
}
function nxtQuestion(){
    if(!(typeof answers[qNum] === 'undefined')){
        if(qNum < questions.length-1){
            qNum++
            appendQuestion()
        }
        else{
            qNum=0
            appendResult()
        }
    }
    else alert("please select an option")
}
function appendResult(){
    var correctQuestions = 0 // number of questions that were answered correctly
    document.getElementById("exitBtn").style.display = "none"
    clearInterval(interval)
    quizHeader.innerHTML = "<h3>Result</h3>"
    quizHeader.style.justifyContent = "center"
    var divBody = "<Table class='table table-bordered'><thead class='thead-dark'>"
    for(var i=0; i<questions.length; i++) divBody += `<th>Q${i+1}</th>`
    divBody += "</thead><tbody>"
    for(var i=0; i<questions.length; i++){
        if(answers[i]){
            divBody += "<td><img style='width:20px' src='Images/check.png'></td>"
            correctQuestions++
        }
        else divBody += "<td><img style='width:20px' src='Images/cancel.png'></td>"
    }
    divBody += "</tbody></table>"

    divBody += "<Table class='table table-bordered'><thead class='thead-dark'>"
    divBody += "<th>Points</th>"
    divBody += "<th>Percentage</th>"    
    divBody += "<th>Time Taken (mm:ss)</th>"
    divBody += "</thead></tbody>"
    divBody += `<td>${correctQuestions}/${questions.length}</td>`
    divBody += `<td>${(correctQuestions/questions.length)*100}%</td>`
    divBody += `<td>${formattedMinutes}:${formattedSeconds}</td>`
    divBody += "</tbody></table>"

    divBody += "<button class='btn btn-primary rstBtn' onclick='homePageReAttempt()'>Re-Attempt Quiz</button>"
    quizBody.innerHTML = divBody
}

// =====================Admin Panel========================
function adminPanel(){
    document.getElementById("mainBody").style.display = "none"
    document.getElementById("startBtn").style.display = "none"
    document.getElementById("adminBtn").style.display = "none"
    document.getElementById("mainPanel").style.display = "flex"
    appendAllQuestions()
}
function homePageReAttempt(){
    // we also need to clear the result table
    var first = document.getElementById("quizHeader").firstChild
    first.remove()
    first = document.getElementById("quizBody").firstChild
    while(first){
        first.remove()
        first = document.getElementById("quizBody").firstChild
    }
    clearInterval(interval)//the quiz time also needs to be reset
    document.getElementById("mainBody").style.display = "none"
    document.getElementById("startBtn").style.display = "block"
    document.getElementById("adminBtn").style.display = "block"
    document.getElementById("exitBtn").style.display = "block"
    document.getElementById("quizHeader").style.justifyContent = "space-between"
    answers = []//clear the correct answers
    qNum = 0//reset question number
    seconds = 0
    minutes = 0
}
function homePage(){
    document.getElementById("mainBody").style.display = "none"
    document.getElementById("startBtn").style.display = "block"
    document.getElementById("adminBtn").style.display = "block"
    document.getElementById("mainPanel").style.display = "none"
    var questionsUl = document.getElementById("questionsUl")
    var first = questionsUl.firstElementChild
    //this while loop will remove all questions from "questionsUl" when done button is pressed
    while(first){//while a child element is present inside questionsUl
        first.remove()//remove that first child element
        first = questionsUl.firstElementChild //update the "first" variable with the next first element
    }
}
function getQuestions(){//Gets all the questions from firebase and save them in questions object
    firebase.database().ref('Questions').once("value", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
        var data = data.val()
        let qNum = 0
        for(var property in data){//run this loop as long as the data has some property
            if(data.hasOwnProperty(property)){//check if this is its own proeprty
                questions[qNum] = //create objects inside new question
                {
                    key: "",
                    question: "",
                    answer: "",
                    options: []
                }
                questions[qNum].key = data[property].key
                questions[qNum].answer = data[property].answer
                questions[qNum].options = data[property].options
                questions[qNum].question = data[property].quesiton

                qNum++
            }
        }
        document.getElementById("loaderDiv").style.display = "none"
    })
}
function appendAllQuestions(){
    for(var j=0; j<questions.length; j++){
        var key = questions[j].key
        var numOfOptions = questions[j].options.length
        var optionVals = []
        var questionVal = questions[j].question
        for(var i=0; i<numOfOptions; i++)
            optionVals[i] = questions[j].options[i]
        var answerVal = questions[j].answer

        //here we'll be using the same code as we did in "addRec" function, with minor changes

        
        var divBody = "<li style='background-color: grey; border-radius: 30px; padding: 10px 30px; margin-bottom: 10px'>"
        divBody += `<h3 class='quizHeader'>Q${j+1}:&nbsp${questionVal}</h3>`
        divBody += "<ul class='options_group' id='options_group'>"//ul for options
        for(var i=0; i<numOfOptions; i++){
            if(optionVals[i] === answerVal)
                divBody += `<li class='optionPanel active'>${optionVals[i]}</li>`//active class assigned to this option if it matches the answer
            else 
                divBody += `<li class='optionPanel'>${optionVals[i]}</li>`//options which does'nt match the answer
        }

        //now lets add edit and remove buttons
        divBody += "<li style='display:flex; justify-content: center;'>"
        divBody += `<button class="btn btn-success fa fa-pencil liBtn" id="${key}" onclick="editRec(this)"></button>`
        divBody += `<button class="btn btn-danger fa fa-trash liBtn" id="${key}" onclick="deleteRec(this)"></button></li>`
        divBody += "</ul></li>"

        document.getElementById("questionsUl").innerHTML += divBody
    }
}
function addQuestion(){
    if(!addingRec){//check if a record is'nt already being added
        addingRec = true
        //Lets make a UI for adding question //
        var htmlDesign = '<li class="panelLi" style="background-color: grey; border-radius: 30px; padding: 10px 30px">'
        htmlDesign += '<h3>Q:&nbsp</h3>'
        htmlDesign += '<input type="text" class="form-control w-75">'
        htmlDesign += '<ul style="width: 1000px">'
        // this for loop willbe used to add input field for options
        for(var i=0; i<4; i++)
            htmlDesign += `<li style="display: flex;" class="panelLi"><h3>Option ${i+1}:&nbsp</h3><input class="form-control w-50"></li>`
        htmlDesign += '<li style="display: flex;"><h3>Answer:&nbsp</h3><input class="form-control w-50"></li>'
        htmlDesign += '<li style="display: flex; justify-content: center;">'
        htmlDesign += '<button class="btn btn-success liBtnAdd fa fa-check" onclick="addRec(this)"></button>'
        htmlDesign += '<button class="btn btn-danger liBtnCancel fa fa-times" onclick="discardRec(this)"></button>'
        htmlDesign += '</li>'
        htmlDesign += '</ul>'
        htmlDesign += '</li>'
        document.getElementById("questionsUl").innerHTML += htmlDesign
    }
}
function addRec(id){
    var questionVal = id.parentNode.parentNode.parentNode.childNodes[1].value
    var numOfOptions = 4
    var optionVals = []
    for(var i=0; i<numOfOptions; i++)
        optionVals[i] = id.parentNode.parentNode.childNodes[i].childNodes[1].value
    var answerVal = id.parentNode.previousSibling.childNodes[1].value
    
    // if addQuestion called this function(addRec), then we have to generate a new key
    // we have to assign a unique key to our questions object first
    if(!editingRec) var key = firebase.database().ref('Questions').push().key //generate a key for the Questions object

    // if editRec called this function, then we have to get the question key from the button 
    else var key = id.id
    // check if any field is empty
    if(!(questionVal === '') && !(answerVal === '')){//if the fields are filled, then process further
        var enteredOptions = 0
        // check of at least two options are entered
        for(var i=0; i<optionVals.length; i++){
            if(!(optionVals[i] === '')) enteredOptions++
            if(enteredOptions == 2) break
        }
        if(enteredOptions !== 2) alert("Please enter atleast two options")
        else{
            // check of the answer matches any of the options
            enteredOptions = 0
            for(var i=0; i<optionVals.length; i++){
                if(optionVals[i] === answerVal){
                    enteredOptions = 1//this flag indicates that the answer matches one of the answers
                    break
                }
            }
            if(!enteredOptions) alert("Please enter one of the options in answer filed")
            else{
                addingRec = false //reset this flag so that new data can be added afterwards
                if(editingRec){//if we're editing a record
                    editingRec = false
                    var qNumEditHtml = id.parentNode.parentNode.parentNode.firstChild.innerHTML//this will be used to get the full html of question number we are editing
                    //now lets extract the question number from that innerHTML
                    var qNumEdit = qNumEditHtml.substring(1, qNumEditHtml.indexOf(':')) //start from index 1 and end at ':' sign
                    var currentEditQuestion = questions[qNumEdit-1]

                    currentEditQuestion.question = questionVal
                    currentEditQuestion.answer = answerVal
                    for(var i=0; i<numOfOptions; i++)
                        currentEditQuestion.options[i] = optionVals[i]

                    var divBody = "<li style='background-color: grey; border-radius: 30px; padding: 10px 30px; margin-bottom: 10px'>"
                    divBody += `<h3 class='quizHeader'>Q${qNumEdit}:&nbsp${currentEditQuestion.question}</h3>`
                    divBody += "<ul class='options_group' id='options_group'>"//ul for options
                    for(var i=0; i<currentEditQuestion.options.length; i++){
                        if(currentEditQuestion.options[i] === currentEditQuestion.answer)
                            divBody += `<li class='optionPanel active'>${currentEditQuestion.options[i]}</li>`//active class assigned to this option if it matches the answer
                        else 
                            divBody += `<li class='optionPanel'>${currentEditQuestion.options[i]}</li>`//options which does'nt match the answer
                    }
                
                }
                else{//if we're adding a new record
                    questions[questions.length] = 
                    {
                        key: "",
                        question: "",
                        answer: "",
                        options: []//this sould be an array
                    }//add template object inside new question index
                    let currentQuestion = questions[questions.length-1]
                    currentQuestion.key = key
                    currentQuestion.question = questionVal//insert question in the object
                    currentQuestion.answer = answerVal//insert answer value in the object
                    for(var i=0; i<numOfOptions; i++)
                        currentQuestion.options[i] = optionVals[i]//insert option values
                    var divBody = "<li style='background-color: grey; border-radius: 30px; padding: 10px 30px; margin-bottom: 10px'>"
                    divBody += `<h3 class='quizHeader'>Q${questions.length}:&nbsp${currentQuestion.question}</h3>`
                    divBody += "<ul class='options_group' id='options_group'>"//ul for options
                    for(var i=0; i<currentQuestion.options.length; i++){
                        if(currentQuestion.options[i] === currentQuestion.answer)
                            divBody += `<li class='optionPanel active'>${currentQuestion.options[i]}</li>`//active class assigned to this option if it matches the answer
                        else 
                            divBody += `<li class='optionPanel'>${currentQuestion.options[i]}</li>`//options which does'nt match the answer
                    }
                }
                //now lets add edit and remove buttons
                divBody += "<li style='display:flex; justify-content: center;'>"
                divBody += `<button class="btn btn-success fa fa-pencil liBtn" id='${key}' onclick="editRec(this)"></button>`//assign the uiniue id key to the buttons so that when we edit a record, we know which auestion to edit in the database
                divBody += `<button class="btn btn-danger fa fa-trash liBtn" id='${key}' onclick="deleteRec(this)"></button></li>`//assign the uiniue id key to the buttons so that when we delete a record, we know which auestion to delete in the database
                divBody += "</ul></li>"
                var p = document.createElement('p')
                p.innerHTML += divBody
                document.getElementById("questionsUl").insertBefore(p.firstChild, id.parentNode.parentNode.parentNode.nextSibling)//insert question before the next sibbling of last questions
                id.parentNode.parentNode.parentNode.remove()

                //make an object which will be pushed to the databse and push all values to it
                var data = 
                {
                    key: key,
                    quesiton: questionVal,
                    options: optionVals,
                    answer: answerVal
                } 
                firebase.database().ref(`Questions/${key}`).set(data)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
            }
        }
    }
    else alert('Please fill in the required fields')
}
function editRec(id){
    if(!addingRec){
        addingRec = true
        editingRec = true
        let key = id.id
        let numOfOtions = id.parentNode.parentNode.childNodes.length - 1//check number of li's inside optionsUl and -1(as there one li for buttons)
        let optionVals = []
        let answerVal = ''
        let questionValHtml = id.parentNode.parentNode.parentNode.childNodes[0].innerHTML//the full question including "Q: "
        // lets first console.log the value
        let questionVal = questionValHtml.substring(questionValHtml.indexOf(';') + 1, questionValHtml.length)
        let editQNum = questionValHtml.substring(1,2)
        for(var i=0; i< numOfOtions; i++){
            optionVals[i] = id.parentNode.parentNode.childNodes[i].innerHTML
        if(id.parentNode.parentNode.childNodes[i].className.indexOf('active') !== -1)//if the class of option is 'active', that means that it's the correct answe
            answerVal = optionVals[i]//assign this option value to the answer object
        }
        //we will store the whole li which has our quesion,answer and options to the 'rVal', so if we do'nt update the edited question, we may restore the recent value
        rVal = id.parentNode.parentNode.parentNode.parentNode.childNodes[editQNum]

        //now we have to put every object inside a input element, this will be almost same as we did in addQuestion()
        
        var htmlDesign = '<li class="panelLi" style="background-color: grey; border-radius: 30px; padding: 10px 30px">'
        htmlDesign += `<h3>Q${editQNum}:&nbsp</h3>`//we have to enter the question number here
        htmlDesign += `<input type="text" value="${questionVal}" class="form-control w-75">`
        htmlDesign += '<ul style="width: 1000px">'
        // this for loop willbe used to add input field for options
        for(var i=0; i<4; i++)
            htmlDesign += `<li style="display: flex;" class="panelLi"><h3>Option ${i+1}:&nbsp</h3><input class="form-control w-50" value="${optionVals[i]}"></li>`
        htmlDesign += `<li style="display: flex;"><h3>Answer:&nbsp</h3><input class="form-control w-50" value="${answerVal}"></li>`
        htmlDesign += '<li style="display: flex; justify-content: center;">'
        htmlDesign += `<button class="btn btn-success liBtnAdd fa fa-check" id="${key}" onclick="addRec(this)"></button>`// the same addRec() function will be used
        htmlDesign += `<button class="btn btn-danger liBtnCancel fa fa-times" id="${key}" onclick="cancelUpdateRec(this)"></button>`
        htmlDesign += '</li>'
        htmlDesign += '</ul>'
        htmlDesign += '</li>'
    
        var p = document.createElement('p')
        p.innerHTML += htmlDesign
        document.getElementById("questionsUl").insertBefore(p.firstChild, id.parentNode.parentNode.parentNode.nextSibling)//insert question before the next sibbling of last questions
        id.parentNode.parentNode.parentNode.remove()
    }
    else "A record adding is already in progress"
}
function deleteRec(id){
    var deleteQNumHtml = id.parentNode.parentNode.parentNode.firstChild.innerHTML
    var deleteQNum = deleteQNumHtml.substring(1, deleteQNumHtml.indexOf(':'))
    var questionsUl = document.getElementById("questionsUl")
    questions.splice(deleteQNum-1, 1)//also delete the object of this question from the "questions" array
    var first = questionsUl.firstElementChild
    //this while loop will remove all questions from "questionsUl" when done button is pressed
    while(first){//while a child element is present inside questionsUl
        first.remove()//remove that first child element
        first = questionsUl.firstElementChild //update the "first" variable with the next first element
    }
    firebase.database().ref(`Questions/${id.id}`).remove()
    appendAllQuestions()
}
function dellAll(){
    addingRec = false
    var questionsUl = document.getElementById("questionsUl")
    var first = questionsUl.firstElementChild
    while(first){
        first.remove();
        first = questionsUl.firstElementChild
    }
    questions.splice(0, questions.length)//clear all questions from "questions" array
    firebase.database().ref('Questions').remove()// delete the whole questions object
}
function cancelUpdateRec(id){
    addingRec = false
    editingRec = false
    document.getElementById("questionsUl").insertBefore(rVal, id.parentNode.parentNode.parentNode.nextSibling)//add the rVal(as we have stored the previous value here) before the next question
    id.parentNode.parentNode.parentNode.remove()// now remove the input fields
}
function discardRec(id){
    addingRec = false
    id.parentNode.parentNode.parentNode.remove()
}