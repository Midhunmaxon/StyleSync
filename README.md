# StyleSync — AI-Powered Fashion E-Commerce Platform

**Discover your style. Find your fit. Shop smarter.**

StyleSync is a full-stack fashion e-commerce web application built with the MERN stack. It combines a modern shopping experience with personalized AI-powered fashion recommendations, secure authentication, inventory management, and order tracking.

The project is designed to demonstrate practical full-stack development skills, including frontend and backend integration, REST APIs, database management, authentication, and deployment.

## ✨ Features

### 🛍️ Customer Shopping Experience
- **Fashion Storefront:** Explore a curated collection of fashion products.
- **Product Catalog:** Browse products by category, style, occasion, price, and other filters.
- **Product Details:** View product images, descriptions, available sizes, colors, prices, and stock information.
- **Smart Shopping Cart:** Add products, update quantities, select sizes, and manage cart items.
- **Wishlist:** Save favorite products and remove them whenever you want.
- **Buy Now & Checkout:** Select products and enter delivery details through a simple checkout experience.
- **Order History:** View placed orders and track their status.
- **Customer Profile:** Manage personal information and delivery details.

### 🤖 AI Stylist
StyleSync includes an AI-powered fashion assistant that helps users discover suitable outfits based on their preferences.

- Describe what you want to wear using natural language.
- Get fashion recommendations based on style, occasion, and budget.
- Receive suggestions from the products available in the store's catalog.
- Discover outfit combinations for different occasions.

### 🔐 Authentication & Security
- Customer registration and login.
- Password hashing for secure password storage.
- JWT-based authentication using HTTP-only cookies.
- Protected customer and administrative routes.
- Role-based access control for administrator features.
- Session management and logout functionality.

### 🛠️ Admin Dashboard
- Add, edit, and delete products.
- Manage product images, prices, sizes, and colors.
- Update stock quantities and product availability.
- Manage featured, trending, and new-arrival products.
- View customer orders and delivery information.
- Update order statuses.

### 📦 Order Management
- Create orders through the checkout workflow.
- Store order information in MongoDB.
- Update inventory when orders are placed.
- Display order confirmation and order history.
- Manage order statuses through the admin dashboard.

**Payment note:** The current checkout supports a demonstration order flow, including Cash on Delivery where configured. A third-party payment gateway has not been integrated.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| Vite | Frontend development and build tooling |
| JavaScript | Application logic |
| CSS | Responsive styling |
| Node.js | Backend runtime |
| Express.js | REST API and server-side logic |
| MongoDB Atlas | Cloud database |
| Mongoose | Database schemas and queries |
| JWT | Authentication |
| HTTP-only cookies | Session token storage |
| AI API | Natural-language fashion recommendations |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git & GitHub | Version control and project hosting |

## 🏗️ Application Architecture

StyleSync follows a client-server architecture.

1. **Frontend:** React provides the shopping interface and communicates with the backend through API requests.
2. **Backend:** Express.js handles authentication, product operations, cart management, orders, and AI Stylist requests.
3. **Database:** MongoDB stores application data such as users, products, carts, and orders.
4. **AI integration:** The backend processes fashion requests and connects to the configured AI provider.
5. **Deployment:** The frontend and backend are deployed separately, with environment variables used for production configuration.

```text
                 Customer
                    |
                    v
          React + Vite Frontend
                    |
               REST API
                    |
                    v
           Node.js + Express
            /      |      \
           v       v       v
       MongoDB   Auth     AI API
       Database  System   Stylist
            |
            v
       Orders & Inventory
```

## 📁 Project Structure

```text
StyleSync/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── app.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

*The structure above illustrates the main application layers. Refer to the repository for the exact files and directories currently present.*

## 🚀 Getting Started

Follow these steps to run StyleSync locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance
- [Git](https://git-scm.com/)
- An AI API key if you want to enable the AI Stylist

### 1. Clone the Repository

```bash
git clone https://github.com/Midhunmaxon/StyleSync.git
cd StyleSync
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173
```

Add the AI provider's API key and model configuration if required by your current backend implementation. Keep all secrets private.

### 3. Start the Backend

From the `backend` directory, run:

```bash
npm run dev
```

The backend should start on `http://localhost:5000`.

### 4. Install Frontend Dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Start the Frontend

From the `frontend` directory, run:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

**Important:** The environment-variable names above must match the configuration in the current source code. Never commit `.env` files, database credentials, JWT secrets, or AI API keys.

## 🌐 Live Deployment

StyleSync uses a separately hosted frontend and backend.

- **Frontend:** Vercel
- **Backend API:** [https://stylesync-api-jf6m.onrender.com](https://stylesync-api-jf6m.onrender.com)
- **Database:** MongoDB Atlas

Configure `VITE_API_URL` in the frontend deployment to point to the production backend. Configure the backend's database connection, authentication secret, frontend origin, and production cookie settings in the hosting environment.

The backend root URL is provided for API connectivity; it is not the customer storefront.

## 🔑 Key Development Concepts

This project provides practical experience with:

- Building reusable React components and managing application state.
- Designing RESTful APIs with Express.js.
- Creating MongoDB schemas and working with Mongoose.
- Implementing authentication and protected routes.
- Managing product data, shopping carts, and order workflows.
- Integrating an AI API into a full-stack application.
- Configuring environment variables and cross-origin requests.
- Deploying a frontend and backend to cloud hosting platforms.
- Debugging API failures and production configuration issues.

## 🔮 Future Improvements

Potential enhancements include:

- Integrating a real payment gateway.
- Adding automated tests for critical customer and admin workflows.
- Improving product discovery with more advanced recommendation techniques.
- Adding email notifications for order updates.
- Enhancing accessibility and mobile shopping usability.
- Expanding analytics and inventory reporting for administrators.

## 👨‍💻 Developer

**Midhun Maxon**

Computer Science and Engineering student | Aspiring AI Engineer | Full-Stack Developer

Interested in building practical applications that combine web technologies, backend engineering, and artificial intelligence.

- **GitHub:** [@Midhunmaxon](https://github.com/Midhunmaxon)
- **Project Repository:** [StyleSync](https://github.com/Midhunmaxon/StyleSync)

## 📄 License

This project is intended for learning, portfolio development, and demonstration purposes. Add a `LICENSE` file to the repository if you want to specify formal reuse and distribution terms.

---

**StyleSync — Where fashion meets technology.**
