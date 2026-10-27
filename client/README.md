# CampusFix

CampusFix is a React and Vite frontend for the CampusFix API. The API is an
Express service backed by MongoDB.

## Local development

Install dependencies in both `client` and `server`, then create environment
files from the variables used by each service:

- `client/.env`: `VITE_API_URL=http://localhost:5000`
- `server/.env`: `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN=http://localhost:5173`

Run `npm run dev` in each directory to start the frontend and API.

## Deploying to Render

The repository includes a Render Blueprint in `../render.yaml` for the static
frontend and Node API. To deploy:

1. Push the repository to GitHub and create a Blueprint in Render from it.
2. Create a MongoDB database in MongoDB Atlas. Configure Atlas network access
   to allow connections from your Render API service, and copy its connection
   string.
3. When Render requests Blueprint environment variables, set:
   - `MONGODB_URI`: the Atlas connection string.
   - `JWT_SECRET`: a long, unique secret value.
   - `CLIENT_ORIGIN`: the deployed `campusfix-client` URL, including `https://`.
   - `VITE_API_URL`: the deployed `campusfix-api` URL, including `https://`.
4. If Render assigns different service URLs, update `CLIENT_ORIGIN` on the API
   and `VITE_API_URL` on the static site to match, then redeploy the static
   site after changing its variable.

Keep database credentials and JWT secrets in Render's environment settings;
do not commit them to the repository.
