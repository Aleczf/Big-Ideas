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



//RIMPIAZZARE QUELLA QUI SOPRA ^^^^^^^^


// function saveNote(uuidElement, titleElement, contentElement){
           
//     uuidElement = selectedCard.dataset.uuid
//     titleElement = selectedCard.querySelector('.title-card')
//     contentElement = selectedCard.querySelector('.content-card')


//     const existingCard = cardArr.find(card => card.uuid === uuidElement)
//     const existingCardIndex = cardArr.findIndex(card => card.uuid === uuidElement)
    
    
//     if(existingCardIndex >= 0){
       
//         cardArr[existingCardIndex].title = titleElement.textContent
//         cardArr[existingCardIndex].content = contentElement.textContent
        
//         console.log(cardArr[existingCardIndex])

//     } else {

//         const newNote = {
//             uuid : uuidElement,
//             title : titleElement,
//             content : contentElement
//         }
//         cardArr.push(newNote)
//         console.log(newNote)
//     }
// }
























// card.addEventListener('focusout', () => {

//     console.log('dsadsa')

//     let body__Note = contentCard.textContent
//     console.log(body__Note)
//     // push(notesInDB, body__Note)

// })







// // handler provvisorio salvataggio
// container.addEventListener('focusout', (e) => /* scrivere qui una funzione diciarata qui!*/ {
    
//     const selectedCard = e.target.closest('.card')

//     if(selectedCard){
//     console.log(`the card ${selectedCard.dataset.uuid} has been selected`)
//     }




    
//     // const existingCard = cardArr.findIndex(card => card.uuid === uuid)
    
//     // if(existingCard >= 0){        
//     //     cardArr[existingCard].title = titleElement.textContent
//     //     cardArr[existingCard].content = contentElement.textContent
//     //     console.log(cardArr[existingCard])
//     // }
// })




// function updateCardArray(uuid, titleElement, contentElement) {

//     const existingCard = cardArr.findIndex(card => card.uuid === uuid)

//     if(existingCard >= 0) {
        
//         cardArr[existingCard].title = titleElement.textContent
        
//         // existingCard.content = content

//         // cardArr[existingCard].title = title.textContent
//         // cardArr[existingCard].content = content.textContent
    
//     } else { const newCard = {
//         title: titleElement.textContent,
//         content: contentElement.textContent,
//         uuid: uuid
//         }
//     }

//     cardArr.push(newCard);


//     // //SALVO NEL DATABASE
//     // let content__Note = cardArr
//     // push(notesInDB, content__Note)

//     console.log(cardArr)
    
// }






// const item1 = {descrizione: 'blundestone', prezzo: '150', quantità: '1'}
// const item2 = {descrizione: 'nike', prezzo: '80', quantità: '2'}
// const item3 = {descrizione: 'artengo', prezzo: '15', quantità: '1'}

// const cart = []

// // cart.push(item1, item2, item3)

// // const prezzoTotale = cart.reduce((acc, product) =>  acc + product.prezzo * product.quantità ,0)


// const addItem = ({descrizione, prezzo, quantità}) => {
//     cart.push({descrizione, prezzo, quantità})
//     cart.prezzoTotale = (cart.prezzoTotale ?? 0) + prezzo * quantità
// }

// addItem(item1)
// addItem(item2)
// addItem(item3)




// console.log(cart)









// SALVATAGGIO NOTA IN DB  

// if (card) {
//     contentCard.addEventListener('focusout', (e) => {
//         let x = e.target.dataset.id
//         console.log(x)

//         let body__Note = contentCard.value
//         console.log(body__Note)
//         push(notesInDB, body__Note)
    
//     })
    
// }


// if (card) {
//     let body__Note = contentCard.value
//     console.log(body__Note)

// }