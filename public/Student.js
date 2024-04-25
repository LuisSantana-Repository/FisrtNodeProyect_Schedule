function completedHTML(u){
    let html = /*html*/`
        <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-primary">
                        ${u.name}
                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="Class 1 Completed" checked disabled>
        </li>
    `
    console.log(html)
    return html
}
function PassingHTML(u){
    let html = /*html*/`
        <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-warning">
                ${u.name}
                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="Class 2 In Progress" onclick="updatePassing('${u._id}')">
                    </li>
    `
    console.log(html)
    return html
}
function AvailableHTML(u){
    let html = /*html*/`
    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${u.name}
                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="Class 3 Not Started" onclick="updateAvailable('${u._id}')">
                    </li>
    `
    console.log(html)
    return html

}


//make soo that it is elimintated from schedule and passed from Passing to Acepted
async function updatePassing(u){

}
async function updateAvailable(u){
    let token = null;
    let email = 'angelsantana@iteso.mx';
    let request = await fetch('api/User/'+email,{
        method:"PUT",
        headers:{
            "x-token":token,
            "x-auth": "23423",
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            "ClassID":u
        })
    }
    )

    makechecks(email)
}


async function makechecks(email){
    let token = null;
    let request = await fetch('/api/User/'+email, {
        method: 'GET',
        headers:{
            "x-token":token,
            "x-auth": "23423",
        }
    })
    let data = await request.json()
    
    let html = data.Completed.map(u => completedHTML(u)).join('')
    console.log(html)
    html += data.Passing.map(u => PassingHTML(u)).join('')
    console.log(html)
    html += data.Available.map(u => AvailableHTML(u)).join('')

    document.getElementById("List").innerHTML= html;

}

makechecks('angelsantana@iteso.mx');