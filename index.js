
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase, onValue, push, ref, remove, set } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")
let notesArray = []

const container = document.getElementById('container')
const header = document.getElementById('header')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")

const ASCENDING_ORDER = '-1'
const DESCENDING_ORDER = '1'
let currentCardOrder
let isNoteEdited = false

let isLayoutOneCol = false



//RETRIEVING DEI VALORI SALVATI SU FIREBASE
onValue(notesInDB, (snapshot) => {

    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
    
    const snapshotValue = snapshot.val() 
    if(snapshotValue){ //MI ASSICURO CHE IL DATABASE (SNAPSHOT) SIA POPOLATO
        
        notesArray = Object.entries(snapshotValue) //FETCH DELL'INTERO ARRAY CON CHIAVI E VALORI DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY        
        console.log(notesArray)
        updateUI()
    }    
})



function updateUI() {

    currentCardOrder = localStorage.getItem('currentCardOrder')   //CONTROLLO L'ORDINE IN CUI DEVO RENDERIZZARE LE CARD

    if(currentCardOrder === ASCENDING_ORDER){
        notesArray.sort(function (a, b) {
            return new Date(a[1].updated) - new Date(b[1].updated)
        })
    } else if (currentCardOrder === DESCENDING_ORDER){
        notesArray.sort(function (a, b) {
            return new Date(b[1].updated) - new Date(a[1].updated)
        })
    }
    
    container.innerHTML = ''   //RIPULISCO IL CONTAINER PRIMA DI AGGIUNGERE LE NOTE
    
    notesArray.forEach((nota) => {
        createCard(nota[1].title, nota[1].content, nota[1].uuid)
    })
}




document.addEventListener('DOMContentLoaded', updateUI)




function createCard(_title = 'Titolo', _content = '', uuid) {
  
    //CREO NUOVA CARD    
    const newCard = document.createElement('div')
    newCard.id = 'card'
    newCard.className = 'card'    

    // CREO NUOVO UUID E LO ASSEGNO AD OGNI CARD CREATA
    if(typeof uuid === 'undefined') {
        uuid = Math.floor(Math.random() * 10000000)
    }
    newCard.setAttribute ('data-uuid', uuid) 

    // MEMORIZZO IL TITOLO E IL CONTENUTO ORIGINALI NEL DATASET DELLA CARD, AGGIORNANDOSI COL NUOVO AD OGNI SALVATAGGIO
    newCard.dataset.previousTitle = _title
    newCard.dataset.previousContent = _content

    
    //CREO TITOLO DA INSERIRE NELLA CARD
    const title = document.createElement('h2')
    title.id = 'title-card'
    title.className = 'title-card'
    title.contentEditable = true
    title.textContent = _title
    
    // Cancellazione placeholder al focus del campo title
    title.addEventListener('focus', () => { 
        if(title.textContent === 'Titolo'){
            title.textContent = ''
        }
    })
  
     
    //CREO TEXTAREA DA INSERIRE NELLA CARD
    const content = document.createElement('div')
    content.id = 'content-card'
    content.className = 'content-card'
    content.contentEditable = true
    content.textContent = _content

    //CREO PULSANTE ELIMINA DA INSERIRE NELLA CARD
    const deleteBtn = document.createElement('div')
    deleteBtn.id = 'delete-btn'
    deleteBtn.className = 'delete-btn'
    deleteBtn.textContent = "elimina"
    deleteBtn.setAttribute('data-uuid', uuid)
       
    newCard.appendChild(title)
    newCard.appendChild(content)
    newCard.appendChild(deleteBtn)
    container.insertAdjacentElement('afterbegin', newCard)
   
    saveOnFocusOut(newCard, uuid)
    deleteNote()
                 
    return newCard
}




//  GESTIONE AGGIUNTA CARD AL DOM, CREATA AL CLICK DI ADD-BTN
document.getElementById('add-btn').addEventListener('click', () => createFirstNote())

function createFirstNote() {
    let freshNote = createCard()

    requestAnimationFrame(() => {
        expandCard(freshNote)
        freshNote.querySelector('.content-card').focus()  
    })
}




//  GESTIONE svuota tutto 
document.getElementById('svuota-tutto').addEventListener('click', () => {
    
    onValue(notesInDB, (snapshot) => {
        container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
        remove(notesInDB)
        location.reload()
    })
})



// GESTIONE ORDINE CRESCENTE
document.getElementById('most-recent').addEventListener('click', () => {

    localStorage.setItem('currentCardOrder', ASCENDING_ORDER)
    updateUI()
})

// GESTIONE ORDINE DECRESCENTE
document.getElementById('least-recent').addEventListener('click', () => {

    localStorage.setItem('currentCardOrder', DESCENDING_ORDER)
    updateUI()
})




// FUNZIONE PER ESPANSIONE DELLA CARD
function expandCard(card) {
    card.classList.add("expanded")
    overlay.style.display = "block" 
}

