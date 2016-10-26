#PERIZIE - using mean stack

##INSTRUCTIONS
1. Download the git repository
2. cd into the repository
3. ```cd``` into folder ```server```
4. ```npm install```
5. eventually run ```bower install angular-sanitize --save``` and other libraries
6. run ```node appp.js```
7. point your browser to ```http://localhost:3000```

##ADD USER
~~~~
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"username": "test@test.com", "password": "test"}' http://localhost:3000/user/register
~~~~

##INSPECT DATABASE
```mongo```
```use perizie_mean```
```db.collection.find()```
