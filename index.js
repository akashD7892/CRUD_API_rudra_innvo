const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors');
require('./db/db')
const User = require('./db/User');
const app = express() ;
var jwt = require('jsonwebtoken') ;
const { body, validationResult } = require('express-validator')

//secret token
const JWT_SECRET = 'Akashdubey@12#' ;
const port = 5000 ;

app.use(cors());

const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended:false }));
app.set('view engine', 'ejs');

app.use(express.json());

// ROUTE 1 : Create a user using: POST : Register
 
app.post('/register',[

    body('name', 'Enter valid name' ).isLength({min:3}),
    body('email', 'Enter valid email' ).isEmail(),
    body('password', 'Enter valid password' ).isLength({min:5})

    ] , async(req, resp) => {
    
    // validate the user 
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        return resp.status(400).json({error:errors.array() });
    }
    
    //check user with email exist already 
    let user  = await User.findOne( {email:req.body.email})
    if( user ) {
        return resp.status(400).json({error:"Sorry user exist"})
    }

    // otherwise save
    user  = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    })
    
    const payload = {
        user:{
            id:user.id
        }
    }
    const authtoken = jwt.sign( payload, JWT_SECRET)
    
    resp.send(`User Id copy that to check the delete API ${user.id}`) ;
    

    })

// ROUTE 2: Authenticate a user : POST Login

app.post('/login',[

    body('email', 'Enter valid email' ).isEmail(),
    body('password', 'Enter valid password' ).isLength({min:5})

    ] , async(req, resp) => {
    
    // if error , return error
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        return resp.status(400).json({error:errors.array() });
    }

    const { email, password } = req.body ;

    try{
      // check whether such email exist in database or not
      let user = await User.findOne( {email}) ;
      if( !user ) {
        return resp.status(400).json({error:"Wrong credentials"})
      }

      //check password
      const pass_compare = password === user.password ? 1 : 0;

      if( !pass_compare ){
        return resp.status(400).json({error:"Sorry incorrect credentials exist"})
      }

      const data = {
        user:{
            id:user.id
        }
    }
    const authtoken = jwt.sign( data, JWT_SECRET) ;
    resp.send("Welcome");

    }
    catch (error) {
       console.error(error.message) ;
       resp.status(500).send("Internal server error");
    }

    })

    // Route 3 : Forget Password : 

    app.get('/forget-password', ( req, resp, next) => {
     
     //this would send a page to get email  
     resp.render('forget-password');
    })

    // to check entered email valid or not
    app.post('/forget-password', async( req, resp) => {
        const { email } = req.body ;

        const secret = JWT_SECRET + User.password ;
        const payload = {
            email: req.body,
            id:User.id
        }
        const token = jwt.sign( payload, secret, {expiresIn:'10m'})
        const link = `http://localhost:5000/reset-password/${User.id}/${token}` ;
        
        console.log(link);
        resp.send(`Click on the link to reset :::<a href=${link}>Link</a>`);
    })
    
    // to Reset Password

    app.get('/reset-password/:id/:token', ( req, resp) => {
    
     //to enter new password  
     resp.render('reset-password');
    })
    
    app.post('/reset-password/:id/:token', async(req, resp) => {

        //save the changes
        const result = await User.updateOne(
        { id: req.params.id },
        { $set: {password:req.body.password} }
        )
        resp.send("succesful");
      });

    // Route 4 : Edit Password

    app.put('/change-password', async(req, resp) => {
        
        const result = await User.updateOne(
        { email: req.body.email },
        { $set: req.body }
        )
        resp.send("succesful");
      });

    // Route : Delete 

    app.delete('/delete/:id', async(req,resp) => {
        const result = await User.deleteOne(
            { _id: req.params.id }
            
        )
        console.log(result) ;
        resp.send("Deleted");
    })

app.listen( port, () => {
    console.log("Succesful")
})
