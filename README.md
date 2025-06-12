# Strides

Implies making consistent, noticeable progress.

## Frontend

### Notes

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
