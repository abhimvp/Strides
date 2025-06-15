# Strides

Implies making consistent, noticeable progress.

To start backend: `uvicorn main:app --reload`
To start frontend: `pnpm dev`

## Frontend

### Features-frontend

#### System for user sign-up and login-frontend

- Now we have backend authentication system up and running. We now have the secure foundation needed to build the rest of the app.
- The next logical step is to connect our frontend to this new backend authentication system.
- About [pnpm](https://pnpm.io/pnpm-cli)
- We'll use `axios` for making clean API requests to our backend : `pnpm add axios`
- `Implement API calls`:
  - **Create an API Service Layer**:To keep our API calls organized.
  - Create a new folder `src/services` & Inside it, create a new file named `authService.ts`.
- `Manage User State:` This is the most important part. We will use React's Context API to create a global "authentication context." This will allow our entire application to know:
  - Is a user currently logged in?
  - What is their access token?
  - Who is the current user?
- **`This will enable us to do things like show the "dashboard" if the user is logged in, or show the login page if they are not`**
- `Create the Global Authentication Context`: This is the heart of our frontend authentication. It will provide user state and login/logout functions to our entire app.
  - Create a new folder `src/context` & Inside it, create a new file named `AuthContext.tsx`
- `Build the Auth UI in React`: Create the Login and Signup Pages - for our users to interact with.
  - Create a new folder `src/pages` & Inside src/pages, create a new file named `AuthPage.tsx`. This single component will handle both Login and Signup to keep things simple.(For Now)
- `Create the Dashboard Page`: We need to move our main task tracking UI into its own page.
  - In src/pages/, create a new file named `Dashboard.tsx` & Add a "Logout" button.
  - Go to current `src/App.tsx`, copy the `ENTIRE` content of the App function `(from const [tasks, setTasks]...` to the closing `</div>)`, and paste it inside a new Dashboard component in this file. You will also need to move the imports and the utility functions.
  - Update the Main App.tsx and main.tsx.
    - Finally, let's tie everything together.
    - `App.tsx` will now act as a router, deciding which page to show based on the auth state.
    - `main.tsx` will wrap our app in the AuthProvider.

##### Small fixes

- **Why Are We Making This Change?** : In React development, we want our tools to give us instant feedback. When you save a file, you want to see the change in your browser immediately without the whole page reloading. This feature in Vite is called `Fast Refresh`.
- For Fast Refresh to work perfectly, it has a simple rule: a file should have `one main "job."` Specifically, it works best when a file's main export is a React component.
- `The Problem:` Our file src/context/AuthContext.tsx was doing two jobs: ( look at previous commit to understand before and after : future reference note)
  - It defined and exported the AuthProvider component.
  - It also defined and exported the useAuth hook (a special function for using our context).
- Vite saw these two different types of exports and logged a warning: incompatible. It's telling us, "I can't guarantee I can update this file instantly without a full reload because it's doing more than one thing."
- `The Solution (The Professional Standard):` The best practice is to separate these concerns into their own dedicated files.
  - One file for the Context and Provider Component (src/context/AuthContext.tsx). Its only job is to provide the authentication state to the app.
  - A new file for the Custom Hook (src/hooks/useAuth.ts). Its only job is to provide a clean way for other components to access that state.
- This makes our code cleaner, easier to understand, and fully compatible with Vite's Fast Refresh feature, leading to a smoother development experience.

#### Tasks - frontend

- We'll be modifying the frontend dashboard to fetch real data from the backend TASKS API we just built, making the application fully dynamic and persistent.
- create a new API service for tasks, setting up an axios interceptor for clean authentication, and updating the Dashboard page to handle live data, including the special case for new users.
- `Integrating the Live Tasks API into the Frontend:` steps needed to connect your React dashboard to the live backend API for fetching and updating user-specific tasks.
- `Create an API Client with Auth Interceptors`: To avoid manually adding the authentication token to every API request, we'll create a central axios instance that automatically includes it. This is a very professional and clean pattern.
  - In src/services/ folder, create a new file named `api.ts`
- `Create a Task Service`: let's create a dedicated service for all task-related API calls, using our new API client.
  - In src/services/ folder, create a new file named `taskService.ts`
- `Update Frontend Types`: Our frontend types should match the backend Pydantic models for consistency.The id field on UserTasks is now optional to match the backend fix.
  - Go to src/types/index.ts and update/replace its contents.
- `Update the Dashboard Page`: This is the biggest change. We will replace our static mock data with live data fetching, loading states, and API calls.
  - Go to src/pages/Dashboard.tsx and do the necessary changes.
- `Update Mock Data Structure`: Our mock data needs a slight adjustment to match our new UserTasks type structure.
  - Open src/data/mockTasks.ts and replace its contents.

#### Making the Dashboard editable

- `Feature : Add a new task`: Adding the functionality to create a new task within a category on your dashboard.

  - `Create a Reusable Modal Component:` A modal (or popup dialog) is a great way to handle forms without leaving the page. We'll create a generic modal component that we can reuse for adding tasks, editing tasks, creating categories, etc.
    - In src/components/ folder, create a new file named `Modal.tsx`
  - `Create the "Add Task" Form Component`: This component will be the form that lives inside our new modal.
    - In src/components/ folder, create a new file named `AddTaskForm.tsx`.
  - `Update the TaskList Component`: Now we'll modify our TaskList component. It will manage the state for the "Add Task" modal and pass down a function to the Dashboard to actually add the task.
    - Go to src/components/TaskList.tsx and make the necessary changes
  - `Update the Dashboard Page to Handle Adding Tasks`: Finally, we'll add the logic to our main Dashboard page to handle creating the new task, updating the state, and saving it to the backend.
    - In src/pages/Dashboard.tsx , Add the new `handleAddTask` function and pass it down to the TaskList component.

- `Feature : Adding Tasks & Categories` : adding new tasks and creating new categories on the dashboard.

  - `Create Reusable UI Components`: If you've already created this from the previous step, you can skip this.`(Done)` in src/components/ , `Modal.tsx`.
  - `Add Task Form Component` : Done in above step - file : AddTaskForm.tsx
  - `Add Category Form Component` :
    - In src/components/, create a new file named `AddCategoryForm.tsx`.
    - Update the TaskList Component : The TaskList component is already complete from the previous step. No changes are needed here.
    - `Update the Dashboard Page to Handle Creating Categories` : We'll add the new state and handler function for creating categories to our main Dashboard page.
      - Go to src/pages/Dashboard.tsx and make the necessary changes.

- `Feature : Deleting Tasks & Categories`: adding the ability to delete tasks and categories from the dashboard.
  - `Create a Reusable Confirmation Dialog`: Instead of using the jarring browser confirm() pop-up, we'll create a nice-looking confirmation dialog that fits our app's style. We can reuse our Modal component for this.
    - In src/components/ folder, create a new file named `ConfirmationDialog.tsx`.
  - `Update the TaskItem Component` : We'll add a small "trash" icon to each task row that appears on hover.
    - In src/components/TaskItem.tsx , make changes and We've added a `group` class to the main `div` and a `group-hover:opacity-100` class to the button to create the hover effect.
  - `Update the TaskList Component`: We'll add a delete button next to the category title and pass the delete handlers down to the TaskItem.
    - In src/components/TaskList.tsx, make the necessary changes.
  - `Update the Dashboard Page`: let's add the deletion logic to the Dashboard page.
    - In src/pages/Dashboard.tsx, make the necessary changes.

#### Feature Implementation: Weekly Calendar View

- let's refactor the dashboard to display a proper weekly calendar (Sunday-Saturday) with dates, highlighting for the current day, and disabled past dates.
- `Update Frontend Types`: The most important change is to our data model. We need to track completions by date.
  - In src/types/index.ts , Find the Task interface and modify the history property.
- `Update the Date Utility`: We need a more powerful function to generate our week.
  - In src/utils/date.ts , we write updated logic
- `Update UI Components`:
  - `TaskItem Component` : This component now needs to find the right history entry for each day and disable past days.
    - In src/components/TaskItem.tsx : update code
  - `TaskList Component`: This component will now display the date numbers in the header
    - In src/components/TaskList.tsx : : update code
- `Update the Dashboard Page Logic`: we update the main Dashboard page to use our new date logic.
  - In src/pages/Dashboard.tsx : update code.

#### Feature : Editing Tasks & Categories

- adding the ability to edit the names of existing tasks and categories on the dashboard.
- `Create a Reusable Edit Form Component`: We'll create a generic form for editing any piece of text.
  - In your src/components/ folder, create a new file named `EditForm.tsx`.
- Update the `TaskItem` Component: Add the Pencil icon and the onEdit handler.
- Update the `TaskList` Component: Add the Pencil icon and the onEditCategory handler.
- Update the `Dashboard` Page : add the state management and handler functions for editing to our main Dashboard page

#### UI Polish : Implementing Toast Notifications

- Replacing browser alerts with a professional toast notification system using `react-hot-toast`
  - We'll replace all the jarring browser alert() pop-ups with a smooth, non-intrusive "[toast](https://react-hot-toast.com/)" notification system.
- Install : `pnpm add react-hot-toast`
- `Add the Toaster Component to Your App`: For the toast notifications to appear, we need to add the Toaster component to the root of our application. This `component listens for toast events and renders the pop-ups`.
- `Update the AuthPage to Use Toasts`: let's replace the alert() and error messages on our login/signup page.
- `Update the Dashboard Page to Use Toasts`: we'll do the same for our Dashboard page, replacing all alerts with toast notifications.

#### UI/UX Improvements: Task Notes & Accordion Categories

- Implementing two major user experience enhancements: adding optional notes to tasks and making categories collapsible.
- `Update the "Add Task" Form`: we'll add an optional "Notes" field to our AddTaskForm component.Add a textarea for the notes and update the onAddTask prop to include the new data.
- `Update the TaskItem to Display Notes`: we'll add a small info icon that shows the notes in a tooltip on hover.Add the Info icon from lucide-react and the tooltip logic.
- `Update the TaskList for Accordion Behavior` : This component will now manage being open or closed.
- `Update the Dashboard Page Logic`: we add the state management for the accordion and update the handleAddTask function.

#### Moving Tasks Between Categories

- Adding the ability for a user to move a task from one category to another using a [Drag-and-Drop](https://dndkit.com/) System. using `dnd-kit`.
- Install dnd-kit Libraries : `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
- `Update Backend & Frontend Types for History Tracking(Future UseCase)`(TODO): To track where a task has been, we need to add a new field to our Task model on both the backend and frontend.
  - `Backend Model`: Open backend/models/task_models.py. Add a MoveHistory model and update the Task model.
  - `Frontend Types`: Open src/types/index.ts and make the corresponding change.
- `Refactor UI Components for Drag-and-Drop`:
  - **`TaskItem`** Component: This component will now be a "**`draggable`**" item.
    - Open src/components/TaskItem.tsx and replace its contents with this version, which uses the `useSortable` hook from `dnd-kit`.
  - **`TaskList`** Component: This component will now be a "**`droppable`**" container for tasks.
    - Open src/components/TaskList.tsx and replace its contents with this version.
  - `Update the Dashboard Page with Drag-and-Drop Logic`: This is the main change. The Dashboard will now manage the entire drag-and-drop context and handle the logic when a drag operation ends.
    - Open src/pages/Dashboard.tsx and replace its entire contents with the full, updated code below.

### Notes-Frontend

- Setting Up Your React(Typescript) Frontend with Vite and Tailwind CSS.
- Create a New React Project with Vite : `pnpm create vite`
- You will be prompted to answer a few questions:
  - **Project name:** Enter a name, for example, `frontend`.
  - **Select a framework:** Use the arrow keys to choose `React`.
  - **Select a variant:** Choose `Typescript + SWC`.
- Install Project Dependencies:
  - cd frontend
  - pnpm install
  - pnpm approve-builds (to pick which dependencies should be allowed to run scripts - @swc/core, esbuild)
  - pnpm run dev ( opens our app in localhost:5173)
- Install and Configure [Tailwind CSS](https://tailwindcss.com/) : `pnpm install -D tailwindcss postcss autoprefixer` & `pnpm install -D tailwind-merge class-variance-authority` (optional dependencies for better component management) & `pnpm install @tailwindcss/vite`

```txt
Manually create the `Tailwind config file`. In the root of your frontend folder, create a new file named tailwind.config.js and paste the following content into it. This is the crucial step that was missing.

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- Add Icons and Application Code : `pnpm add lucide-react`

- Why Start with TypeScript? (react-ts)

  - Fewer Bugs: TypeScript's main feature is static typing. This means you define the "shape" of your data (like your Task objects). It will catch a huge number of common errors during development before you even run the code, such as typos in property names or passing the wrong type of data to a component.
  - Better Developer Experience: With VS Code, TypeScript provides incredible autocompletion, code navigation, and in-editor feedback. It makes your code more predictable and easier to work with, especially as the app grows.
  - Easier to Scale & Maintain: As you add a backend, user authentication, and more complex features, your data structures will become more involved. TypeScript makes managing this complexity much more straightforward. It acts as living documentation for your code.

- What is a Compiler in this Context?

  - When you write React code using TypeScript and JSX, a web browser can't understand it directly. A tool needs to "compile" or "transpile" your .tsx files into standard JavaScript that browsers can execute.
    - TypeScript (the standard option): This option uses a combination of tools. For speed during development, Vite uses a fast transpiler called esbuild. However, for checking your types, it still relies on the official TypeScript compiler (tsc).
    - TypeScript + SWC (the faster option): This option replaces esbuild with SWC (Speedy Web Compiler). SWC is a super-fast compiler written in Rust. It handles the job of converting your code even more quickly than esbuild.

- Recommendation : You get all the benefits of TypeScript (type safety, better code intelligence) combined with the best-in-class performance of the SWC compiler. This means your development server will start faster and your code will refresh more quickly when you make changes. There's really no downside for a new project.

- Tailwind CSS works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles and then writing them to a static CSS file.It's fast, flexible, and reliable — with zero-runtime.

- `let's know the core of how Tailwind CSS works!`

  - The className string is a list of individual "utility classes," where each class does one specific CSS job. Your browser knows what these classes mean because the @import "tailwindcss"; line you added uses your project's configuration to generate a big CSS file with all the necessary styles.
  - Let's break down your example: <p className="text-slate-500 mt-2">
    - text-slate-500: This sets the text color.
    - text-: The property you're changing (in this case, color).
    - slate: The color you're using from Tailwind's built-in color palette.
    - 500: The shade or intensity of that color (it goes from 50, very light, to 950, very dark).
    - CSS Equivalent: color: rgb(100 116 139);
    - mt-2: This adds a margin to the top of the element.
    - m: The property you're changing (margin).
    - t: The direction (top).
    - 2: A value from Tailwind's predefined spacing scale. This doesn't mean "2 pixels." By default, 2 equals 0.5rem, which is typically 8px.
    - CSS Equivalent: margin-top: 0.5rem;
  - How to Find Out What Any Class Does
    - The best way to figure these out is by using two essential tools:
    - Tailwind CSS Official Documentation: The docs have an amazing search feature. If you search for "margin" or "color," it will take you right to the page showing all the available classes. It's your ultimate reference.
      <https://tailwindcss.com/docs>
    - Tailwind CSS IntelliSense Extension for VS Code: This is a must-have. When you install this extension, it will autocomplete class names for you and, more importantly, when you hover your mouse over a class name in your code, it will show you the exact CSS it produces!

- **What `StrictMode` Does in Development**:
  - To help you find potential problems in your code, StrictMode will intentionally run certain functions twice. This includes the useEffect hook.
  - So, here's what happens:
    - Your Dashboard component mounts for the first time.
    - StrictMode immediately unmounts it and then remounts it.
    - This causes the useEffect hook (which contains your fetchUserTasks API call) to run twice.
  - Is This a Problem?
    - No, it is not. This double-rendering behavior only happens in development mode.
    - When you build your app for production, StrictMode is disabled, and the useEffect hook will only run once as you would normally expect.
    - It's a development-only tool to help you write better, more resilient code.

## Backend

### Features-backend

#### System for user sign-up and login-backend

- Implementing User Authentication : creating the models, utility functions, and API routes needed for user signup and login.
- `Defining the Data Models`:

  - We need to `define` what a "User" looks like in our application. We'll use `Pydantic` for this, which integrates perfectly with FastAPI.
  - create a new file named user_models.py. Explanation:
    - UserBase: The basic information about a user.
    - UserCreate: The data we expect to receive from a user when they sign up (email and a plain text password).
    - UserInDB: The data as it is stored in our database (with a hashed password). We use Field(alias="\_id") because MongoDB uses `_id` for its primary key.
    - Token & TokenData: Models for handling the JWT authentication tokens.

- `Creating Security and Token Utilities`:

  - We need helper functions to handle password hashing and JWT creation.
  - create a new file named security.py
    - Security Note: This code generates a default SECRET_KEY. For a real application, you should generate a strong, random key and store it in your .env file. You can generate one with openssl rand -hex 32 in your terminal.

- `Building the Authentication API Routes`:

  - Now we'll create the actual `/signup` and `/login` endpoints.In `routes/` folder, create a new file named auth.py

- `Connecting the Routes to the Main App`:
  - The final step is to tell our main FastAPI application to use these new routes.Import the auth router and include it in the app(main.py)
  - We add a `prefix="/api/auth"` so all routes in this file will start with that path (e.g., `/api/auth/signup`). The tags parameter groups them nicely in the API docs.

#### Tasks - backend

- The next logical step is to make the dashboard functional by connecting it to the database. **Right now, it's still showing the same hardcoded example data for every user.**
- Build the Backend API for `Tasks`: `create the necessary endpoints` for a user to manage their own tasks. This will include routes for:
  - Creating new tasks and categories.
  - Reading (fetching) the logged-in user's tasks from the database.
  - Updating tasks (like checking off a day).
  - Deleting tasks.
- Building the Task Management API: creating the Pydantic models and API routes for managing user-specific tasks.
- `Defining the Task and Category Models`: we need to define what our task data looks like in code. We'll create a new model file for this.
  - In your backend/models/ folder, create a new file named task_models.py.Explanation:
    - Task: Represents a single to-do item, just like in our frontend.
    - Category: A category that has a name and contains a list of Task items.
    - UserTasks: This is the main model. It represents the entire document we will store in a new tasks collection in MongoDB. It links a list of categories to a specific owner_id.
    - UserTasksCreate: The data we'll use when a new user saves their initial set of tasks.
- `Creating a Dependency to Get the Current User`: To make our routes secure, **we need a reliable way to identify which user is making the request**. We'll create a reusable "dependency" for this.
  - In `backend/utils/security.py` file.Add the `get_current_user` function and the necessary imports to the bottom of the file.
- `Building the Task Management API Routes`: we'll create the endpoints for fetching, creating, and updating a user's tasks.
  - In backend/routes/ folder, create a new file named `tasks.py`
- `Connecting the New Routes to the Main App`: let's tell our main FastAPI application to use these new task routes.

#### #### Feature Implementation: Weekly Calendar View - Update Backend Models

- To support the new frontend structure, your backend models must also be updated.
- In backend/models/task_models.py.Add a `TaskHistory` model and update the `Task` model to use it.

#### Include the optional notes field in our Pydantic models

### Notes-Backend

- Setting Up "Strides" Backend with FastAPI(Python framework).
- Navigate to the root of your main project directory, Strides, which currently contains your `frontend` folder
- Create the Backend Project Folder.(`mkdir backend` & `cd backend`)
- Create and Activate a Python Virtual Environment with `uv`:
  - `Remember` : A virtual environment is a private, isolated space for your Python project's dependencies.
  - **uv** will automatically create a **.venv** folder, which is the standard name.

```bash
abhis@Tinku MINGW64 ~/Desktop/Strides/backend (main)
$ uv venv
Using CPython 3.12.0
Creating virtual environment at: .venv
Activate with: source .venv/Scripts/activate

abhis@Tinku MINGW64 ~/Desktop/Strides/backend (main)
$ source .venv/Scripts/activate
(backend)
abhis@Tinku MINGW64 ~/Desktop/Strides/backend (main)
$ #  virtual environment is active.
```

- Define Your Project Dependencies:
  - This is the most important step for a professional setup. We will define our project's dependencies in a `pyproject.toml` file.
  - In the root of your backend folder, create a new file named pyproject.toml , paste the code.
  - uv will create a virtual environment and uv.lock file in the root of your project the first time you run a project command, i.e., uv run, uv sync, or uv lock.

```bash
(backend)
abhis@Tinku MINGW64 ~/Desktop/Strides/backend (main)
$ uv sync
warning: No `requires-python` value found in the workspace. Defaulting to `>=3.12`.
Resolved 51 packages in 347ms
Audited 49 packages in 0.56ms
```

- You can add dependencies to your pyproject.toml with the uv add command. This will also update the lockfile and project environment:`uv add requests`
- You can also specify version constraints or alternative sources:

```bash
# Specify a version constraint
uv add 'requests==2.31.0'

# Add a git dependency
uv add git+https://github.com/psf/requests
```

- If you're migrating from a requirements.txt file, you can use uv add with the -r flag to add all dependencies from the file: Add all dependencies from `requirements.txt` : `uv add -r requirements.txt -c constraints.txt`
- To remove a package, you can use uv remove: `uv remove requests`
- To upgrade a package, run uv lock with the --upgrade-package flag:`uv lock --upgrade-package requests`

- Install Project Dependencies with uv

  - uv pip install "fastapi[all]" motor "passlib[bcrypt]" python-jose
    - `fastapi[all]`: Installs FastAPI and all its optional dependencies, including uvicorn (our web server).
    - `motor`: The official, asynchronous driver for connecting our FastAPI app to MongoDB.
    - `passlib[bcrypt]`: A library for securely hashing and verifying passwords.
    - `python-jose`: A library for creating, signing, and verifying JWTs (JSON Web Tokens) for user authentication.

- `requirements.txt`: This file is a "lock file." It's generated from your pyproject.toml and lists the exact versions of all your direct dependencies and all of their sub-dependencies. This guarantees that every developer and every server has the identical environment.
- Compile the lock file. This command reads pyproject.toml, resolves all the dependencies, and writes their exact versions into requirements.txt
  - `uv pip compile pyproject.toml -o requirements.txt`
  - Sync your virtual environment. This command installs all the packages from the requirements.txt file into your virtual environment.
    - `uv pip sync requirements.txt`

```bash
# whenever we add new libraries , we need to run this command as well
uv pip compile pyproject.toml -o requirements.txt
```

- Create the Initial Backend File Structure: Let's create a few files and folders inside the backend directory to keep our code organized from the start.

  - Create a main file for our application - `main.py`.
  - Create folders for our different code modules:
    - `models/` (for Pydantic data models)
    - `routes/` (for our API route definitions)
    - `utils/` (for helper functions, like password hashing)

- Add Boilerplate Code to main.py ( note : This code sets up a basic FastAPI app and, most importantly, configures CORS (Cross-Origin Resource Sharing). This middleware is what will permit your React app (running on localhost:5173) to make requests to your backend (which will run on a different port, like localhost:8000))

- Run the Backend Development Server:

  - From the backend directory, run the following command:
    - `uvicorn main:app --reload`
      - `main`: Refers to the main.py file.
      - `app`: Refers to the app = FastAPI() object inside that file.
      - `--reload`: Tells the server to automatically restart whenever you save changes to your code.
    - Your terminal will show that the server is running on <http://127.0.0.1:8000>

- Verify and See the Magic:
  - Open your web browser and go to <http://127.0.0.1:8000>. You should see the JSON message: {"message":"Strides backend is running!"} - `Yaaasssss`
  - Now, go to <http://127.0.0.1:8000/docs>. You will see the automatic, interactive API documentation generated by FastAPI. This is one of its most powerful features and will be incredibly useful as we build out our routes.
  - `You now have a fully functional backend server set up and ready for us to build our authentication and task management logic.`

#### Connecting FastAPI to the Database

- Now we'll use the connection string in our backend code.
- Install `python-dotenv`
- We must never hardcode passwords or secret keys in our code. We'll use a `.env` file to store our connection string locally and securely.
- Make sure your virtual environment is active.
  - uv add python-dotenv
  - uv pip compile pyproject.toml -o requirements.txt
- Create a .env file , Add the following line to it, pasting your connection string and replacing <password> with the actual password. `MONGO_DB_URL="mongodb+srv://strides_user:YOUR_SAVED_PASSWORD@stridescluster.xxxxx.mongodb.net/?retryWrites=true&w=majority"` (Remember to replace YOUR_SAVED_PASSWORD!)
- `VERY IMPORTANT:` Add .env to your .gitignore file to ensure you never accidentally commit your secrets to GitHub. Create a .gitignore file in your backend directory if you don't have one and add this line - `.env`

- Create the Database Connection Module:
  - Create a new file at backend/utils/
- Update `main.py` to Manage the Connection
- Test the Connection > Restart it: `uvicorn main:app --reload` > When the server starts, you should see the same messages as before, confirming a successful connection, but now using the modern lifespan approach.

```txt
Connecting to the database...
Successfully connected to MongoDB.
```

- This confirms that your FastAPI backend is now successfully communicating with your MongoDB Atlas database. We are now ready to start creating our user models and authentication routes!

## Database - MongoDB

### Notes-Setting Up DB

- **Set up a MongoDB Database**: We need a running MongoDB instance. The easiest way to start is with MongoDB Atlas, their free cloud service. It saves us from having to install and manage the database on our own computer.(Gemini-2.5 Pro : I can guide you through creating a free account and getting a "connection string" (which is like a web address for our database))

- `Create a Database Connection Module`: In our backend code, we'll create a new file (e.g., in the utils/ folder) that will handle the logic of connecting to our MongoDB database when the application starts up.

- `Define our Data Models:` Once connected, we'll start defining what our data looks like in code. We'll go into the models/ folder and create Pydantic models for our first collection: User. This model will define that a user has an email, a hashed password, etc.

#### Connecting to MongoDB

- Setting Up a Free MongoDB Atlas Database : We'll use MongoDB's official cloud service, which has a generous free tier perfect for development and even small production apps.
- Create a [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register)
- Create a Free Database Cluster
- `uv add "pymongo[srv]"` & `uv pip compile pyproject.toml -o requirements.txt`
- Configure Database Access
- Configure Network Access
- Get Your Connection String
