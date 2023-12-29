import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

import NoteManager from "./NotesAPI.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")

// push(notesInDB, "valore della card completa")



const container = document.getElementById('container')
const overlay = document.getElementById("overlay")

const card = document.getElementById('card')
const newCard = document.getElementById('newCard')


let cardArr = []


const noteManager = new NoteManager()


//  GESTIONE AGGIUNTA CARD AL DOM 
document.getElementById('add-btn').addEventListener('click', () => {
    NoteManager.createCard()
})



// ESPANDE LA CARD

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


    if(selectedCard){

        expandCard(selectedCard)
        console.log(selectedCard)
                
    } else if(expandedCard && !event.target.closest('.card')) { //CONTRAE LA CARD
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }

    if(selectedCard){
        console.log(`the card ${selectedCard.dataset.uuid} has been selected`)
        selectedCard.addEventListener('focusout', NoteManager.saveOnFocusOut(selectedCard))

    }


})


