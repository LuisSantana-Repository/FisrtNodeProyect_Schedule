/* What to do in here:
- Schedules: 
    - Ability to browse user Schedules: Completed
        - Display current schedule on the calendar: Completed
            TODO: - Each block displays course information and allows to leave the course: Pending
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
    findCourses(); // refresh addCourse modal
    showSchedule(schedule); // refresh schedule
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
        showSchedule(schedule);
    }
    else {
        render("No schedule selected", "scheduleName"); 
        render("Course list: If you wish to add a course to your schedule, make shure to select your schedule first.", "addCourseModalTitle");
    }
    findCourses();
}

async function showSchedule(schedule){
    let request = await fetch('http://localhost:3001/api/Schedule?name=' + schedule, {
        method: 'GET',
    });
    let result = await request.json();
    // console.log(result[0].Courses);
    cleanTable();
    for (let c of result[0].Courses){
        console.log(c);
        for (let i=0; i<c.days.length; i++){
            if (c.days=="Thursday") c.days[i][0] == "H";
            let id = c.days[i][0] + c.time[i][0] + c.time[i][1] + c.time[i][6] + c.time[i][7];
            // console.log(id);
            let info = c.classID.name + "<br> "+ c.classroomID.building + "-" + c.classroomID.number;
            let html = /* html */ `<a  href="#" class="mt-1" data-bs-toggle="modal" data-bs-target="#courseInformation" onclick="loadCourseInformation('${c}')">${info}</a>`
            render(html, id);
        }
    }
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

function cleanTable(){
    let html = `<table class="table table-bordered text-center">
    <thead class="table-primary">
        <tr class="bg-light-gray">
            <th class="text-uppercase">Time
            </th>
            <th class="text-uppercase">Monday</th>
            <th class="text-uppercase">Tuesday</th>
            <th class="text-uppercase">Wednesday</th>
            <th class="text-uppercase">Thursday</th>
            <th class="text-uppercase">Friday</th>
            <th class="text-uppercase">Saturday</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="align-middle">07:00-09:00</td>
            <td id="M0709"></td>
            <td id="T0709"></td>
            <td id="W0709"></td>
            <td id="H0709"></td>
            <td id="F0709"></td>
            <td id="S0709"></td>
        </tr>
        <tr>
            <td class="align-middle">09:00-11:00</td>
            <td id="M0911"></td>
            <td id="T0911"></td>
            <td id="W0911"></td>
            <td id="H0911"></td>
            <td id="F0911"></td>
            <td id="S0911"></td>
        </tr>
        <tr>
            <td class="align-middle">11:00-13:00</td>
            <td id="M1113"></td>
            <td id="T1113"></td>
            <td id="W1113"></td>
            <td id="H1113"></td>
            <td id="F1113"></td>
            <td id="S1113"></td>
        </tr>
        <tr>
            <td class="align-middle">13:00-15:00</td>
            <td id="M1315"></td>
            <td id="T1315"></td>
            <td id="W1315"></td>
            <td id="H1315"></td>
            <td id="F1315"></td>
            <td id="S1315"></td>
        </tr>
        <tr>
            <td class="align-middle">16:00-18:00</td>
            <td id="M1618"></td>
            <td id="T1618"></td>
            <td id="W1618"></td>
            <td id="H1618"></td>
            <td id="F1618"></td>
            <td id="S1618"></td>
        </tr>
        <tr>
            <td class="align-middle">18:00-20:00</td>
            <td id="M1820"></td>
            <td id="T1820"></td>
            <td id="W1820"></td>
            <td id="H1820"></td>
            <td id="F1820"></td>
            <td id="S1820"></td>
        </tr>
        <tr>
            <td class="align-middle">20:00-22:00</td>
            <td id="M2022"></td>
            <td id="T2022"></td>
            <td id="W2022"></td>
            <td id="H2022"></td>
            <td id="F2022"></td>
            <td id="S2022"></td>
        </tr>
    </tbody>
</table>`
    render(html, "scheduleTable")
}

function render(html, elementID){
    document.querySelector(`#${elementID}`).innerHTML = html;
}

scheduleList();
setSchedule();
cleanTable();
