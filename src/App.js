import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn:false,
    name:'',
    email:'',
    photo:'',
    password:'',
    
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignOut = ()=>{
    firebase.auth().signOut()
    .then(res=> {
      const signOutUser ={
        isSignedIn:false,
        name:'',
        email:'',
        photo:'',
        password:"",
        error:"",
        success:false


      }
      setUser(signOutUser)
      console.log(res)

    })
    .catch(err => console.log(err))
  }
  const handleSignIn = ()=>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser = {
        isSignedIn:true,
        name:displayName,
        photo:photoURL,
        email:email
      }
      setUser(signedInUser)
      
      console.log(displayName, photoURL, email)
    })
    .catch(err => {
      console.log(err);
      console.log(err.massage);

    })
  }
const handleFBLogin = () =>{
  firebase.auth().signInWithPopup(fbProvider)
  .then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
  const handleBlur = (e) =>{
    // debugger;
    let isFieldValid = true;
    
    // console.log(e.target.name, e.target.value);
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+.\S+/.test(e.target.value)
      console.log(isFieldValid)
    }
    if(e.target.name === "password"){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber =  /\d{1}/.test(e.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber
    }
    if(isFieldValid){
      // [...cart, newItem]
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
     setUser(newUserInfo)
    }

  }
  const handleSubmit = (e)=>{
    console.log(user.email , user.password)
   if (newUser && user.email && user.password){
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then(res => {
     const newUserInfo={...user};
     newUserInfo.error = "";
     newUserInfo.success =true
     setUser(newUserInfo)
     updateUserName(user.name)

    })
    .catch(error => {
      // Handle Errors here.
      const newUserInfo = {...user}
      newUserInfo.success =false;
      newUserInfo.error=error.message
     setUser(newUserInfo)
    });
   }
   if (!newUser && user.email && user.password){
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(res=>{
      const newUserInfo={...user};
     newUserInfo.error = "";
     newUserInfo.success =true
     setUser(newUserInfo)
     console.log("Sign in user info" , res.user)
    })
     .catch(error=> {
      const newUserInfo = {...user}
      newUserInfo.success =false;
      newUserInfo.error=error.message
     setUser(newUserInfo)
     
    });
   }

      e.preventDefault();
  }

  const updateUserName = name=>{
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
      // you can update more info
    }).then(()=> {
      console.log('user name updated successfully')
    }).catch(error => {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn?
        <button onClick={handleSignOut}>Sign out</button> :
        <button onClick={handleSignIn}>Sign in</button>
      }
      <br/>
      <button onClick={handleFBLogin}>log in using fb</button>
      {
        user.isSignedIn && 
        <div>
          <h1> welcome {user.name}</h1>
           <p>welcome your {user.email}</p>
           <img src={user.photo} alt=""/>
        </div>
      }

      <h1>Our own Authentication system</h1>
      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}
      <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">new user sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="your name" required/>}
        <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email address" required/>
       <br/>
       <input type="password" name="password" onBlur={handleBlur} placeholder="Your password" required/>
       <br/>
       <input type="submit" value={newUser? 'sign up' : 'sign in'}/>
      </form>
      <p style={{color:"red"}}>{user.error}</p>
      {user.success && <p style={{color:"green"}}>user {newUser ? "created" : "logged in"} successfully</p>}
    </div>
  );
}

export default App;
