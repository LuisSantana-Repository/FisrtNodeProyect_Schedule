/* What to do in here:
- Schedules: 
    - Ability to browse user Schedules: Complete
    TODO: - Display current schedule on the calendar: Pending
            - Each block displays course information and allows to leave the course: Pending
    - Create Schedule button: Completed
    - Delete Schedule button: Completed
- Add Course: Almost Complete
    - Finding courses depending on search: Completed
        - Disabling button based on schedule compatibility, requirements or already having the class: Completed
            - Obtain current schedule: Completed
- Fixed-Issue, the server crashes after adding a course: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client, after restarting the server, the course was properly added to the schedule: Solved, it was a backend error
*/


async function findCourses(){
    let schedule = currentSchedule();
    if (schedule) render("Add course to " + schedule, "addCourseModalTitle");
    // console.log(schedule); 
    let classname = sendName();
    let classRoute = 'http://localhost:3001/api/Class';
    if (classname) classRoute+= '?name=' + classname;
    // console.log(classRoute);
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
                if (fits.error) {
                    available = "disabled";
                    console.log("Course disabled because: ", fits.error);
                }
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
                        onclick="addCourse('${schedule}', '${course._id}')"
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
    // console.log("adding course")
    let res = await fetch('http://localhost:3001/api/Schedule', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": schedule,
            "_id": courseID
        })});
    // console.log(await res.json())
    findCourses();
    // swal
    swal({
        title: 'Course successfully added to your schedule',
        icon: 'success'
    });
}

function sendName(){
    // event.preventDefault();
    let classname = document.querySelector('#searchBar').value;
    // sessionStorage.setItem("classname", JSON.stringify(classname));
    // console.log(classname);
    return classname;
}

function currentSchedule(){
    return JSON.parse(sessionStorage.getItem('currentSchedule'));
}

async function scheduleList(){
    let request = await fetch('http://localhost:3001/api/Schedule', {
        method: 'GET',
        });
    let userSchedules = await request.json();
    // console.log(userSchedules);
    let html = ""
    for (let schedule of userSchedules){
        html += /*html*/ `<a  href="#" class="mt-1" onclick="setSchedule('${schedule}')" data-bs-toggle="collapse"
        data-bs-target="#flush-collapseOne"><li class="list-group-item">${schedule}</li></a>`
    }
    render(html, 'scheduleList')
}

function setSchedule(schedule=""){
    sessionStorage.setItem("currentSchedule", JSON.stringify(schedule));
    if (schedule) {
        render("Current schedule: " + schedule, "scheduleName");
        render("Add course to " + schedule, "addCourseModalTitle");
    }
    else {
        render("No schedule selected", "scheduleName"); 
        render("Course list: If you wish to add a course to your schedule, make shure to select your schedule first.", "addCourseModalTitle");
    }
    findCourses();
    // show current schedule
}

async function createSchedule(){
    let name = document.querySelector('#createScheduleBar').value;
    let request = await fetch('http://localhost:3001/api/Schedule', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": name,
    })});
    let result = await request.json();
    if (result.error) render(result.error, 'createScheduleResults');
    else {
        render('Schedule successfully created', 'createScheduleResults');
        scheduleList();
        setSchedule(name);
    }
}

function deleteSchedule(){
    let schedule = currentSchedule();
    if (schedule){
        swal({
            title: "Are you sure you want to delete " + schedule ,
            icon: "warning",
            buttons: ["Cancel", "Yes"],
        }).then(async c=>{
            if (c) {
                swal({
                    title: schedule + " has been deleted",
                    icon: "success",
                })
                await fetch('http://localhost:3001/api/Schedule', {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "name": schedule,
                })});
                scheduleList();
                setSchedule();
            }
        })
    }
}

function render(html, elementID){
    document.querySelector(`#${elementID}`).innerHTML = html;
}

scheduleList();
setSchedule();
