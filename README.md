# SumFood by 5Sum

## Name

**SumFood**

## Description

SumFood is a web-based food delivery platform designed to connect customers with local restaurants for convenient food ordering and delivery as well as allowing users to help other users by buying them food. The platform will serve three main user types: customers, restaurants, and couriers.

## Project Structure

<summary><strong>sumfood_backend/</strong> - Java Spring Boot backend</summary>

| Path                                    | Description                    |
| --------------------------------------- | ------------------------------ |
| `src/main/java/com/sumfood/controller/` | REST API controllers           |
| `src/main/java/com/sumfood/service/`    | Business logic layer           |
| `src/main/java/com/sumfood/model/`      | Entity and DTO classes         |
| `src/main/java/com/sumfood/repository/` | Spring Data JPA repositories   |
| `src/main/resources/`                   | Application config & resources |
| `application.properties`                | Spring Boot configuration      |
| `pom.xml`                               | Maven project configuration    |

---

<summary><strong>sumfood_frontend/</strong> - React frontend</summary>

| Path              | Description                             |
| ----------------- | --------------------------------------- |
| `public/`         | Public static files                     |
| `src/components/` | Reusable UI components                  |
| `src/pages/`      | Page-level components                   |
| `src/App.js`      | Root component                          |
| `src/index.js`    | Entry point for React app               |
| `package.json`    | NPM dependencies & script configuration |

---

<summary><strong>Project Root</strong></summary>

| File/Folder          | Description                        |
| -------------------- | ---------------------------------- |
| `docker-compose.yml` | Docker multi-container setup       |
| `.env`               | Enviroment variables configuration |
| `README.md`          | Project documentation              |

## Used Technologies

|                                                              Technology Icon                                                               |  Technology Name   | Usage for                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------: | :----------------: | ---------------------------------------------------------------------- |
|        <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/git.png">         |        Git         | Local version control and history tracking                             |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/gitlab.png">       |       GitLab       | Remote repository hosting, CI/CD pipelines, and team collaboration     |
|        <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/java.png">        |        Java        | Backend development using object-oriented programming                  |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/spring.png">       |       Spring       | Dependency injection and building robust backend architecture          |
|    <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/spring_boot.png">     |    Spring Boot     | RESTful APIs, embedded server, and microservice setup                  |
|     <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/hibernate.png">      |     Hibernate      | ORM for mapping Java classes to database tables                        |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/maven.png">        |       Maven        | Project build automation and dependency management                     |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/react.png">        |       React        | Frontend development for building responsive UI                        |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/canva.png">        |       Canva        | UI/UX mockups and visual content creation                              |
|     <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postgresql.png">     |     PostgreSQL     | Relational database for storing user, order, and delivery data         |
|        <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/http.png">        |        HTTP        | Core protocol for communication between frontend and backend           |
|        <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/rest.png">        |        REST        | API design style for structured and scalable web service communication |
|      <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postman.png">       |      Postman       | Testing and documenting RESTful APIs                                   |
|       <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png">       |       Docker       | Containerization for backend, frontend, and database services          |
| <img height="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/visual_studio_code.png"> | Visual Studio Code | Code editor for both backend and frontend development                  |

## Installation

Follow the steps below to run the project locally:

### 1. Clone the repository

```bash
git clone https://gitlab.com/yourusername/sumfood.git
cd sumfood
```

### 2. Create and configure the `.env` file

```bash
cp .env .env
```

### 3. Start the full-stack application using Docker

```bash
docker-compose up --build
```

### 4. Access the app

Frontend: `http://localhost:3000`

Backend API: `http://localhost:8080`

## API Usage

Base URL: http://localhost:8080/

### Register

#### Register Customer

>>>>>>> origin/development
```http
POST /api/register/customer
```

| Parametre | Tip    | Açıklama      |
| :-------- | :----- | :------------ |
| `body`    | `JSON` | customer_data |

Example Data Structure:

```
{
  "email": "testuser3@example.com",
  "password": "12345678",
  "name": "Test",
  "lastName": "User",
  "phoneNumber": "5055055556"
}
```

Response:

