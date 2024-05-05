/* What to do in here:
- Create Schedule button
- Add Course:
    - Finding courses depending on search:
        - Disabling button based on schedule compatibility, requirements or already having the class
- Ability to browse user Schedules and display them */


async function findCourses(User="", schedule="", classname=""){
    let classRoute = 'http://localhost:3001/api/Class';
    if (classname) classRoute+= '?name=' + classname;
    let request = await fetch(classRoute, {
        method: 'GET',
        });
    let classes = await request.json();
    // console.log(classes)
    let html ="";
    for (let c of classes.users){
        // console.log(c.name)
        html += /*html*/ `<div class="accordion accordion-flush" id="${c._id}">
        <div class="accordion-item">
            <h2 class="accordion-header" id="flush-headingOne">
                <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-${c._id}"
                    aria-expanded="true"
                    aria-controls="flush-collapseTwo"
                >
                    ${c.name}
                </button>
            </h2>
            <div
            id="flush-${c._id}"
            class="accordion-collapse collapse"
            aria-labelledby="flush-headingOne"
            data-bs-parent="#${c._id}"
            >
                <div class="accordion-body">
                    <div class="class row">`
        request = await fetch('http://localhost:3001/api/Course?classID='+c._id, {
            method: 'GET',
            });
            let courses = await request.json();
            //console.log(courses);
            for (let course of courses){
                // console.log(course);
                let available = "";
                request = await fetch('http://localhost:3001/api/Schedule/available', {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "name": schedule,
                        "_id": course._id
                    })});
                let fits = await request.json();
                if (fits.error) available = "disabled";
                html += /*html*/ `<ul
                class="list-group list-group-horizontal"
                >
                <li class="list-group-item">${course._id}</li>
                <li class="list-group-item">${course.professorName}</li>
                <li class="list-group-item">`
                for (let i=0; i<course.days.length; i++){
                    html+=`<p>${course.days[i]}: <br>${course.time[i]}</p>`
                }
                html += /*html*/ `</li><li class="list-group-item"><div class="d-grid gap-2">
                    <button
                        type="button"
                        name=""
                        id=""
                        class="btn btn-success"
                        onclick="addCourse('${schedule, course._id}')"
                        ${available}
                    >
                        Inscribe
                    </button>
                </div>
                </li>
                </ul>`
            }
            html+=`</div>
            </div>
            </div>
            </div>
            </div>`
        }
    // console.log(html);
    render(html, 'searchResults');
}

async function addCourse(schedule, courseID){
    await fetch('http://localhost:3001/api/Schedule', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": schedule,
            "_id": courseID
        })});
}

function render(html, elementID){
    document.querySelector(`#${elementID}`).innerHTML = html;
}

findCourses() 
