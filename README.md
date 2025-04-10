# 5Sum

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/bbm384-25/5sum.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.com/bbm384-25/5sum/-/settings/integrations)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

---

## Name

SumFood

## Description

Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges

On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals

## Installation

Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage

Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## API Usage

Base URL: http://localhost:8080/

### Register

#### Register Customer

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

## Authors and acknowledgment

Show your appreciation to those who have contributed to the project.

## License

For open source projects, say how it is licensed.

## Project status

If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
