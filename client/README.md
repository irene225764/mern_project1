# CampusFix

CampusFix is a React and Vite frontend for the CampusFix API. The API is an
Express service backed by MongoDB.

## Local development

Install dependencies in both `client` and `server`, then create environment
files from the variables used by each service:

- `client/.env`: `VITE_API_URL=http://localhost:5000`
- `server/.env`: `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN=http://localhost:5173`

Run `npm run dev` in each directory to start the frontend and API.

## Deploying to Vercel and Railway

The Vite frontend is deployed on Vercel, and the Express API is deployed on
Railway. MongoDB Atlas provides the database.

1. Create a MongoDB database in MongoDB Atlas and configure its network access
   to allow connections from Railway.
2. In Vercel, import this GitHub repository and set the project root directory
   to `client`. Set the `VITE_API_URL` environment variable to the Railway API
   public URL, including `https://`.
3. In Railway, create a service from this GitHub repository and set its root
   directory to `server`, build command to `npm ci`, and start command to
   `npm start`. Set the health check path to `/api/health`.
4. Set these variables on the Railway service:
   - `MONGODB_URI`: the MongoDB Atlas connection string.
   - `JWT_SECRET`: a long, unique secret value.
   - `CLIENT_ORIGIN`: the Vercel frontend URL, including `https://`.
5. After both services have deployed, make sure `CLIENT_ORIGIN` and
   `VITE_API_URL` contain the correct public URLs. Redeploy the Vercel frontend
   after changing `VITE_API_URL`.

Keep database credentials and JWT secrets in the hosting providers'
environment settings; do not commit them to the repository.
