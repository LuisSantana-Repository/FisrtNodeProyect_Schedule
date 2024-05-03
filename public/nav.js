async function logOut(){
    let Response = await fetch('/api/login/logout', {
        method: 'GET',
    })
    let data = await Response.json()
    if(data.error){
        swal({
            title: data.error,
            icon: "error",
        });
    }else{
        window.location.href = (data.redirect)
    }
}


async function Redirect(){
    let Response = await fetch('/api/login/Redirect', {
        method: 'GET',
    })
    let data = await Response.json()
    if(data.error){
        swal({
            title: data.error,
            icon: "error",
        });
    }else{
        //console.log(data)
        window.location.href = (data.redirect)
    }
}