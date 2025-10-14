# SmackDown Backend

This is the Express.js backend for the SmackDown Smart Punching Bag Game. It uses MongoDB to store and manage leaderboard scores.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) account (a MongoDB Atlas cluster is recommended for production).

## Local Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the `backend` directory. You can copy the example: `cp .env.example .env` (if it exists).

4.  **Configure environment variables:**
    Open the `.env` file and add your `MONGO_URI`.
    ```
    PORT=5000
    MONGO_URI="your_mongodb_connection_string_here"
    ```

5.  **Run the Server:**
    ```bash
    npm start
    ```

---

## Deploying to Render

This server is ready to be deployed as a "Web Service" on [Render](https://render.com/).

1.  **Push to GitHub:** Make sure your project code is in a GitHub repository.

2.  **Create a New Web Service on Render:**
    - From the Render dashboard, click "New +" and select "Web Service".
    - Connect the GitHub repository containing your app.

3.  **Configure the Service:**
    - **Name:** Give your service a name (e.g., `smackdown-backend`).
    - **Root Directory:** If you are deploying a repo that contains both frontend and backend, set this to `backend`.
    - **Environment:** `Node`
    - **Build Command:** `npm install`
    - **Start Command:** `npm start`

4.  **Add Environment Variables:**
    - Before creating the service, click on "**Advanced**", then "**Add Environment Group**" or "**Add Environment Variable**".
    - You **must** add the following two variables:
      - `MONGO_URI`: Your MongoDB connection string (it's recommended to use a production database from MongoDB Atlas).
      - `FRONTEND_URL`: The full URL of your frontend application once it is deployed on Firebase (e.g., `https://your-project-name.web.app`). This is critical for security.

5.  **Deploy:**
    - Click "**Create Web Service**". Render will automatically build and deploy your application.
    - Once deployed, Render will provide you with a public URL for your backend (e.g., `https://smackdown-backend.onrender.com`). You will need this URL for the frontend.
