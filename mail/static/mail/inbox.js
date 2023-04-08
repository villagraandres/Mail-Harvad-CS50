document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', function () {
    compose_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');



    //check if is submited
   const form=document.querySelector('#compose-form');
    form.addEventListener('submit',sendEmail)

    
    

});



function sendEmail(e){
    e.preventDefault()
  const recipients= document.querySelector('#compose-recipients').value;
  const subject= document.querySelector('#compose-subject').value;
  const body= document.querySelector('#compose-body').value;
  const btn=document.querySelector('#submitBtn');
  const spinner=document.querySelector('#spinner');

  if(!verify()){
    alert('All the data must be filled')
    return
}

  btn.style.display = 'none';
  spinner.style.display='block'
 

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      if(result.error){
        alert(result.error);
      }else{
        load_mailbox('sent');
      }
      btn.style.display = 'block';
      spinner.style.display='none'
    
     
  });
      
 
}


function compose_email(mail) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';


  //restart
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';



  document.querySelector('#compose-recipients').value = mail ? mail.sender : '';
  //if start with Re we only show the subject, if not we add the Re
  document.querySelector('#compose-subject').value = mail ? mail.subject.startsWith("Re") ? `${mail.subject}`: `Re: ${mail.subject}`  : '';
  document.querySelector('#compose-body').value = mail ? `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body} || Answer: ` : '';

}




function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  if(mailbox == 'inbox'){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {

      // ... do something else with emails ...
        showEmails(emails);
        
    });
  }



  if(mailbox==='sent'){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        showEmails(emails);

        // ... do something else with emails ...
    });
  }


  if(mailbox==='archive'){
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        showEmails(emails);

        // ... do something else with emails ...
    });
  }
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function verify(){
  const inputs=document.querySelectorAll('.form-control');
  for(let i = 0; i < inputs.length; i++){
    if(inputs[i].value === ''){
      return false; 
    }
  }
  return true; 
}


function showEmails(emails){

  const mailContainer=document.querySelector('#emails-view');
  

  emails.forEach(element => {
    const container= document.createElement('div');
    container.classList.add('mail','border')
    container.onclick=showMail
    container.dataset.id=element.id
    if(element.read){
      container.classList.add('readed');
    }
    container.innerHTML=`
    <p> <span class="fw-bold sender">${element.sender}</span>  ${element.subject}</p>
    <p>${element.timestamp}</p>
    `;
    
    mailContainer.appendChild(container);
    
  });
}

function showMail(){

  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#email-view').innerHTML='';
  

  

  const id=this.dataset.id;  

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
  
    const details=document.createElement('div');
    const archive=document.createElement('button');
    
    if(email.archived ){
      details.innerHTML=` 
      <div class="border-bottom mb-4">
        <p><span class="fw-bold">From: </span>${email.sender}</p>
        <p><span class="fw-bold">To: </span>${email.recipients}</p>
        <p><span class="fw-bold">Subject: </span>${email.subject}</p>
        <p><span class="fw-bold">Timestamp: </span>${email.timestamp}</p>
  
        <button type="button" id="reply-btn" data-id="${email.id}" class="btn btn-outline-primary mb-4">Reply</button>
        <button type="button" id="archive-btn" data-id="${email.id}" data-archived="true" class="btn btn-outline-primary mb-4">Unarchive</button>
        <button type="button" id="delete-btn" data-id="${email.id}"  class="btn btn-outline-primary mb-4">Delete</button>
      </div
      <div >
      <p>${email.body}</p>
      </div>
      `
    }else{
      details.innerHTML=` 
      <div class="border-bottom mb-4">
        <p><span class="fw-bold">From: </span>${email.sender}</p>
        <p><span class="fw-bold">To: </span>${email.recipients}</p>
        <p><span class="fw-bold">Subject: </span>${email.subject}</p>
        <p><span class="fw-bold">Timestamp: </span>${email.timestamp}</p>
  
        <button type="button" id="reply-btn" data-id="${email.id}" class="btn btn-outline-primary mb-4">Reply</button>
        <button type="button" id="archive-btn" data-id="${email.id}"data-archived="false" class="btn btn-outline-primary mb-4">Archive</button>
        <button type="button" id="delete-btn" data-id="${email.id}"  class="btn btn-outline-primary mb-4">Delete</button>
        </div
      <div >
      <p>${email.body}</p>
      </div>
      `
    }
   
    document.querySelector('#email-view').appendChild(details);

    document.querySelector('#archive-btn').addEventListener('click',(e)=>{
     
       if(e.target.dataset.archived === 'false'){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(()=> load_mailbox('inbox') );
       
       }else{
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(() => load_mailbox('inbox') );
       }     
    });
    document.querySelector('#reply-btn').addEventListener('click',reply);
    document.querySelector('#delete-btn').addEventListener('click',deleteMail);
   

    //mark as reed the email
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

    
});
}

function deleteMail(e){
  const id= parseInt(e.target.dataset.id);
  console.log(id);

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {

      fetch('/delete', {
        method: 'POST',
        body: JSON.stringify({
            id: id
        })
      })
      .then(response=>response.json()) 
      .then(message=>{
        load_mailbox('sent');
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
        
      })     
    }
  })

 

 
}

function reply(e){
  const id= parseInt(e.target.dataset.id);

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      compose_email(email);
      // ... do something else with email ...
  });
}