function collapseCard(myCard) {  //da unire ad expandCard()
    myCard.classList.remove("expanded")
    overlay.style.display = "none"
}

container.addEventListener('click', (event) => {
    const expandedCard = document.querySelector('.card.expanded')

    if(expandedCard && !event.target.closest('.card')) {
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})




//HANDLER CLICK EXPANDED CARD
container.addEventListener('click', function(event) {
    const selectedCard = event.target.closest('.card')
    const expandedCard = document.querySelector('.card.expanded')

    if(selectedCard){       // ESPANDE LA CARD        
        expandCard(selectedCard)

    } else if(expandedCard && !selectedCard) { //CONTRAE LA CARD
        collapseCard(selectedCard)
    }
})






// SALVO NUOVA NOTA O MODIFICO SE PREESISTENTE
function saveNote(selectedCard) {

    let _uuid = parseInt(selectedCard.getAttribute('data-uuid')) //ASSOCIO L'UUID E LO TRASFORMO DA STRINGA A NUMERO
    let _title = selectedCard.querySelector('.title-card').innerText
    let _content = selectedCard.querySelector('.content-card').innerText
    let _date = new Date().toISOString()
    
    const existingCard = notesArray.find((card) => card[1].uuid === _uuid) //VERIFICO SE LA NOTA è GIA ESISTENTE

    if(isNoteEdited) {

        if(existingCard) {
            
            let noteEdited = {
                title : _title,
                content : _content,
                uuid : _uuid,
                updated: _date
            }
            console.log(`The note ${noteEdited.title} has ben edited at ${noteEdited.updated}`)

            let noteIDToEdit = existingCard[0]
            let exactLocationOfItemInDB = ref(database, `notes/${noteIDToEdit}`)
            
            set(exactLocationOfItemInDB, noteEdited)

        } else {     // CREA NUOVA NOTA
            const newNote = {
                title : _title,
                content : _content,
                uuid : _uuid,
                updated: _date
            }
            push(notesInDB, newNote) 
            console.log(`A new note has ben added at ${newNote.updated}`)
        }
    }
}


function saveOnFocusOut(myCard, _uuid) {

    myCard.addEventListener('focusout', (event) => {

        const isDeleteButton = event.relatedTarget && event.relatedTarget.id === 'delete-btn'
        const isOverlay = event.relatedTarget && event.relatedTarget.id === 'overlay'
        const isContent = event.relatedTarget && event.relatedTarget.id === 'title-card'
        const isTitle = event.relatedTarget && event.relatedTarget.id === 'content-card'

        if (!isDeleteButton && !isOverlay && !isContent && !isTitle) {  // Se il focusout non è stato causato dal click sul pulsante di eliminazione o sull'overlay, salva la nota
            
            const title = myCard.querySelector('.title-card').innerText
            const content = myCard.querySelector('.content-card').innerText
            const previousTitle = myCard.dataset.previousTitle
            const previousContent = myCard.dataset.previousContent

            if (title !== previousTitle || content !== previousContent) {
                isNoteEdited = true
                saveNote(myCard, _uuid)
                isNoteEdited = false

            }

            collapseCard(myCard)                
        }

        const expandedCard = document.querySelector('.card.expanded')
        if (!expandedCard) {
            overlay.style.display = "none"
        }
    })
}



function deleteNote(){

    const deleteBtns = document.querySelectorAll('.delete-btn')
    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (event) => {

            event.stopImmediatePropagation()     

            const uuid = deleteBtn.getAttribute('data-uuid')
            let noteIDToDelete

            for (let nota of notesArray){

                if(nota[1].uuid == uuid){ //USO DI EQUALITY NON STRICT IN QUANTO COMPARAZIONE TRA STRINGA E NUMERO
                    noteIDToDelete = nota[0]  
                }
                let exactLocationOfItemInDB = ref(database, `notes/${noteIDToDelete}`)
                remove(exactLocationOfItemInDB)                                                 
            }              
        })    
    })
}


document.getElementById('layout-toggle').addEventListener('click', () => {

    const cards = document.querySelectorAll('.card')   
    
    if(container.classList.contains('container')) {
        container.classList.remove('container') 
        container.classList.add('one-col-layout') 
        
        cards.forEach(card => {
            card.classList.add('one-col-card')
        })


    } else {
        container.classList.remove('one-col-layout') 

        cards.forEach(card => {
            card.classList.remove('one-col-card')
        })

        container.classList.add('container')         
    }    
})





// PULSANTE PER SWITCHARE LAYOUT A UNA COLONNA SOLA

// document.getElementById('layout-toggle').addEventListener('click', () => {

//     isLayoutOneCol = true

//     if(isLayoutOneCol) {
//         const cards = document.querySelectorAll('.card')    
        
//         container.style.width = "400px"
//         container.style.gridTemplateColumns = "1fr"

//         cards.forEach(card => {
//             card.style.width = "390px";
//         });
//     }

// })

//rivedere/sistemare lo switch di ritorno


