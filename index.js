
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
let notes = []

const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")
let cardArr = []



onValue(notesInDB, (snapshot) => {

    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
    
    const snapshotValue = snapshot.val() 
    if(snapshotValue){ //MI ASSICURO CHE IL DATABASE (SNAPSHOT) SIA POPOLATO
        
        notes = Object.values(snapshotValue) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
        notesArray = Object.entries(snapshotValue) //FETCH DELL'INTERO ARRAY CON CHIAVI E VALORI DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY        
        console.log(notesArray)
        updateUI()
    }    
})


function updateUI() {
    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE                 
    
    notes.forEach((nota) => {
        createCard(nota.title, nota.content, nota.uuid)
        // console.log(nota.uuid)
    })
}

document.addEventListener('DOMContentLoaded', updateUI) //faccio riferimento ad updateUI al caricamento del dom ma senza invocarla




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
    
}

   



//  GESTIONE AGGIUNTA CARD AL DOM 
document.getElementById('add-btn').addEventListener('click', () => {
    createCard()
})


//  GESTIONE svuota tutto 
document.getElementById('svuota-tutto').addEventListener('click', () => {
    
    onValue(notesInDB, (snapshot) => {
        container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
        remove(notesInDB)
        location.reload()
    })
})


// FUNZIONE PER ESPANSIONE DELLA CARD
function expandCard(card) {
    let uuid = card.getAttribute('data-uuid')

    // if (!uuid) {
    //     // Se la card non ha un UUID, generane uno e assegnalo
    //     uuid = Math.floor(Math.random() * 10000000)
    //     card.setAttribute('data-uuid', uuid)
    //     console.log(card.uuid)
    // }

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
    
    const existingCard = notesArray.find((card) => card[1].uuid === _uuid) //VERIFICO SE LA NOTA è GIA ESISTENTE

    if(existingCard) {
        
        let noteEdited = {
            title : _title,
            content : _content,
            uuid : _uuid
        }

        let noteIDToEdit = existingCard[0]
        let exactLocationOfItemInDB = ref(database, `notes/${noteIDToEdit}`)
        
        set(exactLocationOfItemInDB, noteEdited)

    } else {     // CREA NUOVA NOTA
        const newNote = {
            title : _title,
            content : _content,
            uuid : _uuid
        }
        push(notesInDB, newNote) 
    }    
}



function saveOnFocusOut(myCard, _uuid) {

    myCard.addEventListener('focusout', (event) => {

        const isDeleteButton = event.relatedTarget && event.relatedTarget.id === 'delete-btn';
        const isOverlay = event.relatedTarget && event.relatedTarget.id === 'overlay';

        if (!isDeleteButton && !isOverlay) {  // Se il focusout non è stato causato dal click sul pulsante di eliminazione o sull'overlay, salva la nota
            saveNote(myCard, _uuid);
        }

        const expandedCard = document.querySelector('.card.expanded');
        if (!expandedCard) {
            overlay.style.display = "none";
        }
    });
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




