async function redirect(){
    event.preventDefault();
    let name = document.getElementById('name').value;
    let password = document.getElementById('password').value;
    console.log(name,password)
    let Response = await fetch('/api/login', {
        method: 'POST',
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "email": name,
            "password": password
        })
    })
    let data = await Response.json()
    if(data.error){
        swal({
            title: data.error,
            icon: "error",
            
        });
    }else{
        localStorage.setItem("Token", (data.token))
        window.location.href = (data.redirect)
    }
}