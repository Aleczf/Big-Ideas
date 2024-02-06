
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase, onValue, push, ref, set, remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")
let notesArray = []

const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")

const ASCENDING_ORDER = '-1'
const DESCENDING_ORDER = '1'
let currentCardOrder



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
    deleteBtn.textContent = "X"
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

function createFirstNote(){
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
    location.reload()
})

// GESTIONE ORDINE DECRESCENTE
document.getElementById('least-recent').addEventListener('click', () => {

    localStorage.setItem('currentCardOrder', DESCENDING_ORDER)
    location.reload()
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

    } else if(expandedCard && !event.target.closest('.card')) { //CONTRAE LA CARD
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})




// SALVO NUOVA NOTA O MODIFICO SE PREESISTENTE
function saveNote(selectedCard) {

    let _uuid = parseInt(selectedCard.getAttribute('data-uuid')) //ASSOCIO L'UUID E LO TRASFORMO DA STRINGA A NUMERO
    let _title = selectedCard.querySelector('.title-card').innerText
    let _content = selectedCard.querySelector('.content-card').innerText
    let _date = new Date().toISOString()
    
    const existingCard = notesArray.find((card) => card[1].uuid === _uuid) //VERIFICO SE LA NOTA è GIA ESISTENTE

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



function saveOnFocusOut(myCard, _uuid) {

    myCard.addEventListener('focusout', (event) => {

        const isDeleteButton = event.relatedTarget && event.relatedTarget.id === 'delete-btn'
        const isOverlay = event.relatedTarget && event.relatedTarget.id === 'overlay'
        const isContent = event.relatedTarget && event.relatedTarget.id === 'title-card'
        const isTitle = event.relatedTarget && event.relatedTarget.id === 'content-card'

        if (!isDeleteButton && !isOverlay && !isContent && !isTitle) {  // Se il focusout non è stato causato dal click sul pulsante di eliminazione o sull'overlay, salva la nota
            saveNote(myCard, _uuid)
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

