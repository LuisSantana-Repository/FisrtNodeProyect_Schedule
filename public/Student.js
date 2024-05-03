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
function notAble(u){
    let html = /*html*/`
        <li class="list-group-item d-flex justify-content-between align-items-center bg-secondary">
            ${u.name}
            <input class="form-check-input me-1" type="checkbox" value="" aria-label="Class 3 not able" disabled>
        </li>
    `
    console.log(html)
    return html
}
function PassingHTML(u){
    let html = /*html*/`
        <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-warning">
                ${u.name}
                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="Class 2 In Progress" onclick="updateAvailable('${u._id}')">
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

async function updateAvailable(u){
    let request = await fetch('api/User/addAvailableClass',{
        method:"PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            "ClassID":u
        })
    }
    )

    makechecks()
}


async function makechecks(){
    let token = null;
    let request = await fetch('/api/User/classes', {
        method: 'GET',
        headers:{
            "x-token":token,
            "x-auth": "23423",
        }
    })
    let data = await request.json()
    
    let html = data.Completed.map(u => completedHTML(u)).join('')
    console.log(html)
    html += data.clasesInscribed.map(u => PassingHTML(u)).join('')
    console.log(html)
    html += data.Available.map(u => AvailableHTML(u)).join('')
    html += data.notIn.map(u=> notAble(u)).join('')
    document.getElementById("List").innerHTML= html;

}

makechecks();