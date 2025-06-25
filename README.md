🛒 Multi-Vendor Marketplace API (NestJS)
I'm excited to share a backend project I just completed using NestJS!
It’s a multi-vendor marketplace API, similar to platforms like Amazon or Jumia — built to showcase my skills in backend development.

🔧 Core Features:
🔐 JWT Authentication with role-based access (Vendor & Customer)

🛍️ Product listing and store management for vendors

🛒 Cart system and order creation for customers

🔎 Search and filtering of products

📦 Clean architecture using modules, services, DTOs, guards, and global exception filters

💬 Real-time Chat System:

1. Simple WebSocket-based messaging system
2. Vendors and Customers can chat 1:1
3. Real-time status updates when users join or leave

⚠️ I intentionally left out payments and admin functionality for now, focusing instead on API design, scalability, and best practices.

💡 Why I Built It
I wanted a challenging, real-world project to apply everything I’ve learned with NestJS and show my understanding of:

a. Modular architecture

b. API versioning & error handling

c. Entity relationships and database modeling

Building scalable and maintainable services

🚀 What's Next?
I'm looking to:

1. Add a basic admin panel later

2. Possibly integrate with Stripe/Paystack when appropriate

Getting Started:

1. Clone the Repository: Use git clone https://github.com/charlesdev96/charlystore to clone this repository.
2. Install Dependencies: Run npm install in the project directory to install the required dependencies.
3. Configure Database: Create a database connection using your preferred database technology (e.g., Postgres) and update the configuration details in the appropriate environment variables file.
4. Start the Server: npm run start:dev to start the API server.

NOTE: Most API endpoints in this project require authentication. This means you'll need a token to access information about the currently logged-in user or perform actions on their behalf. Endpoints like registration and login are exempted from this requirement. If you attempt to access a protected endpoint without a valid token, you'll receive an error message prompting you to log in. For easy token management in Postman, you can leverage the "Authorization" header with the "Bearer Token" scheme. Simply copy and paste your access token, which is automatically retrieved upon successful login and stored as accessToken in your code. I've implemented a code that automatically copies the token from the login when "Bearer Token" is clicked, and I've named it "accessToken". You can do this by: in login, click on "script" and paste this code:

const jsonData = pm.response.json()

pm.globals.set("accessToken", jsonData.token)

Then create a global variable and name it "accessToken".

A sample of how I called the endpoints in postman can be seen using the link below and there is an example template for each endpoint.

Postman link: https://www.postman.com/charles4christ/public-workplace/collection/kyaw5ce/charly-store-copy

This will provide you with insights into how the endpoints were utilized in Postman, along with templates that you can use for reference or testing purposes.

Thanks.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
