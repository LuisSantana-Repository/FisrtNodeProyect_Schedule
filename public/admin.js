function toRowUser(User){
    let html = /*html*/`
            
        
        <tr>
        <td>${User.name}</td>
        <td><a
            name=""
            id=""
            class="btn btn-warning"
            href="#"
            role="button"
            onclick="changePassword('${User.email}')"
            >Change Pasword</a
        >
        </td>
        <td><a
            name=""
            id=""
            class="btn btn-danger"
            href="#"
            role="button"
            onclick="EliminateUser('${User.email}')"
            >Eliminate</a
        >
        </td>
    </tr>
    `

    return html
}

async function create() {
    event.preventDefault()
    let Fname = document.getElementById("FirtsN").value;
    let Lname = document.getElementById("LastN").value;
    let email = document.getElementById("email").value;
    let password1 = document.getElementById("Password1").value;
    let password2 = document.getElementById("Password2").value;
    let type1 = document.getElementById("btncheck1").checked;
    let type2 = document.getElementById("btncheck2").checked;
    let type3 = document.getElementById("btncheck3").checked;
    let ISC = document.getElementById('ISC').checked;
    let IDC = document.getElementById('IDC').checked;

    let num;
    if (type1) num = 0;
    if (type2) num = 1;
    if (type3) num = 2;

    let schedule;
    if (ISC) {
        schedule = 'ISC';
    } else {
        schedule = 'IDC';
    }

    console.log(schedule);
    let token = localStorage.getItem("Token");

    console.log(Fname, Lname, email, password1, password2, type1, type2, type3, num, token);

    if (password1 !== password2) {
        Swal.fire({
            title: "Not same Passwords",
            icon: "error",
        });
        return;
    }

    let Response = await fetch('/api/User', {
        method: 'POST',
        headers: {
            "x-token": token,
            "x-auth": "23423",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": Fname + " " + Lname,
            "email": email + "@iteso.mx",
            "password": password1,
            "userType": num,
            "Curiculum": schedule
        })
    });

    let data = await Response.json();
    if (data.error) {
        Swal.fire({
            title: data.error,
            icon: "error",
        });
    } else {
        Swal.fire({
            title: `Success status: ${Response.status}`,
            icon: "success",
        });
    }
}

async function showList(){

    list()
    let modalId = document.getElementById('ListUsers');
    let myModal = new bootstrap.Modal(modalId, {});
    myModal.show();

}
async function listDosentExist(){
    list();
}

async function list(){
    let name = document.getElementById('NameList').value
    let token = localStorage.getItem("Token")
    let filter="?userType=0"
    if(name) filter += "&name="+name
    console.log(filter)
    let request = await fetch('/api/User'+filter, {
        method: 'GET',
        headers:{
            "x-token":token,
            "x-auth": "23423",
        }
    })
    let data = await request.json()
    console.log(data)
    let table = data.users.map(u => toRowUser(u)).join('')
    //console.log(table)
    document.getElementById('Student').innerHTML=table;


    filter="?userType=1"
    if(name) filter += "&name="+name
    request = await fetch('/api/User'+filter, {
        method: 'GET',
        headers:{
            "x-token":token,
            "x-auth": "23423",
        }
    })
    data = await request.json()
    table = data.users.map(u => toRowUser(u)).join('')
    document.getElementById('Profesor').innerHTML=table;


    filter="?userType=2"
    if(name) filter += "&name="+name
    request = await fetch('/api/User'+filter, {
        method: 'GET',
        headers:{
            "x-token":token,
            "x-auth": "23423",
        }
    })
    data = await request.json()
    table = data.users.map(u => toRowUser(u)).join('')
    document.getElementById('Admin').innerHTML=table;
}

function toRowSubject(Subject,num){
    let html = /*html*/`
        <tr>
                                    <th scope="row">
                                            ${num}
                                        </th>
                                        <td>${Subject.name}</td>
                                        <td>${Subject.Curiculum.join('/')}</td>
                                        <td>
                                            <button
                                                type="button"
                                                class="btn btn-primary btn-lg"
                                                onclick="showinfo('${Subject._id}')"
                                            >
                                            <i class="bi bi-info-circle-fill"></i>
                                            </button>
                                        </td>
                                </tr>
    `
    return html
}
async function showSubjects(){
    let infoModalId = document.getElementById('info');
    let infoModal = bootstrap.Modal.getInstance(infoModalId);
    if (infoModal) {
        infoModal.hide();
    }

    
    Subjects()
    let modalId = document.getElementById('Subjects');
    let myModal = new bootstrap.Modal(modalId, {});
    myModal.show();
}

