## Gohil Report

   REST API for [Gohil Report](http://www.gohilreport.com)  
   Made with Node.js and MongoDB  

#### HTTP endpoints  

##### /column
Method | Path | Auth | Req. Body | Response
--- | --- | --- | --- | ---
GET | / | - | - | { left, center, right, alert }
GET | /:title | ✓ | - |  { articles, columnData, error }
GET | /ids | ✓ | - |  { columns, columnData, error }
POST | / | ✓ | { title }| { saved, column, message }
PATCH | / | ✓ | { id, title } | { column }
DELETE | / | ✓ | { id } | { deleted, message }

##### /article
Method | Path | Auth | Req. Body | Response
--- | --- | --- | --- | ---
GET | /:id | ✓ | - | { article }
POST | / | ✓ | { title, url, image, position, column } | { createdArticle, articleSaved }
POST | /archive |  ✓ | { id } | { archived, message, error }
PATCH | / | ✓ | { id, title, url, image   } | { status }
PATCH | /switch | ✓ | { selectedId, moveToId } | { status }
PATCH | /removeimage | ✓ | { id } | { status }
PATCH | /archive/unarchive | ✓ | { id } | { unarchived }
DELETE | /:id | ✓ | - | { deleted, log }

##### /user
Method | Path | Auth | Req. Body | Response
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

#### Configure Server
Requiremnts:
* NodeJS
* MongoDB  

add config file: `server/config.json`  

```javascript
{
    "development": {
      "PORT": 8000,
      "MONGODB_URI": "mongodb://mongo:27017/gReport",
      "jwtSecret": "jwtSecret"
    },
    "test": {
      "PORT": 8080,
      "MONGODB_URI": "mongodb://localhost:27017/gReportTest",
      "jwtSecret": "jwtSecretTest"
    }
}
```  

Run local server:  
Windows  
```
npm start
```

Linux / Mac  
```
npm run linux-start
```  

___

#### Testing

Local Server  
Windows
```
npm run test-watch
```

Linux / Mac  
```
npm run linux-test
```  
___

##### TODO
- [ ] Complete [management system](https://github.com/hitesh-92/gohilReportManager) with Angular ( priority )
- [ ] Remove and refactor anonymous functions where appropriate ( easier debug )
- [ ] Add GraphQL
- [ ] Add in logger ( monitor activity )
- [ ] Set up inital db structure ( migration )
- [ ] Duplicate database folders /db & /mongo. Merge and reformat dockerfile
