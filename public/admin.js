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

async function create(){
    event.preventDefault()
    let Fname = document.getElementById("FirtsN").value
    let Lname = document.getElementById("LastN").value
    let email = document.getElementById("email").value
    let password1 = document.getElementById("Password1").value
    let password2 = document.getElementById("Password2").value
    let type1 = document.getElementById("btncheck1").checked
    let type2 = document.getElementById("btncheck2").checked
    let type3 = document.getElementById("btncheck3").checked
    
    let num;
    if(type1) num =0;
    if(type2) num=1;
    if(type3) num=2
    let token = localStorage.getItem("Token")

    console.log(Fname,Lname,email,password1,password2,type1,type2,type3,num,token);
    if(password1 !== password2){
        swal({
            title: "Not same Passwords",
            icon: "error",
        });
        return
    }

    let Response = await fetch('/api/User', {
        method: 'POST',
        headers:{
            "x-token":token,
            "x-auth": "23423",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name":Fname+" "+Lname,
            "email": email+"@iteso.mx",
            "password" : password1,
            "userType": num
        })
    })
    let data = await Response.json()
    if(data.error){
        swal({
            title: data.error,
            icon: "error",
            
        });
    }else{
        swal({
            title: `Success status: ${Response.status} `,
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





async function EliminateUser(email){
    let token =localStorage.getItem("Token")
    swal({
        title: "Are you sure?",
        text: `You want to delete ${email}?`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then(async(willDelete) => {
        if (willDelete) {
            let response = await fetch('/api/User/'+email, {
            method: 'DELETE',
            headers: {
                "x-token":token,
                "x-auth": "23423",
            }
        })
        list()
          swal("The User has been deleted!", {
            icon: "success",
          });
        } else {
          swal("Not deleted");
        }
      });
}

function changePassword(email){
    swal({
        title: `whats the new passwor for ${email}?`,
        icon: "info",
        content: {
            element: "input",
            attributes: {
                placeholder: "Enter new password",
                type: "password", // Optionally specify the input type,
            }
        },
        buttons: true,
    })
      .then(async (selected) => {
        if (selected) {
            console.log(selected)
            if(selected){
                addItem()
            }else{
                swal({
                    title: "Pasword not writen",
                    icon: "error",
                    
                });
            }
        } 
        else {
          swal({
            title: "No Password change",
            icon: "info",
        });
        }
      });
}


