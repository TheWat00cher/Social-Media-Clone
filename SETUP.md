# Installation and Setup Guide

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download here](https://git-scm.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd social-media-clone
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (both frontend and backend)
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Navigate to backend folder
   cd backend
   
   # Copy the example environment file
   copy .env.example .env
   
   # Edit the .env file with your configuration
   ```

   Edit the `.env` file with your actual values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/social-media-clone
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start MongoDB**
   - If using local MongoDB, start the MongoDB service
   - If using MongoDB Atlas, make sure your connection string is correct in the .env file

5. **Run the application**
   ```bash
   # From the root directory, run both frontend and backend
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend server on http://localhost:3000

## Alternative: Run frontend and backend separately

If you prefer to run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Available Scripts

From the root directory:
- `npm run dev` - Run both frontend and backend concurrently
- `npm run server` - Run only the backend
- `npm run client` - Run only the frontend
- `npm run install-all` - Install dependencies for both frontend and backend

## Testing the Application

1. Open your browser and go to http://localhost:3000
2. Register a new account
3. Login and explore the features

## Troubleshooting

### Common Issues:

1. **Port already in use**
   - Make sure ports 3000 and 5000 are not being used by other applications
   - You can change the ports in the respective package.json files

2. **MongoDB connection issues**
   - Make sure MongoDB is running
   - Check your connection string in the .env file
   - For MongoDB Atlas, make sure your IP is whitelisted

3. **Dependencies issues**
   - Delete node_modules folders and run `npm install` again
   - Make sure you're using a compatible Node.js version

4. **Environment variables not loading**
   - Make sure the .env file is in the backend directory
   - Restart the server after making changes to .env

## Features Included

- ✅ User authentication (Register/Login)
- ✅ JWT-based security
- ✅ Responsive design with Material-UI
- ✅ Redux state management
- ✅ Real-time notifications with Socket.io
- ✅ Image upload support (Cloudinary)
- ✅ Post creation, likes, and comments
- ✅ User profiles and following system

## Technologies Used

**Frontend:**
- React.js
- Redux Toolkit
- Material-UI
- React Router
- Axios
- Socket.io-client

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io
- Cloudinary (image uploads)
- Bcrypt (password hashing)

Happy coding! 🚀