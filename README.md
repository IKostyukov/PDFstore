# PDFstore

docker-compose up

App works on port 3000

End points:

POST api/user  -  create user
 first user with ADMIN role (default USER role)
    
    Body:
    {
    "firstName": "Test",
    "lastName": "Test",
    "email": "test@test.test",
    "password": "12G3dg&&4"
    }

POST api/auth/login - login with email and password 
 JWT token wil be returned
     
     Body:
    {
    "email": "test@test.test",
    "password": "12G3dg&&4"
    }

GET api/user/:uuid - retrieve single user

GET api/user - retrieve all users for ADMIN role

PATCH api/user/:uuid - update user, eg. add image field
    
    Body:
    {
    "image": "https://loremflickr.com/320/240/face/all"
    }

POST api/user/:uuid - create PDF and add it to the user
    
    Body:
    {
       "email": "test@test.test"
    }

PATCH api/user/admin/:uuid - set new user ADMIN role

Access to Data Base in browser on localhost:5050 via PgAdmin

    login: admin@admin.com
    password: pgadmin4

Then in the PgAdmin set connection to the DB
    
    name db : postgres
    user db : postgres
    password db : postgres
