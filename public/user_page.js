

async function getMe(){
        let request = await fetch('/api/User/getme', {
            method: 'GET',

        })
        let data = await request.json()
        let type = ""
        switch (data.userType) {
            case 1:
                type='Profesor'
                break;
            case 0:
                type='Student'
                break;
            case 2:
                type='Admin'
                break;
            default:
                break;
        }
        console.log(data)
        let html = /*html*/`
            <div class="container">
        <div class="main-body" >
            <div class="row gutters-sm">
                <!-- User Information Card -->
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex flex-column align-items-center text-center">
                                <div class="mt-3">
                                    <h4>${data.name}</h4>
                                    <p class="text-secondary mb-1">${type}</p>
                                    <!-- Button trigger modal for password change -->
                                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#passwordModal">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
        document.getElementById('main').innerHTML= html

}


async function newPassword(){
    event.preventDefault()
    let old = document.getElementById('current-password').value
    let newpass = document.getElementById('new-password').value
    let confirm = document.getElementById('confirm-password').value
    if (newpass !== confirm) {
        Swal.fire({
            title: "Not same Password",
            icon: "error",
        });
        return;
    }
    let Response = await fetch('/api/User/Password/test', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "old":old,
            "password": newpass,
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

getMe()