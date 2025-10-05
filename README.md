# SocialConnect - MERN Stack Social Media Platform

A fully-featured social media platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application provides a modern, Instagram-like experience with real-time features and comprehensive social networking capabilities.

## 🚀 Features

### 🔐 Authentication & Security
- ✅ **User Registration & Login** with JWT authentication
- ✅ **Secure password hashing** with bcryptjs
- ✅ **Protected routes** with authentication middleware
- ✅ **Session management** with persistent login state

### 👤 User Profiles
- ✅ **Customizable user profiles** with avatars and bio
- ✅ **Profile statistics** (posts count, followers, following)
- ✅ **Edit profile functionality**
- ✅ **Follow/Unfollow system** with real-time updates
- ✅ **Instagram-style profile grid** with 3-column layout

### 📝 Posts & Content
- ✅ **Create text posts** with rich content
- ✅ **Image uploads** with Multer middleware
- ✅ **Post interactions** (likes, comments, shares)
- ✅ **Real-time engagement updates**
- ✅ **Mixed content display** (text and image posts)
- ✅ **Beautiful gradient backgrounds** for text posts

### 🔍 Search & Discovery
- ✅ **Advanced search functionality**
- ✅ **Search users** by username
- ✅ **Search posts** by content
- ✅ **Real-time search results** with debouncing
- ✅ **User discovery** with follow buttons
- ✅ **Filter by content type** (users/posts)

### 💬 Social Interactions
- ✅ **Comment system** with threaded discussions
- ✅ **Like/unlike posts** with optimistic UI updates
- ✅ **Follow/unfollow users** with instant feedback
- ✅ **Real-time notifications** using Socket.io
- ✅ **Engagement statistics** on hover

### 🎨 User Interface
- ✅ **Modern Material-UI design** with custom theming
- ✅ **Responsive layout** for all screen sizes
- ✅ **Instagram-inspired aesthetics**
- ✅ **Smooth animations** and hover effects
- ✅ **Glass morphism effects** and modern styling
- ✅ **Dark/light theme support**

### ⚡ Real-time Features
- ✅ **Live notifications** for likes, comments, follows
- ✅ **Socket.io integration** for real-time updates
- ✅ **Instant UI feedback** with optimistic updates
- ✅ **Connected users tracking**

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Development Tools
- **nodemon** - Development server
- **CORS** - Cross-origin resource sharing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting
- **morgan** - HTTP request logger

## 📁 Project Structure

```
social-media-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── users.js
│   │   │   ├── upload.js
│   │   │   └── search.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── jwt.js
│   │   │   └── upload.js
│   │   └── server.js
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── PostCard.js
│   │   │   ├── CreatePost.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   └── Search.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── postSlice.js
│   │   │       └── userSlice.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-clone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   ⚠️ **SECURITY WARNING**: Never commit your `.env` file to git! It contains sensitive credentials.
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/social-media-clone
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   ```
   
   **Important**: Generate a strong JWT secret and use your actual MongoDB connection string.

4. **Start the backend server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Database Setup

1. **MongoDB Local Setup**
   - Install MongoDB locally
   - Start MongoDB service
   - Database will be created automatically

2. **MongoDB Atlas Setup (Recommended)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Search
- `GET /api/search/users?q=query` - Search users
- `GET /api/search/posts?q=query` - Search posts

### Upload
- `POST /api/upload` - Upload images

## 🎯 Key Features Explained

### Profile Grid Layout
- **3-column Instagram-style grid** for posts display
- **30% width posts** with responsive design
- **Gradient backgrounds** for text-only posts
- **80/15 split** for image posts (80% image, 15% caption)
- **Hover effects** showing engagement statistics

### Search Functionality
- **Real-time search** with 500ms debouncing
- **User and post filtering** with toggle chips
- **Follow/unfollow** directly from search results
- **Click to navigate** to user profiles

### Real-time Features
- **Socket.io integration** for live updates
- **Instant notifications** for social interactions
- **Connected users tracking** for real-time features
- **Optimistic UI updates** for better user experience

### Authentication Flow
- **JWT token-based** authentication
- **Persistent login** state management
- **Protected routes** with authentication checks
- **Secure password handling** with bcrypt

## 🔧 Development

### Running in Development
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)  
cd frontend
npm start
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Update API endpoints to production URLs

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Update CORS settings for production domain
3. Configure MongoDB Atlas connection
4. Deploy to platform of choice

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Material-UI** for the beautiful component library
- **MongoDB** for the flexible database solution
- **Socket.io** for real-time functionality
- **React community** for the amazing ecosystem

## 📞 Support

For support, email kumarbhaweshjha169@gmail.com or create an issue in the repository.

---

**Built with ❤️ using the MERN Stack By Bhawesh**