function toInfoHTML(u){
    let html=/*html*/`
        <li>
            ${u.name}
        </li>
    `
    return html;
}
async function showinfo(u){
    console.log(u)
    let request = await fetch('/api/Class/populate/'+u, {
        method: 'GET',
        headers:{
        }
    })
    let data = await request.json()
    console.log(data)
    let response = data.requirements.map(u=> toInfoHTML(u))
    document.getElementById('InfoList').innerHTML = response




    let subjectModalId = document.getElementById('Subjects');
    let subjectModal = bootstrap.Modal.getInstance(subjectModalId);
    if (subjectModal) {
        subjectModal.hide();
    }




    let modalId = document.getElementById('info');
    let myModal = new bootstrap.Modal(modalId, {});
    myModal.show();
}

async function newPaguiantion(){
    sessionStorage.setItem("paguination","1")
    Subjects()
}
async function SetPaguination(u){
    sessionStorage.setItem("paguination",`${u}`)
    console.log(u)
    Subjects()
}
async function Subjects(){
    let name = document.getElementById('SubjectName').value;
    let pageNumber = Number.parseInt(sessionStorage.getItem("paguination"))
    let filter ='?pageNumber='+pageNumber

    if(name) filter += '&name='+name

    let request = await fetch('/api/Class/'+filter, {
        method: 'GET',
        headers:{
            "Content-Type": "application/json"
        }
    })
    let data = await request.json()
    let count=0
    let table = data.users.map(u =>{
        count +=1;
        return toRowSubject(u,count)
    }).join('')
    console.log(table)
    document.getElementById('SubjectList').innerHTML=table;

    let html = /*html*/`
        <nav aria-label="Page navigation example">
  <ul class="pagination">
    `
    for (let index = 0; index < data.total/10; index++) {
        let page = index+1
        if(pageNumber != page){
            html+=/*html*/`
                <li class="page-item"><a class="page-link" onclick="SetPaguination('${page}')">${page}</a></li>
            `
        }else{
            html+=/*html*/`
                <li class="page-item active"><a class="page-link" onclick="SetPaguination('${page}')" >${page}</a></li>
            `
        }
    }
    html+=/*html*/`
        </ul>
    </nav>
    `
    document.getElementById('PaguinationClassList').innerHTML=html;


}

async function EliminateUser(email) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You want to delete ${email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons: true, 
    });

    if (result.isConfirmed) {
        let response = await fetch('/api/User/' + email, {
            method: 'DELETE',
            headers: {
                // Add any necessary headers here
            }
        });
        if (response.ok) {  // Check if the delete was successful
            await Swal.fire('Deleted!', 'The User has been deleted!', 'success');
            list();  // Assuming 'list()' is a function to refresh the list of users
        } else {
            await Swal.fire('Failed!', 'The User could not be deleted.', 'error');
        }
    } else if (result.isDismissed) {
        Swal.fire('Cancelled', 'Not deleted', 'error');
    }
}

async function changePassword(email) {
    let modalId = document.getElementById('ListUsers');
    let myModal = bootstrap.Modal.getInstance(modalId);
    if (myModal) {
        myModal.hide();
    }
    



    Swal.fire({
        title: `What's the new password for ${email}?`,
        input: 'password',
        inputPlaceholder: 'Enter new password',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Change Password',
        cancelButtonText: 'Cancel',
        preConfirm: async (newPassword) => {
            if (!newPassword) {
                Swal.showValidationMessage("You must enter a password.");
                return false;
            }
            try {
                let response = await fetch(`/api/User/${email}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "password": newPassword
                    })
                });
                let data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update password');
                }
                return data;
            } catch (error) {
                Swal.showValidationMessage(`Update failed: ${error.message}`);
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            Swal.fire({
                title: 'Password Changed',
                text: `The password for ${email} has been changed successfully.`,
                icon: 'success'
            });
        } else if (result.isDismissed) {
            Swal.fire({
                title: 'Cancelled',
                text: 'No password change was made.',
                icon: 'info'
            });
        }
    });
}



function hide(){
    document.getElementById('Curiculum').hidden =true;
}
function unhide(){
    document.getElementById('Curiculum').hidden =false
}

sessionStorage.setItem("paguination","1")