```
{
    "id": 17,
    "createAt": "2025-04-10T19:42:41.730+00:00",
    "password": "$2a$10$4iAID2Mc9fv6CZNr9oT4kefz/CM1XE4RKgxFLGdyApJahtJUqUHtO",
    "username": "testuser3@example.com",
    "authorities": [
        {
            "authority": "ROLE_CUSTOMER"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true,
    "enabled": true
}
```

#### Register Courier

```http
POST /api/register/couirer
```

| Parametre | Tip    | Açıklama     |
| :-------- | :----- | :----------- |
| `body`    | `JSON` | courier_data |

Example Data Structure:

```
{
  "email": "testkurye1@example.com",
  "password": "12345678",
  "name": "Kurye",
  "lastName": "Test Kurye Soyisim",
  "phoneNumber": "5055055555",
  "driverLicenceId": "123456",
  "birthDate": "22-04-2004",
  "vehicleType": "BICYCLE"
}
```

Response:

```
{
    "id": 18,
    "createAt": "2025-04-10T19:44:18.523+00:00",
    "password": "$2a$10$4bh1NgcJfEHqU/wM7mTLFuCfM87JJNnwYKVVFEkWiJEho2KMFM8OW",
    "enabled": false,
    "username": "testkurye1@example.com",
    "authorities": [
        {
            "authority": "ROLE_COURIER"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

#### Register Restaurant

```http
POST /api/register/restaurant
```

| Parametre | Tip    | Açıklama        |
| :-------- | :----- | :-------------- |
| `body`    | `JSON` | restaurant_data |

Example Data Structure:

```
{
  "email": "restaurant@example.com",
  "password": "12345678",
  "name": "Yusuf",
  "lastName": "İpek",
  "phoneNumber": "5055555555",
  "taxIdentificationNumber": "123456",
  "bussinesName": "Five Sum Gıda İşletmeleri LTD ŞTİ",
  "displayName": "SumFood by 5Sum",
  "description": "Sum Food by FiveSum"
}

```

Response:

```
{
    "id": 25,
    "createAt": "2025-04-10T20:12:05.662+00:00",
    "password": "$2a$10$nT9EWTECROpQh6nVipuMpOuiixyNUBmFsD38MyQjtBniP/kqt6Zpa",
    "enabled": false,
    "username": "restaurant@example.com",
    "authorities": [
        {
            "authority": "ROLE_RESTAURANT"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

#### Add Food Item

```http
POST /api/food/item
```
Authorization: Bearer {jwt token}
Role: RESTAURANT

| Parametre | Tip    | Açıklama        |
| :-------- | :----- | :-------------- |
| `body`    | `JSON` | food_item_data |

Example Data Structure:

```
{
  "name": "test item",
  "description": "descccc",
  "price": 55.5,
  "stock": 5,
  "category": "PIZZA"
}

```

Response:

```
{
    "id": 1,
    "name": "test item",
    "description": "descccc",
    "price": 55.5,
    "stock": 5,
    "category": "PIZZA"
}
```





## Authors and acknowledgment

Show your appreciation to those who have contributed to the project.

| Name                 | Role                  | Github                                    | Linkedin                                                                 |
| :------------------- | :-------------------- | :---------------------------------------- | :----------------------------------------------------------------------- |
| Yusuf İpek           | Project Manager       | [Yusufpek](https://github.com/Yusufpek)   | [in/yusuf-ipek](https://www.linkedin.com/in/yusuf-ipek/)                 |
| Ümit Sevinçler       | Analyst               | [dnaux](https://github.com/dnaux)         | [in/umit-sevincler](https://www.linkedin.com/in/umit-sevincler/)         |
| Toprak Güngör        | Configuration Manager | [Toprak](https://github.com/b2210356037)  | [in/toprak-gungor](https://www.linkedin.com/in/toprak-gungor/)           |
| Kerem Berkehan Pınar | Architect             |                                    [KeremBerkehan](https://github.com/KeremBerkehan)       | [in/keremberkehanpinar](https://www.linkedin.com/in/keremberkehanpinar/) |
| Berke Yusuf Uğurlu   | Tester                | [berkecore](https://github.com/berkecore) | [in/berkecore](https://www.linkedin.com/in/berkecore/)                   |

## License

For open source projects, say how it is licensed.

## Project status

Development int progress

