
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")

// // FETCH DEI SALVATAGGI DA FIREBASE
// onValue(notesInDB, function(snapshot){
    
//     console.log(snapshot.val())


// })

const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const cardArr = []


function createCard(_title = 'Titolo', _content = '') {

    //CREO NUOVA CARD    
    const newCard = document.createElement('div')
    newCard.id = 'card'
    newCard.className = 'card'

    // CREO NUOVO ID E LO ASSEGNO AD OGNI CARD CREATA
    const uuid = Math.floor(Math.random() * 10000000)
    newCard.setAttribute ('data-uuid', uuid) 

    //CREO TITOLO DA INSERIRE NELLA CARD
    const title = document.createElement('h2')
    title.id = 'title-card'
    title.className = 'title-card'
    title.contentEditable = true
    title.textContent = _title
    
    //CREO TEXTAREA DA INSERIRE NELLA CARD
    const content = document.createElement('div')
    content.id = 'content-card'
    content.className = 'content-card'
    content.contentEditable = true
    content.textContent = _content

    newCard.appendChild(title)
    newCard.appendChild(content)
    container.insertAdjacentElement('afterbegin', newCard)

    saveOnFocusOut(newCard)            // SALVA LA NOTA AL FOCUSOUT

}



//  GESTIONE AGGIUNTA CARD AL DOM 
document.getElementById('add-btn').addEventListener('click', () => {
    createCard()
})



// FUNZIONE PER ESPANSIONE DELLA CARD

function expandCard(card) {   
    card.classList.add("expanded")
    overlay.style.display = "block" 
}

container.addEventListener('click', (event) => {
    const expandedCard = document.querySelector('.card.expanded')

    if(expandedCard && !event.target.closest('.card')) {
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})



//HANDLER CLICK EXPANDED CARD
document.addEventListener('click', function(event) {
    const selectedCard = event.target.closest('.card')
    const expandedCard = document.querySelector('.card.expanded')

    if(selectedCard){       // ESPANDE LA CARD
        expandCard(selectedCard)
        
        console.log(selectedCard)
        console.log(`the card ${selectedCard.dataset.uuid} has been selected`)

    } else if(expandedCard && !event.target.closest('.card')) { //CONTRAE LA CARD
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})



// SALVO NUOVA NOTA O MODIFICO SE PREESISTENTE
function saveNote(selectedCard) {

    let _uuid = selectedCard.dataset.uuid
    let _title = selectedCard.querySelector('.title-card').innerText
    let _content = selectedCard.querySelector('.content-card').innerText
    const existingCardIndex = cardArr.findIndex(card => card.uuid === _uuid)

    if(existingCardIndex >= 0){         // MODIFICA NOTA GIA ESISTENTE
        cardArr[existingCardIndex].title = _title
        cardArr[existingCardIndex].content = _content

    } else {     // CREA NUOVA NOTA
        const newNote = {
            title : _title,
            content : _content,
            uuid : _uuid
        }
        cardArr.push(newNote)
        push(notesInDB, newNote)


    }    
    console.log(cardArr)        
    return
}


function saveOnFocusOut(myCard) {
    myCard.addEventListener('focusout', () => {
        saveNote(myCard)
    })
}


