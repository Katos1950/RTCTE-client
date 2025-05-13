# 🖊️ Co-write Client
🚀 [Live Site](https://www.co-write.online/)

This is the frontend of Co-write, a real-time collaborative text editor web application.
It provides a fully responsive, real-time editing experience with secure authentication and document management features.


# ✨ Features
- Responsive and mobile-friendly design
- Real-time collaborative editing using Socket.io
- Visual cursor tracking and active user presence
- Secure authentication with JWT, password encryption, and email verification
- Role-Based Access Control (RBAC) for document permissions
- Integrated AWS S3 hosting, CloudFront CDN distribution, and custom domain with SSL
- Automated deployments with GitHub Actions


# 📦 Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Real-time Communication: Socket.io-client
- Authentication: JWT-based flows
- Hosting: AWS S3 + CloudFront + ACM (SSL)
- CI/CD: GitHub Actions


# 🌐 Deployment
The application is deployed via AWS:
- Static frontend hosted on AWS S3
- Global delivery through CloudFront CDN
- SSL certificate managed via AWS ACM


# 📜 License
This project is licensed under the MIT License.
