async function findCourses(User, classname=""){
    let classRoute = '/api/Class' + classname? '?name=' + classname: '';
    let classes = await fetch(classRoute, {
        method: 'GET',
        });
    console.log(classes);
}

findCourses("user");