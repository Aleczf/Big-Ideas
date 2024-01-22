
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, onValue, push, ref, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")


document.addEventListener('DOMContentLoaded', () => { updateUI() })

function updateUI() {
    onValue(notesInDB, (snapshot) => {

        container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
        let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
        
        for (const nota of notes) {
            createCard(nota.title, nota.content, nota.uuid)
        }
    })
}




const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")
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

    saveOnFocusOut(newCard)
    deleteNote()

    // SALVA LA NOTA AL FOCUSOUT
    
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

        // document.getElementById("delete-btn").addEventListener('click', function() {
        //     console.log("removed")
        // })
        
        // console.log(selectedCard)
        // console.log(`the card ${selectedCard.dataset.uuid} has been selected`)

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

        onValue(notesInDB, (snapshot) => {
            container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
    
            let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
            
            for (const nota of notes) {
                createCard(nota.title, nota.content, nota.uuid)
            }
        })

        console.log('modifica nota')
        console.log(cardArr)        


    } else {     // CREA NUOVA NOTA
        const newNote = {
            title : _title,
            content : _content,
            uuid : _uuid
        }
        cardArr.push(newNote)
        push(notesInDB, newNote)
    }    
    return
}



function saveOnFocusOut(myCard) {
    myCard.addEventListener('focusout', (event) => {
        const isDeleteButton = event.relatedTarget && event.relatedTarget.id === 'delete-btn';
        const isOverlay = event.relatedTarget && event.relatedTarget.id === 'overlay';

        if (!isDeleteButton && !isOverlay) {
            // Se il focusout non è stato causato dal click sul pulsante di eliminazione o sull'overlay, salva la nota
            saveNote(myCard);
            updateUI();
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
            const selectedCard = event.target.closest('.card')     
            console.log('rimosso')
    
            if (selectedCard){     
                selectedCard.remove()

                onValue(notesInDB, (snapshot) => {
                let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY


                    for (let i = 0; i < notes.length; i++) {
                        console.log(notes)

                        let currentItem = notes[i]
                        let currentItemID = currentItem[0]
                        console.log(currentItemID)

                    const locationInDB = ref(database, `notes/${uuid}`)
                    remove(locationInDB)
                    }
                })
            }
        })    

    })
}

