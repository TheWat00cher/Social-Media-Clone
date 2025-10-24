# SocialConnect - MERN Stack Social Media Platform

A fully-featured social media platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application provides a modern, Instagram-like experience with real-time features, messaging, and comprehensive social networking capabilities.

## 🌐 Live Demo

**🚀 [View Live Application](https://social-media-clone-c90ghqjip-bhawesh-jhas-projects.vercel.app)**

> **Try it now!** Register an account, create posts, upload images, follow users, send messages, and explore real-time social features.

## 🚀 Features

### 🔐 Authentication & Security
- ✅ **User Registration & Login** with JWT authentication
- ✅ **Secure password hashing** with bcryptjs
- ✅ **Protected routes** with authentication middleware
- ✅ **Session management** with persistent login state
- ✅ **Input validation** with detailed error messages
- ✅ **Client-side validation** for better UX

### 👤 User Profiles
- ✅ **Customizable user profiles** with avatars and bio
- ✅ **Profile picture upload/change** with image preview
- ✅ **Profile statistics** (posts count, followers, following)
- ✅ **Edit profile functionality** (username, name, email, phone, bio)
- ✅ **Public/Private fields** (only username and name visible to others)
- ✅ **Follow/Unfollow system** with real-time updates
- ✅ **Instagram-style profile grid** with 3-column layout
- ✅ **Delete posts** from own profile with confirmation dialog
- ✅ **View followers/following lists** with clickable dialogs
- ✅ **Navigate between user profiles** seamlessly

### 📝 Posts & Content
- ✅ **Dedicated Create Post Page** with breadcrumb navigation
- ✅ **Create text posts** with rich content
- ✅ **Image uploads** with Multer middleware
- ✅ **Post interactions** (likes, comments, shares)
- ✅ **Delete posts** with styled confirmation dialog
- ✅ **Real-time engagement updates**
- ✅ **Mixed content display** (text and image posts)
- ✅ **Beautiful gradient backgrounds** for text posts
- ✅ **Personalized feed** showing posts from followed users only
- ✅ **Like persistence** after page refresh
- ✅ **Non-clickable post images** for better UX

### 💬 Real-time Messaging
- ✅ **One-on-one messaging** with Socket.io
- ✅ **Real-time message delivery** and notifications
- ✅ **Conversation list** with last message preview
- ✅ **Unread message count** in navbar
- ✅ **Message from profile** - start conversation from any user's profile
- ✅ **Message from search** - quick message users you find
- ✅ **Typing indicators** support (backend ready)
- ✅ **Message search** within conversations
- ✅ **Auto-scroll** to latest messages
- ✅ **Socket.io connection** status logging

### 🔍 Search & Discovery
- ✅ **Advanced search functionality**
- ✅ **Search users** by username
- ✅ **Search posts** by content
- ✅ **Real-time search results** with debouncing
- ✅ **User discovery** with follow buttons
- ✅ **Filter by content type** (users/posts)
- ✅ **Message users** directly from search results

### 💬 Social Interactions
- ✅ **Comment system** with user avatars and names
- ✅ **Like/unlike posts** with optimistic UI updates
- ✅ **Like functionality in profile** with instant feedback
- ✅ **Follow/unfollow users** with instant feedback
- ✅ **Real-time notifications** using Socket.io
- ✅ **Engagement statistics** on hover overlay
- ✅ **Comments dialog** with proper user attribution
- ✅ **Isolated follow buttons** (no batch triggering)

### 🎨 User Interface
- ✅ **Modern Material-UI design** with custom theming
- ✅ **Responsive layout** for all screen sizes
- ✅ **Instagram-inspired aesthetics**
- ✅ **Smooth animations** and hover effects
- ✅ **Glass morphism effects** and modern styling
- ✅ **Hidden scrollbars** for cleaner look
- ✅ **Floating Action Button** for quick post creation
- ✅ **Gradient headers** and styled dialogs
- ✅ **Profile picture preview** in edit dialog
- ✅ **Welcome messages** - different for new vs returning users
- ✅ **Empty state messages** - helpful guidance when no content
- ✅ **Loading states** with spinners
- ✅ **Error handling** with user-friendly messages

### ⚡ Real-time Features
- ✅ **Live notifications** for likes, comments, follows
- ✅ **Socket.io integration** for real-time updates
- ✅ **Instant UI feedback** with optimistic updates
- ✅ **Connected users tracking**
- ✅ **Real-time messaging** with instant delivery
- ✅ **Typing indicators** (backend support)
- ✅ **Message read receipts**

## 🛠️ Technology Stack

### Frontend
- **React.js 19.2.0** - Modern React with hooks
- **Redux Toolkit 2.9.0** - State management
- **Material-UI (MUI) 7.3.3** - Component library
- **React Router 7.9.3** - Client-side routing
- **Axios 1.12.2** - HTTP client
- **Socket.io Client 4.8.1** - Real-time communication

### Backend
- **Node.js v25.0.0** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **MongoDB** - NoSQL database (Atlas/Local)
- **Mongoose 7.5.0** - MongoDB ODM
- **Socket.io 4.7.2** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs 2.4.3** - Password hashing
- **Multer 1.4.5** - File upload handling
- **Cloudinary 1.40.0** - Cloud image storage (optional)

### Development Tools
- **nodemon** - Development server
- **CORS** - Cross-origin resource sharing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting
- **morgan** - HTTP request logger
- **dotenv** - Environment variables

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
│   │   │   ├── CreatePostPage.js
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
- `PUT /api/users/:id` - Update user profile (with file upload)
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

### Dedicated Create Post Page
- **Separate route** `/create-post` for focused post creation
- **Breadcrumb navigation** for better UX
- **Tips section** with guidelines for creating posts
- **Auto-redirect** to home after successful post creation
- **Floating Action Button** on home page for quick access

### Profile Picture Management
- **Upload/Change profile picture** with file selection
- **Image preview** before saving
- **Multer middleware** for secure file handling
- **Automatic URL generation** for uploaded images
- **Display across application** (profile, navbar, comments)

### Edit Profile Functionality
- **Comprehensive profile editing** with multiple fields
- **Public fields**: Username, First Name, Last Name, Bio
- **Private fields**: Email, Phone Number
- **Validation**: Unique username and email checks
- **Styled dialog** with gradient header and organized sections

### Profile Grid Layout
- **3-column Instagram-style grid** for posts display
- **30% width posts** with responsive design
- **Gradient backgrounds** for text-only posts
- **80/15 split** for image posts (80% image, 15% caption)
- **Hover effects** showing engagement statistics
- **Delete icon integration** with like/comment stats

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

### Production Deployment## � Deployment

This project is deployed and live!

- **Frontend**: [Vercel](https://social-media-clone-c90ghqjip-bhawesh-jhas-projects.vercel.app)
- **Backend**: Railway
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary

### Deploy Your Own

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB for the flexible database solution
- Socket.io for real-time functionality
- React community for the amazing ecosystem

## 📞 Contact

**Bhawesh Kumar Jha**
- Email: kumarbhaweshjha169@gmail.com
- GitHub: [@TheWat00cher](https://github.com/TheWat00cher)

---

**Built with ❤️ using the MERN Stack**

