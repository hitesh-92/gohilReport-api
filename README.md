## Gohil Report

   REST API for [Gohil Report](http://www.gohilreport.com)  
   Made with Node.js and MongoDB  

#### HTTP endpoints

##### /column/
Method | Endpoint | Auth | Req. Body | Response
--- | --- | --- | --- | ---
GET | / | - | - | { left, center, right, archive, alert }
GET | /single | - | { title } |  { articles }
POST | / | ✓ | { title }| { createdColumn }
PATCH | / |  ✓ | { column, id } | { column }
DELETE | / |  ✓ | { title } | { deleted, message }

##### /article/
Method | Endpoint | Auth | Req. Body | Response
--- | --- | --- | --- | ---
GET | /single/:id |  ✓ | { id } | { article }
GET | /archive |  ✓ | { id } | { archives }
POST | / |  ✓ | { title, url } | { createdArticle, articleSaved }
POST | /archive |  ✓ | { id } | { archived }
PATCH | / |  ✓ | { id, title || url   } | { oldArticle, status }
PATCH | /switch |  ✓ | { selected, moveTo } | { status }
DELETE | / |  ✓ | { id } | { deleted, log }

##### /user/
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
POST | /signup | - | { email, password } | { email, added }
POST | /login | - | { email, password } | { loggedIn, token }

___

#### Docker

Run from gohilReport-api/
```
docker-compse up --build
```

* API:            localhost:8000
* Mongo-Expess:   localhost:8081

Access mongo express through web browser  

#### Configure Local Server
Requiremnts:
* NodeJS
* MongoDB

add config file: `server/config.json`
```javascript
{
    "development": {
      "PORT": 8000,
      "MONGODB_URI": "mongodb://localhost:27017/gReport",
      "jwtSecret": "jwtSecret"
    },
    "test": {
      "PORT": 8080,
      "MONGODB_URI": "mongodb://localhost:27017/gReportTest",
      "jwtSecret": "jwtSecretTest"
}
```

Run local server:
( windows )
```
npm start
```

( Linux / Mac )
```
npm run linux-start
```

___

#### Testing

Local Server
( Windows )
```
npm run test-watch
```

( Linux / Mac )
```
npm run linux-test
```

Docker
`TODO`

___

##### TODO
- [ ] ! restructure /article/single to take param of title. request body not allowed in GET
- [ ] Complete [management system](https://github.com/hitesh-92/gohilReportManager) with Angular ( priority )
- [ ] Remove and refactor anonymous functions where appropriate ( easier debug )
- [ ] Add admin user
- [ ] Update ReadMe HTTP routes
- [ ] Add option to attach image link to article log
- [ ] Update article log patch to allow for image url edits
- [ ] Add GraphQL
- [ ] Add in logger ( monitor activity )
- [ ] Set up inital db structure ( migration )
- [ ] refactor controller/articleLog.js-function:updateArticle id=null. respond with error
- [ ] refactor controller/column.js-function:deleteColumn request accepts title. change to id
