# Strides

Implies making consistent, noticeable progress.

## Frontend

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

## Backend

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
