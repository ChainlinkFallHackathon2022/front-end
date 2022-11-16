## Getting Started

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repository

   ```sh
    git clone https://github.com/ChainlinkFallHackathon2022/front-end.git
   ```

2. Change directory

   ```sh
    cd front-end
   ```

3. Install NPM packages
   ```sh
    npm install
   ```

### Enviroments variables

- Enter enviroments variables in `.env.local`
  ```
  REACT_APP_API_URL=
  REACT_APP_TOKEN_SECRET=
  ```

### Web3 Provider

We are using QuickNode RPC
- You can change RPC in `src/utils/network.js`

  ```js
export const quickNodeRPC = {
  polygon: "ENTER_RPC",
  mumbai: "ENTER_RPC",
};
  ```

### Available Scripts

In the project directory, you can run:

- `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

- `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
