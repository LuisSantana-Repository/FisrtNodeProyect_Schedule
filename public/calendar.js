/* What to do in here:
- Schedules: 
    - Ability to browse user Schedules: Completed
        - Display current schedule on the calendar: Completed
            - Each block displays course information and allows to leave the course: Complete
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
    let classRoute = '/api/Class';
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
                    onclick="displayCourses('${c._id}', '${schedule}')"
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
                    <div class="class row" id="classRow${c._id}">`
            html+=`</div>
            </div>
            </div>
            </div>
            </div>`
        } 
    // console.log(html);
    render(html, 'searchResults');
}

async function displayCourses(classID, schedule){
    // console.log(classID, schedule)
    if (schedule) {
        let html =""
        request = await fetch('/api/Course?classID='+classID, { //--------
            method: 'GET',
            });
            let courses = await request.json();
            //console.log(courses);
            for (let course of courses){
                // console.log(course);
                let available = "";
                let info ="";
                request = await fetch('/api/Schedule/available', {
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
                    // console.log("Course disabled because: ", fits.error);
                    info += "Course disabled because: " + fits.error;
                }
                html += /*html*/ `<ul
                class="list-group list-group-horizontal mt-1"
                >
                <li class="list-group-item">CourseID: <br> ${course._id}</li>
                <li class="list-group-item">Professor: <br> ${course.professorName}</li>
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
                        data-bs-dismiss="modal"
                        onclick="addCourse('${schedule}', '${course._id}')"
                        ${available}
                    >
                        Inscribe
                    </button><p>${info}</p>
                </div>
                </li>
                </ul>`
            }
        render(html, "classRow"+classID);
    }
}

async function addCourse(schedule, courseID){
    // console.log("adding course")
    let res = await fetch('/api/Schedule', {
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
    let request = await fetch('/api/Schedule', {
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
    let request = await fetch('/api/Schedule?name=' + schedule, {
        method: 'GET',
    });
    let result = await request.json();
    // console.log(result[0].Courses);
    cleanTable();
    for (let c of result[0].Courses){
        console.log(c);
        for (let i=0; i<c.days.length; i++){
            let id = c.days[i] + c.time[i][0] + c.time[i][1] + c.time[i][6] + c.time[i][7];
            // console.log(c.days[i], c.days[i]=="Thursday", id);
            let info = c.classID.name + "<br> "+ c.classroomID.building + "-" + c.classroomID.number;
            let html = /* html */ `<a  href="#" class="mt-1" data-bs-toggle="modal" data-bs-target="#courseInformationModal" onclick="loadCourseInformation('${c._id}')">${info}</a>`
            render(html, id);
        }
    }
}

async function loadCourseInformation(id){
    render(id, "courseInformationTitle");
    let request = await fetch('/api/Course?_id=' + id, {
        method: 'GET',
    });
    let course = await request.json();
    // console.log(course[0]);
    course = course[0];
    let html = /* html */ `
    <h4>Class: ${course.classID.name}</h4>
    <h5>Professor: ${course.professorName}</h5>
    <div
        class="table-responsive-lg"
    >
        <table
            class="table table-hover" style="text-align: center;"
        >
            <thead class="table-primary">
                <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Classroom</th>
                    <th scope="col">Time</th>
                </tr>
            </thead>
            <tbody>`
    for (let i=0; i<course.days.length; i++){
        html += `
        <tr class="">
            <td scope="row">${course.days[i]}</td>
            <td>${course.classroomID.building + "-" + course.classroomID.number}</td>
            <td>${course.time[i]}</td>
        </tr>`
    }
    html += ` </tbody>
        </table>
    </div>
    `
    render(html, "courseInformation");
    let button = /*html */`<button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="leaveCourse('${course._id}', '${course.classID.name}')">Leave Course</button>`
    render(button, "leaveCourseButton");
}

function leaveCourse(id, name){
    let schedule = currentSchedule();
    console.log(id, name, schedule);
    swal({
        title: "Are you sure you want to leave the course: " + name ,
        icon: "warning",
        buttons: ["Cancel", "Yes"],
    }).then(async c=>{
        if (c) {
            await fetch('/api/Schedule', {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "name": schedule,
                        "_id": id
            })});
            showSchedule(schedule);
            findCourses();
            swal({
                title: name + " has been deleted from " + schedule,
                icon: "success",
            })
        }
    })
}

async function createSchedule(){
    let name = document.querySelector('#createScheduleBar').value;
    let request = await fetch('/api/Schedule', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": name,
    })});
    let result = await request.json();
    if (result.error) {
        render(result.error, 'createScheduleResults');
        if (result.error=="jwt expired") window.location.href = 'index.html';
    }
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
                await fetch('/api/Schedule', {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "name": schedule,
                })});
                setSchedule();
                scheduleList();
                showSchedule();
                swal({
                    title: schedule + " has been deleted",
                    icon: "success",
                })
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
            <td id="Monday0709"></td>
            <td id="Tuesday0709"></td>
            <td id="Wednesday0709"></td>
            <td id="Thursday0709"></td>
            <td id="Friday0709"></td>
            <td id="Saturday0709"></td>
        </tr>
        <tr>
            <td class="align-middle">09:00-11:00</td>
            <td id="Monday0911"></td>
            <td id="Tuesday0911"></td>
            <td id="Wednesday0911"></td>
            <td id="Thursday0911"></td>
            <td id="Friday0911"></td>
            <td id="Saturday0911"></td>
        </tr>
        <tr>
            <td class="align-middle">11:00-13:00</td>
            <td id="Monday1113"></td>
            <td id="Tuesday1113"></td>
            <td id="Wednesday1113"></td>
            <td id="Thursday1113"></td>
            <td id="Friday1113"></td>
            <td id="Saturday1113"></td>
        </tr>
        <tr>
            <td class="align-middle">13:00-15:00</td>
            <td id="Monday1315"></td>
            <td id="Tuesday1315"></td>
            <td id="Wednesday1315"></td>
            <td id="Thursday1315"></td>
            <td id="Friday1315"></td>
            <td id="Saturday1315"></td>
        </tr>
        <tr>
            <td class="align-middle">16:00-18:00</td>
            <td id="Monday1618"></td>
            <td id="Tuesday1618"></td>
            <td id="Wednesday1618"></td>
            <td id="Thursday1618"></td>
            <td id="Friday1618"></td>
            <td id="Saturday1618"></td>
        </tr>
        <tr>
            <td class="align-middle">18:00-20:00</td>
            <td id="Monday1820"></td>
            <td id="Tuesday1820"></td>
            <td id="Wednesday1820"></td>
            <td id="Thursday1820"></td>
            <td id="Friday1820"></td>
            <td id="Saturday1820"></td>
        </tr>
        <tr>
            <td class="align-middle">20:00-22:00</td>
            <td id="Monday2022"></td>
            <td id="Tuesday2022"></td>
            <td id="Wednesday2022"></td>
            <td id="Thursday2022"></td>
            <td id="Friday2022"></td>
            <td id="Saturday2022"></td>
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
