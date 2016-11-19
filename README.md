#PERIZIE - using mean stack

##INSTALLATION INSTRUCTIONS
1. Download the git repository;
2. Navigate to the ```server``` directory in the ```perizie_mean``` directory;
3. Run ```npm install pdf2json```, run ```npm install```;
4. Eventually run ```bower install angular-sanitize --save``` and other libraries;
5. Run ```node app.js```;
6. Point your browser to ```http://localhost:3000```.

###ADD USER
~~~~
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"username": "test@test.com", "password": "test"}' http://localhost:3000/user/register
~~~~

###INSPECT DATABASE
* `mongo`
* `use perizie_mean`
* `db.collection.find()`

###TODO
* print error when trying to upload a file to the collection that already exists (file server/api.js) (maybe use flash error or validate in model)
* print error when trying to upload a file with incorrect address -> undefined longitude and latitude -> insert GPS coordinates


