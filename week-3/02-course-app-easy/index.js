const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
function adminAuthentication(req,res,next){
  const username = req.headers.username;
  const password = req.headers.password;
  let admin=0;
  for(let i=0;i<ADMINS.length;i++){
    if(ADMINS[i].username===username){
      if(ADMINS[i].password===password){
        admin=1;
      }
    }
  }
  if(admin===1){
    next();

  }
  else{
    res.status(403).json({message:"Admin authentication failed"});

  }
}
function userAuthentication(req,res,next){
  const username = req.headers.username;
  const password = req.headers.password;
  const admin=USERS.find(a => a.username === username && a.password === password);
  if(admin){
    next();

  }
  else{
    res.status(403).json({message:"User authentication failed"});
  }
}
// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin={
    username:req.headers.username,
    password:req.headers.password
  }
  const username=admin.username;
  const exsistingAdmin=ADMINS.find(a => a.username === username)
  if(exsistingAdmin){
    res.status(403).json({message:"Admin already exsists"});
  }
  else{
    ADMINS.push(admin);
    res.status(201).json({message:"Admin created succesfully"});

  }
  // logic to sign up admin

});

app.post('/admin/login', adminAuthentication,(req, res) => {
  res.json({message:"Logged in successfully"})
  // logic to log in admin
});

app.post('/admin/courses', adminAuthentication,(req, res) => {
  // logic to create a course
  const admin=req.body;
  admin.id=Date.now();
  COURSES.push(admin)
  res.json({ message: 'Course created successfully', courseId: admin.id });
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', adminAuthentication,(req, res) => {
  res.json({courses:COURSES});

  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  let user={
    username:req.headers.username,
    password:req.headers.password,
  };
  const exsistingAdmin=USERS.find(a => a.username === user.username)
  if(exsistingAdmin){
    res.status(403).json({message:"User already exsists"});
  }
  else{
    USERS.push(user);
    res.status(201).json({message:"User created succesfully"});

  }
  // logic to sign up user
});

app.post('/users/login', userAuthentication,(req, res) => {
  res.json({message:"User loged in successfully."})
  // logic to log in user
});

app.get('/users/courses', userAuthentication,(req, res) => {
  let publishedCourses=[]
  for(let i=0;i<COURSES.length;i++){
    if(COURSES[i].published === true){
      publishedCourses.push(COURSES[i]);
    }
  }
  res.json({publishedCourses:publishedCourses})
  // logic to list all courses
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    const user=USERS.find(u=> u.username===req.headers.username);
    user.purchasedCourses=user.purchasedCourses || [];
    user.purchasedCourses.push(course);

    res.json({ message: 'Course purchased successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
})

app.get('/users/purchasedCourses', (req, res) => {
  let x=USERS.find(u=> u.username===req.headers.username);
  res.json({PurchasedCourses:x.purchasedCourses})
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
