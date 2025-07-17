# Strides

**Strides** is a personal finance and productivity application designed to help you make consistent, noticeable progress in your life. It provides a comprehensive suite of tools to manage your finances, track your tasks, and achieve your goals.

Implies making consistent, noticeable progress.

To start backend: `uvicorn main:app --reload`
To start frontend: `pnpm dev`

## 🚀 The Future of Strides: AI-Powered Management

The next major evolution of Strides is to integrate a powerful AI agent that will revolutionize how you interact with your finances and tasks. Our goal is to move beyond manual data entry and allow you to manage your life using natural language.

### The Vision: Conversational Management

Imagine being able to simply tell Strides what you've done, and have it intelligently understand and categorize everything for you.

**Example Scenario:**

> **User:** "Hey Strides, I had a chai at Raghavendra hotel and it cost me 10 rupees."

The AI agent would then:

1. **Parse the input:** Identify the key entities: "chai" (description), "Raghavendra hotel" (vendor), "10 rupees" (amount and currency).
2. **Categorize the transaction:** Recognize that "chai" falls under the "Food & Drink" category.
3. **Create the transaction:** Automatically create a new expense transaction with the correct details, without you ever having to open a form.

### The Plan: How We'll Make It Work

This will be achieved by building a sophisticated AI agent using the **LangGraph** framework and integrating it with our existing backend APIs. The key is to create a **reasoning loop** that uses the user's own data to make intelligent decisions.

1. **Initial Parsing & Intent Recognition:** The agent first analyzes the user's raw text (e.g., _"I had a chai at Raghavendra hotel for 10 rupees"_) to extract core entities like the description, vendor, amount, and currency.

2. **Contextual Data Fetching (Tool Use - Step 1):** This is the crucial step. Before making any decisions, the agent will call a new, dedicated tool/API endpoint (e.g., `/api/agent/get-context`) that fetches the user's existing financial context. This context will include:

   - A list of all their custom expense categories (e.g., "Food & Drink", "Transportation", "Bills").
   - A list of their known accounts (e.g., "ICICI Bank", "Cash").

3. **Informed Reasoning & Categorization:** Now armed with the user's specific data, the agent can perform a much more intelligent analysis. It will compare the parsed transaction details against the user's categories. For example, it will see that "chai" and "hotel" strongly correlate with the user's "Food & Drink" category.

4. **Action Execution (Tool Use - Step 2):** Once the agent has confidently determined the correct category and account, it will call the existing `POST /api/transactions` endpoint with a fully formed request, including the correct `categoryId` and `accountId`.

5. **Confirmation and Feedback:** The agent will confirm the action with the user (_"I've added a 10 rupee expense for 'Chai at Raghavendra Hotel' to your 'Food & Drink' category. Is that correct?"_), ensuring accuracy and providing a seamless user experience.

This will make Strides not just a tool for tracking your progress, but a true partner in helping you achieve your goals.

## 🚀 Recent Updates (December 2024)

### Enhanced Credit Card Payment Management System

We've completely overhauled the expense tracking system to provide sophisticated credit card payment management with advanced analytics and user experience improvements.

#### 🏦 **Backend Enhancements**

**Credit Card Account Model Extensions:**

- Added credit card-specific fields: `minimumPaymentDue`, `paymentDueDate`, `interestRate`, `lastStatementDate`
- Enhanced transaction logic to properly handle credit card expenses (increase debt) vs payments (decrease debt)
- Fixed balance calculations for credit cards where positive balance = debt owed

**Advanced Credit Card Analytics API:**

- `/accounts/{id}/credit-analysis` - Comprehensive credit card analysis endpoint
- `/accounts/{id}/payment-suggestions` - Smart payment recommendations
- Credit utilization calculation and status tracking
- Payment urgency detection (overdue, due soon, normal)
- Minimum payment vs recommended payment analysis

**Enhanced Transfer Logic:**

- Automatic detection of credit card payments in transfer system
- Added `isCreditCardPayment` flag to transaction records
- Improved transaction descriptions for credit card payments
- Support for overpayment scenarios (creating credit balance)

#### 💻 **Frontend User Experience Improvements**

**Smart Transfer Form:**

- **Automatic Credit Card Detection**: Detects when transferring to credit cards
- **Real-time Payment Analysis**: Shows current debt, remaining debt after payment, available credit
- **Payment Urgency Alerts**: Visual indicators for overdue/due soon payments with color coding
- **Credit Utilization Display**: Real-time utilization percentage with status colors
- **Quick Payment Options**: Smart buttons for minimum due, recommended amount, and full balance
- **Overpayment Support**: Allows payments exceeding debt (creates credit balance)

**Enhanced Balance Summary:**

- **Detailed Account Breakdowns**: Shows individual account balances within summary cards
- **Credit Card Utilization**: Visual utilization bars and percentages for each credit card
- **Country-wise Organization**: Separate sections for India and USA accounts
- **Smart Color Coding**: Green for assets, red for debts, with intensity based on urgency
- **Account Type Icons**: Visual indicators (💳 credit cards, 🏦 banks, 📱 e-wallets, 💵 cash)

**Transaction List Improvements:**

- **Credit Card Payment Icons**: 💳 icon for easy identification
- **Enhanced Descriptions**: Clear "Credit Card Payment" labeling
- **Better Balance Display**: Proper debt representation for credit cards

#### 🎯 **Smart Analytics Features**

**Credit Utilization Tracking:**

- Real-time utilization percentage calculation
- Color-coded status: Good (0-30%), Moderate (30-70%), High (70-90%), Critical (90%+)
- Visual progress bars for quick assessment

**Payment Intelligence:**

- **Minimum Payment Detection**: Automatically identifies minimum due amounts
- **Recommended Payment Calculation**: Suggests optimal payment amounts
- **Payment Impact Analysis**: Shows how payments affect utilization and debt
- **Due Date Tracking**: Alerts for overdue and upcoming due dates

**Financial Health Indicators:**

- Payment urgency levels with visual alerts
- Credit limit monitoring and warnings
- Debt-to-limit ratio tracking
- Available credit calculations

#### 🔧 **Technical Improvements**

**Service Layer Enhancements:**

- `creditCardService.ts` - Centralized credit card logic and calculations
- Utility functions for currency formatting, date calculations, and status determination
- Error handling for failed credit card analysis requests

**Type Safety & Validation:**

- Extended TypeScript interfaces for credit card data
- Enhanced form validation for payment scenarios
- Proper error handling and user feedback

**Code Organization:**

- Modular service architecture for better maintainability
- Reusable utility functions across components
- Clean separation of concerns between UI and business logic

#### 📊 **User Interface Highlights**

**Visual Design Improvements:**

- Gradient backgrounds for credit card sections (purple to blue)
- Intuitive color schemes: red for debt, green for assets, blue for neutral
- Responsive grid layouts for all screen sizes
- Professional card-based UI with proper spacing and typography

**User Experience Enhancements:**

- Loading states with animated indicators
- Error handling with user-friendly messages
- Quick action buttons for common payment amounts
- Real-time updates as user types payment amounts

#### 🧪 **Testing & Quality Assurance**

**Comprehensive Test Coverage:**

- `test_credit_card_logic.py` - Core credit card transaction logic
- `test_credit_card_payment_logic.py` - Transfer and payment functionality
- `test_enhanced_credit_card_features.py` - Advanced analytics and suggestions
- Validation of balance calculations, payment scenarios, and edge cases

#### 🚀 **What's Next**

**Planned Features:**

- Payment scheduling and automatic reminders
- Credit score impact analysis
- Payoff timeline calculations
- Interest rate optimization suggestions
- Budget integration for payment planning
- Advanced analytics dashboard

---

### 🏖️ **Trip Management System**

A comprehensive trip expense management system designed for group trips with proper budget tracking, participant contributions, and fair settlement calculations.

#### 🎯 **Core Features**

**Trip Creation & Management:**

- Create trips with destinations, dates, and participant management
- Real-time trip status tracking (Planning, Active, Completed)
- Collapsible participant lists with contribution tracking
- Payment method tracking per participant (Cash, PhonePe, GooglePay, Bank Transfer)

**Advanced Expense Tracking:**

- **Three-tier transaction system** for comprehensive expense management:
  - 💸 **Leader Expenses**: Paid from central budget (reduces available funds)
  - 💰 **Participant Contributions**: Money added to central budget
  - 💳 **Participant Out-of-Pocket**: Individual expenses (tracked separately for settlement)

**Smart Budget Management:**

- **Central Budget Tracking**: Real-time balance of contributions vs leader expenses
- **Budget Usage Progress**: Visual indicators and percentage tracking
- **Overspend Protection**: Alerts when budget limits are exceeded
- **Participant Settlement Summary**: Individual contribution tracking for fair settlement

#### 💼 **Advanced Trip Features**

**Participant Management:**

- Add/remove participants with initial contribution tracking
- Edit participant details and payment methods
- Automatic participant creation during transaction logging
- Real-time contribution updates for all participants

**Transaction Logger:**

- **Multi-category Support**: Food, Transport, Accommodation, Entertainment, Shopping, Fuel, Medical, Miscellaneous
- **Smart Transaction Types**: Automatic UI adaptation based on transaction type
- **Participant Selection**: Dropdown for selecting who paid/contributed
- **Real-time Balance Updates**: Instant budget and settlement calculations
- **Transaction History**: Complete audit trail with timestamps
- **Delete Functionality**: Remove incorrect transactions with automatic balance correction

**Budget Overview Dashboard:**

- **Real-time Financial Health**: Central budget balance and usage statistics
- **Participant Contribution Tracking**: Individual totals including out-of-pocket expenses
- **Smart Color Coding**: Green for available funds, red for overspend, blue for out-of-pocket
- **Progress Visualization**: Budget usage bars and percentage indicators
- **Settlement Preview**: Pre-settlement calculation display

#### 🔧 **Technical Implementation**

**Backend Architecture:**

- **MongoDB Integration**: Efficient trip and transaction storage
- **Real-time Updates**: Automatic balance calculations and participant tracking
- **Data Consistency**: Built-in safeguards against negative balances
- **Transaction Validation**: Comprehensive input validation and error handling

**Frontend Experience:**

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time UI Updates**: Instant feedback for all user actions
- **Smart Form Validation**: Prevents common input errors
- **Progressive Enhancement**: Graceful fallbacks for network issues

**Data Integrity Features:**

- **Automatic Consistency Checks**: Built-in data validation and correction
- **Negative Balance Protection**: Prevents participant contributions from going negative
- **Transaction Audit Trail**: Complete history of all financial activities
- **Settlement Calculation**: Accurate final settlement based on all contributions

#### 📊 **Settlement System**

**Fair Settlement Calculation:**

- **Individual Tracking**: Each participant's total contributions (initial + out-of-pocket)
- **Expense Distribution**: Fair division of all trip expenses among participants
- **Settlement Preview**: Real-time calculation of who owes what
- **Data Consistency Tools**: Built-in tools to fix any data inconsistencies

**Payment Method Integration:**

- **Multi-payment Support**: Cash, digital payments, bank transfers
- **Payment History**: Complete record of all payment methods used
- **Contribution Tracking**: Separate tracking for different payment methods

#### 🎨 **User Experience Highlights**

**Intuitive Interface:**

- **Color-coded Transactions**: Visual differentiation between transaction types
- **One-click Actions**: Quick access to common operations
- **Progressive Disclosure**: Advanced features available when needed
- **Contextual Help**: Built-in guidance for complex operations

**Mobile Optimization:**

- **Touch-friendly Design**: Optimized for mobile interaction
- **Responsive Layout**: Adapts to all screen sizes
- **Offline Capability**: Basic functionality available without internet
- **Fast Loading**: Optimized for mobile networks

**Real-time Collaboration:**

- **Live Updates**: Changes reflect immediately for all users
- **Conflict Resolution**: Automatic handling of concurrent edits
- **Audit Trail**: Complete history of who made what changes
- **Permission Management**: Leader-controlled access to sensitive operations

#### 🔒 **Security & Privacy**

**Data Protection:**

- **User-specific Access**: Each trip belongs to its creator
- **Secure Authentication**: Token-based authentication system
- **Data Validation**: Comprehensive input sanitization
- **Privacy Controls**: Participant data protection

**Financial Security:**

- **Transaction Integrity**: Cryptographic verification of all transactions
- **Balance Protection**: Multiple layers of balance validation
- **Audit Logging**: Complete record of all financial operations
- **Error Recovery**: Automatic correction of data inconsistencies

---

## TODO

- [Unleash the power of Scroll-Driven Animations](https://youtube.com/playlist?list=PLNYkxOF6rcICM3ttukz9x5LCNOHfWBVnn&si=MybKEWtsqfeOon-q)
- [scroll-driven animations style](https://scroll-driven-animations.style/) & [article on it](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)

## 🎨 **Theme Customization Guide**

### **Quick Theme Color Changes**

**Main File:** `frontend/src/index.css` (lines 11-35)

#### **How to Customize Colors:**

1. **Open** `frontend/src/index.css`
2. **Find** the CSS custom properties section (lines 11-35)
3. **Edit** RGB values (format: `R G B` without commas)
4. **Save** - changes apply instantly in the browser!

#### **Color Variables Explained:**

**Light Mode (`:root`):**

```css
--bg-primary: 248 250 252; /* Main page background */
--bg-secondary: 241 245 249; /* Sidebar, secondary areas */
--bg-card: 255 255 255; /* Cards, modals, forms */
--text-primary: 15 23 42; /* Main text color */
--text-secondary: 71 85 105; /* Labels, subtitles */
--text-muted: 148 163 184; /* Placeholders, disabled text */
--border: 226 232 240; /* Element borders */
```

**Dark Mode (`:root.dark`):**

```css
--bg-primary: 15 23 42; /* Main page background (dark) */
--bg-secondary: 30 41 59; /* Sidebar (darker) */
--bg-card: 51 65 85; /* Cards (lighter than background) */
--text-primary: 248 250 252; /* Main text (light) */
--text-secondary: 203 213 225; /* Secondary text (light gray) */
--text-muted: 100 116 139; /* Muted text (medium gray) */
--border: 71 85 105; /* Borders (subtle but visible) */
```

#### **Common RGB Colors for Experimentation:**

```
White: 255 255 255          Slate Blue: 100 116 139
Black: 0 0 0                Navy: 15 23 42
Blue: 59 130 246            Purple: 147 51 234
Green: 34 197 94            Red: 239 68 68
Orange: 249 115 22          Yellow: 234 179 8
Pink: 236 72 153            Teal: 20 184 166
```

#### **Example Customizations:**

**🌊 Ocean Theme:**

```css
:root {
  --bg-primary: 240 249 255; /* Light blue */
  --bg-secondary: 219 234 254; /* Lighter blue */
  --bg-card: 255 255 255; /* White cards */
  --text-primary: 12 74 110; /* Dark blue text */
}

:root.dark {
  --bg-primary: 12 74 110; /* Deep ocean blue */
  --bg-secondary: 30 58 138; /* Royal blue */
  --bg-card: 59 130 246; /* Bright blue cards */
  --text-primary: 240 249 255; /* Light blue text */
}
```

**🌿 Forest Theme:**

```css
:root {
  --bg-primary: 240 253 244; /* Light green */
  --text-primary: 6 78 59; /* Dark green */
}

:root.dark {
  --bg-primary: 6 78 59; /* Forest green */
  --text-primary: 240 253 244; /* Light green text */
}
```

### **Advanced Customization:**

#### **Component-Level Changes:**

- Most components use theme utility classes: `theme-bg-card`, `theme-text-primary`, etc.
- For specific component styling, edit the component files directly

#### **Key Theme Files:**

1. **`src/index.css`** - Main theme colors (START HERE)
2. **`src/utils/theme.ts`** - Theme utility functions
3. **`src/context/ThemeContext.tsx`** - Theme switching logic
4. **`src/components/ThemeToggle.tsx`** - Theme toggle button

### **Testing Your Changes:**

1. **Save** `src/index.css`
2. **Switch** between light/dark mode using the sun/moon button
3. **Check** the debug indicator in top-right corner
4. **Verify** text is readable in both modes

---

## 🚀 **Recent UX Modernization (Phase 1 & 2 Complete)**

### **✅ Completed Upgrades:**

#### **Phase 1: Modern UI Components & Animations**

- ✅ Upgraded to modern libraries: `phosphor-react`, `framer-motion`, `@radix-ui/react-*`
- ✅ Replaced all Lucide icons with Phosphor icons
- ✅ Enhanced Button, Dialog, Skeleton components with accessibility
- ✅ Added micro-interactions and loading states
- ✅ Improved form components with better UX

#### **Phase 2: Dark/Light Theme System**

- ✅ Implemented comprehensive theme system using CSS custom properties
- ✅ Created ThemeContext with localStorage persistence
- ✅ Added animated ThemeToggle component
- ✅ Applied theme support to all major components
- ✅ Fixed TypeScript errors and optimized imports

### **📁 Modified Files:**

```
frontend/src/
├── index.css                    # 🎨 MAIN THEME COLORS
├── utils/theme.ts               # Theme utilities
├── context/ThemeContext.tsx     # Theme logic
├── components/
│   ├── ThemeToggle.tsx         # Theme switcher
│   ├── ui/
│   │   ├── Button.tsx          # Modern button component
│   │   ├── Dialog.tsx          # Accessible dialogs
│   │   └── Skeleton.tsx        # Loading skeletons
│   ├── Header.tsx              # Updated with theme toggle
│   ├── TaskItem.tsx            # Enhanced with animations
│   ├── TaskList.tsx            # Modern task management
│   ├── Modal.tsx               # Theme-aware modals
│   ├── AddTaskForm.tsx         # Styled forms
│   ├── AddCategoryForm.tsx     # Consistent styling
│   ├── EditForm.tsx            # Theme support
│   ├── ConfirmationDialog.tsx  # Accessible dialogs
│   ├── todos/
│   │   ├── TodoCard.tsx        # Enhanced todo items
│   │   └── TodoView.tsx        # Modern kanban board
│   └── expenses/
│       ├── CategoryManager.tsx  # Expense management
│       ├── TransactionForm.tsx  # Form improvements
│       ├── TransactionList.tsx  # List styling
│       └── ExpensesView.tsx     # Overview page
├── pages/
│   ├── App.tsx                 # Theme provider setup
│   ├── Dashboard.tsx           # Navigation tabs
│   ├── AuthPage.tsx            # Login/signup forms
│   ├── TaskView.tsx            # Task management
│   ├── MonthlyView.tsx         # Calendar view
│   └── ExpensesView.tsx        # Expense tracking
└── types/index.ts              # Updated interfaces
```

### **🎯 Next Phase: User Color Customization (Phase 3)**

Ready to implement:

- Color picker components for categories and todos
- User-specific color preferences
- Advanced theme customization UI
- Color accessibility validation

---

## Tools to refer later

- [You can now go from GitHub README to working MVP with a single prompt in Cursor](https://www.linkedin.com/posts/eric-vyacheslav-156273169_you-can-now-go-from-github-readme-to-working-ugcPost-7340332667403411457-xNTJ?utm_source=share&utm_medium=member_desktop&rcm=ACoAACPeyxkBonrLXm1cT_CSwVkX1QTcKmY9BK0)

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

#### Todo Timestamp Tracking - frontend

- **Smart Time Tracking for Todo Items**: Implemented comprehensive timestamp tracking to show accurate creation dates and status-based time messages.
- **Fixed Creation Date Bug**: Resolved issue where todos showed current date instead of actual creation date by properly persisting `createdAt` timestamps.
- **Status-Based Time Messages**: Added intelligent time display that shows different messages based on todo status:
  - "Created X ago" for new todos
  - "In progress since X" for active todos
  - "Done in X days" for completed todos
- **Enhanced Todo Types**: Updated `TodoItem` interface to include `inProgressAt` and `completedAt` timestamp fields for precise status change tracking.
- **Date Utility Functions**: Created comprehensive date utilities in `utils/date.ts`:
  - `getTimeAgo()`: Converts timestamps to human-readable relative time
  - `getDaysBetween()`: Calculates duration between dates
  - `getTodoStatusMessage()`: Generates smart status messages based on todo state and timestamps
- **Enhanced TodoCard Component**: Updated todo cards to display both creation date and dynamic status messages with graceful fallbacks for legacy data.
- **Optimistic UI Updates**: Enhanced drag-and-drop functionality to immediately update timestamps when todos change status.
- **Legacy Data Handling**: Added frontend graceful handling for todos missing timestamp data with appropriate fallback messages.
  - Open src/data/mockTasks.ts and replace its contents.

#### Jira-Style Todo Detail Sidebar - Frontend

- **Comprehensive Todo Detail View**: Implemented a professional sidebar interface similar to Jira's task detail view for in-depth todo management.
- **Click-to-View Details**: Added click handler to todo cards to open detailed view without interfering with drag-and-drop functionality.
- **Full Todo Information Display**:
  - Complete todo details including title, notes, and status
  - Color-coded status badges with real-time updates
  - Comprehensive timeline showing creation, start, and completion dates
  - Activity log history with timestamps and relative time display
- **Inline Editing Capabilities**:
  - Edit todo title, notes, and status directly in the sidebar
  - Real-time form validation and optimistic UI updates
  - Automatic timestamp handling for status transitions
  - Smart status dropdown with visual indicators
- **Enhanced Activity Log Management**:
  - View all todo logs in reverse chronological order
  - Add new activity logs with rich text notes
  - Timeline view with precise timestamps and human-readable relative time
  - Activity indicators and visual hierarchy
- **Professional User Interface**:
  - Right-side sliding panel design consistent with modern task management tools
  - Smooth open/close animations with backdrop click handling
  - Responsive design that adapts to different screen sizes
  - Dark theme integration matching the existing application design
- **Smart Event Handling**:
  - Proper event separation between card clicks, drag handles, and action buttons
  - Drag-and-drop functionality preserved while adding detail view access
  - Action buttons (edit, log, delete) use `stopPropagation()` to prevent sidebar opening
  - Touch-friendly design for mobile and tablet devices
- **Enhanced Backend Integration**:
  - Added `GET /todos/{todo_id}` endpoint for individual todo retrieval
  - Created `getTodoById()` service function for detailed todo fetching
  - Integrated with existing update, delete, and log management APIs
- **Component Architecture**:
  - `TodoDetailSidebar.tsx`: Main sidebar component with full editing capabilities
  - Updated `TodoCard.tsx`: Added click handler with proper event management
  - Updated `KanbanColumn.tsx`: Propagated detail view handler through component hierarchy
  - Updated `TodoView.tsx`: Integrated sidebar state management and API coordination

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

#### Default "Inbox Category"

- Implementing a global "Add Task" button that adds tasks to a default "Uncategorized/Inbox" category, creating it if the user isn't sure to which category the task belongs to.
- Improve the user workflow by adding a default "Uncategorized" category.This will lower the barrier for users to add tasks, as they won't have to decide on a category immediately. They can capture their thoughts quickly and organize them later.
  - Add a `Global "Add Task"` Button: We'll add a main, prominent button to the Dashboard header area.
  - Create a New Modal State: This button will trigger its own modal, separate from the ones inside each category list.
  - Update the handleAddTask Logic: We'll make this function smarter. It will check if a default category (e.g., "Inbox") exists. If not, it will create it. Then, it will add the new task to that "Inbox" category.
  - `This will be a much smoother and more intuitive experience for the user.`
- `Advanced Task Creation and Editing` :
  - Upgrading our forms to allow selecting a category when creating a task and editing notes when updating a task.
  - Enhance the Global "Add Task" Modal: Instead of always adding to a default category, give the user a dropdown of their existing categories, with the default ("Inbox") as the first option.
  - Enhance the "Edit Task" Modal: Allow the user to edit not just the task's name and category, but also its notes.
    - Update the AddTaskForm Component : We'll add a category dropdown to this form. It will be optional and will only show up if a list of categories is provided.

#### Implementing the Monthly Calendar View : Task-Centric

- Adding a monthly progress view to the "Strides" application.
- The Monthly View UI : Now, we'll build the frontend components to display the calendar.
- `Update` the taskService.ts : Add a new function to `call our new backend endpoint`.Add the `getMonthlyHistory` function.
- Create the MonthlyView Component : main new component for our feature - In your src/pages/ folder, create a new file named `MonthlyView.tsx`.
- Update Dashboard.tsx to Include Tabs: Now, we'll add the view switcher to your main dashboard page.
  - Open src/pages/Dashboard.tsx.Add a new state for the current view and the MonthlyView component.

#### Allowing Edits to Past Check-ins

- Allowing existing users to modify check-ins for past days, while restricting new users.
- Update the Dashboard.tsx Component, We need to pass the isNewUser state down to our list components.Find where the `<TaskList>` component is rendered inside the .map() function.Add the isNewUser prop to it.
- Update the TaskList.tsx Component : Now, we need to accept the isNewUser prop in the TaskList and pass it further down to each TaskItem , Update the TaskListProps interface to include isNewUser.Pass the prop down to the `<TaskItem>` component.
- Update the TaskItem.tsx Component (The Main Fix). We update the logic on the check-in button itself. Update the TaskItemProps interface to include isNewUser.Find the check-in `<button>` and modify its disabled attribute.

#### Daily Logs for Tasks - Frontend

- Implementing a journaling feature that allows users to add daily notes to each of their tasks.
- `First, we need to update our data structures to support daily logs.`
- `Update Frontend Types`: Open src/types/index.ts to mirror the backend changes.
- Frontend Implementation : Now, we'll build the UI for viewing and editing these logs.
- Create the `DailyLogModal` Component: This new component will be the main interface for our feature.In src/components/, create a new file named DailyLogModal.tsx
- Update TaskItem.tsx to Include Log Button - Add a MessageSquare icon and an onOpenLog prop.
- Update TaskList.tsx to Relay Props - Update the TaskListProps interface and pass the new onOpenLog prop to `<TaskItem>`
- Update Dashboard.tsx with Final Logic: Finally, we integrate the new modal and its logic into our main dashboard. - Add the new state and handlers for the daily log feature.

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

### IMprove UX step by Step

```bash
# 1. Replace lucide-react with Phosphor Icons + Enhanced Animations
# Phosphor icons offer more variants and better consistency:
pnpm remove lucide-react // todo
pnpm add phosphor-react motion
# 2. Add Modern UI Components with Radix UI
# For better accessibility and polished components:
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-accordion @radix-ui/react-select @radix-ui/react-switch
# 3. Enhanced Animations and Micro-interactions
pnpm add motion @headlessui/react
# 4. Better Loading States and Skeletons
pnpm add react-loading-skeleton
```

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

- To support the new frontend models must also be updated.
- In backend/models/task_models.py.Add a `TaskHistory` model and update the `Task` model to use it.

#### Include the optional notes field in our Pydantic models

#### Implementing the Monthly Calendar View-Backend

- Adding a monthly progress view to the "Strides" application.
- `The Smart History API`: First, we need to create a new, efficient API endpoint that can fetch task history for a specific month.
- `Add a New Route` to routes/tasks.py . Open backend/routes/tasks.py and add the following new endpoint to the bottom of the file. This endpoint will use a powerful MongoDB aggregation query to fetch only the relevant data.

#### Daily Logs for Tasks - Backend

- Implementing a journaling feature that allows users to add daily notes to each of their tasks.
- `First, we need to update our data structures to support daily logs.`
- `Update Backend Models`: Open backend/models/task_models.py and add a new `DailyLog` model, then `update` the Task model to include a list of these logs.

#### Todo Timestamp Tracking - Backend

- **Comprehensive Timestamp Management**: Implemented proper timestamp tracking for todo items to fix creation date persistence issues.
- **Enhanced Todo Models**: Updated `TodoItem` model in `todo_models.py` to include:
  - `createdAt`: Automatically set when todo is created
  - `inProgressAt`: Timestamp when todo moves to "In Progress" status
  - `completedAt`: Timestamp when todo is marked as "Done"
  - Proper field serializers for consistent ISO format timestamps
- **Fixed Creation Endpoint**: Corrected POST `/todos/` endpoint to properly persist all required fields:
  - Ensures `createdAt` is set during todo creation
  - Initializes proper status and empty logs array
  - Prevents "created just now" bug for new todos
- **Smart Status Update Logic**: Enhanced PUT `/todos/{id}` endpoint with automatic timestamp setting:
  - Automatically sets `inProgressAt` when status changes to "In Progress"
  - Automatically sets `completedAt` when status changes to "Done"
  - Respects frontend-provided timestamps when available
- **Database Document Transformation**: Added `todo_from_db()` helper function to properly handle MongoDB document conversion:
  - Converts `_id` to `id` field for frontend compatibility
  - Includes fallback logic for missing timestamps using ObjectId creation time
  - Ensures robust data handling across all endpoints
- **Auto-Migration System**: Implemented automatic migration for existing todos:
  - GET endpoint auto-migrates todos missing `createdAt` field
  - Uses ObjectId generation time as accurate creation timestamp
  - Provides seamless experience for existing users
- **Migration Tools**: Created comprehensive migration utilities:
  - `migrate_todos.py`: Standalone script for bulk data migration
  - Admin migration endpoint for manual user-specific migration
  - Fallback handling in all routes for missing timestamp data
- **Data Integrity**: Enhanced error handling and validation:
  - Proper null checks and error responses
  - Consistent timestamp formatting across all endpoints
  - Maintains backward compatibility with existing data

#### Jira-Style Todo Detail Sidebar - Backend Enhancement

- **Individual Todo Retrieval**: Added `GET /todos/{todo_id}` endpoint to fetch specific todo items by ID for detailed view functionality.
- **Enhanced API Coverage**: Completed the REST API suite for todos with individual item access supporting the frontend detail sidebar feature.
- **User-Scoped Access**: Endpoint ensures users can only access their own todos with proper authentication and authorization checks.
- **Error Handling**: Comprehensive validation for todo ID format and existence with appropriate HTTP status codes (400 for invalid ID, 404 for not found).
- **Integration Ready**: Seamless integration with existing frontend `todoService.ts` through new `getTodoById()` function.
- **Security**: Maintains the same security model as other todo endpoints with user authentication and data isolation.

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

## Build AI Agents using LangGraph,Langchain-ecosystem

[Install Langchain packages reference guide](https://python.langchain.com/docs/how_to/installation/)

```bash
# Install the necessary packages to build AI Agents
(backend)
abhis@Tinku MINGW64 ~/Desktop/Strides/backend (main)
$ uv add langgraph langchain_core langchain_community langsmith langchain-google-genai langchain langchain[google-genai] pydantic
```

### Create a simple agent and connect it to frontend

- Backend :
  - create a new file -> backend/routes/agent.py : This file will contain the API endpoint for your AI agent.
  - Update backend/main.py to include the new router
- Frontend :
  - Create a new file frontend/src/services/agentService.ts : This service will handle communication with your new backend agent endpoint.
  - Create a new component frontend/src/components/AIAgent.tsx: This component will provide the UI for interacting with the AI agent.
  - Add the AIAgent component to your Dashboard.tsx page

## Adding Expense Tracker

- Refactoring the Dashboard for new features

- Feature Roadmap: A comprehensive expense, income, and transfer tracking system designed for personal financial management.

### Key Features

- **Transaction Management:** Log expenses, income, and transfers.
- **Customizable Categories:** Pre-defined default categories with the ability for users to create their own main and sub-categories.
- **Account Management:** Track balances across various payment methods (bank accounts, credit cards, cash, e-wallets).
- **Detailed Records:** Add notes and attach receipts or invoices to each transaction.
- **Currency Support:** User-selectable currency for financial tracking.

### 2. Data Models (Backend & Frontend)

#### `Transaction` Model

- `id`: string (unique identifier)
- `userId`: string
- `type`: 'expense' | 'income' | 'transfer'
- `amount`: number
- `currency`: string (e.g., 'INR', 'USD')
- `date`: Date
- `description`: string (brief title)
- `categoryId`: string (links to Category model)
- `subCategoryId`: string (optional)
- `accountId`: string (links to Account model, source of funds)
- `destinationAccountId`: string (for 'transfer' type)
- `notes`: string (max 500 chars)
- `attachments`: string[] (URLs to stored files, max 3)

#### `Category` Model

- `id`: string
- `userId`: string
- `name`: string (e.g., "Food and Dining")
- `isDefault`: boolean
- `subcategories`: { id: string, name: string }[]

#### `Account` Model

- `id`: string
- `userId`: string
- `name`: string (e.g., "ICICI Debit Card", "Cash")
- `type`: 'bank_account' | 'credit_card' | 'cash' | 'e_wallet'
- `balance`: number
- `provider`: string (e.g., "HDFC", "PayPal", "Visa")

### 3. Frontend Component Plan

1. **`AddTransactionForm.tsx`**: A comprehensive form to add expenses, income, or transfers.
2. **`TransactionList.tsx`**: Displays a list of recent transactions.
3. **`AccountList.tsx`**: Shows all user-created accounts and their current balances.
4. **`CategoryManager.tsx`**: A view where users can add, edit, or delete their custom categories.
5. **`ExpensesDashboard.tsx`**: A high-level view with charts and summaries (e.g., spending by category).

### 4. Backend API Endpoints

- `/api/transactions` (POST, GET, PUT, DELETE)
- `/api/accounts` (POST, GET, PUT, DELETE)
- `/api/categories` (POST, GET, PUT, DELETE)
- `/api/uploads` (POST for handling attachments)

---

#### Expense Tracker Development Roadmap

Phase 1: Account Management (The Foundation)

`Backend:`
Create the Account data model in Python.
Build API endpoints (/api/accounts) to create (POST) and fetch (GET) accounts.
Implement logic to create a default "Cash" account for new users.
`Frontend:`
We will create the UI for users to add and view their accounts.

This involves four steps:

Create a service file to handle all API requests for accounts.
Create an AddAccountForm.tsx component.
Create an AccountList.tsx component to display the user's accounts and their balances.
Update ExpensesView.tsx to fetch accounts and conditionally show the AddAccountForm or the main transaction interface.

**Phase 2:** Transaction Logging (The Core)

`Backend:`
Create the Transaction data model.
Build the API endpoint (POST /api/transactions) to save new transactions.
Crucially, this endpoint must update the balance of the affected account(s).
`Frontend:`
Evolve AddExpenseForm.tsx into a comprehensive AddTransactionForm.tsx.
It will have tabs/selectors for Expense, Income, and Transfer.
The form fields will dynamically change based on the selected transaction type.
The "Account" dropdowns will be populated from the accounts created in Phase 1.

- Let's begin Phase 2 by building the backend foundation for logging transactions.

This involves three key steps:

Defining the data models for a transaction.
Creating the API route to handle transaction creation.
Updating the main application to include the new route.

- Implementing hierarchical and custom categories is a powerful feature that will make the tracker much more organized and personal. Let's build this step-by-step, starting with the backend.
  - Let's automatically create a set of default categories for every new user when they register. This gives them a great starting point for tracking their expenses immediately.
  - Let's build a "Category Manager" that allows users to create new main categories and add sub-categories to them. We'll integrate this into the "Manage Accounts" section.
  - `pnpm install date-fns`

Phase 3: Displaying Transactions (The Feedback Loop)

`Backend:`
Build the API endpoint (GET /api/transactions) to fetch all recent transactions.
`Frontend:`
Create a TransactionList.tsx component.
Each item in the list will display the key details: category icon/name, amount, note, date, and the account used.

## Git Workflow Tips

### How to Undo the Last Commit

This guide explains how to remove the most recent commit from both your local and remote repositories.

**🚨 Important Warning:** This action rewrites the history of your remote branch. If other people have pulled the commit you are about to delete, this can cause significant problems for them. Proceed with caution, especially on a shared branch like `main`.

#### Step 1: Undo the Last Commit Locally

You have two options for resetting your local branch:

- **To discard the commit AND all its changes (destructive):**
  This will permanently delete the changes from that commit.

  ```bash
  git reset --hard HEAD~1
  ```

- **To discard the commit BUT keep the changes (safe):**
  This is useful if you want to re-apply the changes later. The changes will be moved to your working directory as unstaged files.

  ```bash
  git reset --soft HEAD~1
  ```

#### Step 2: Push the Change to the Remote Repository

After resetting your local branch, you must update the remote branch. Because you've changed the history, a normal push will be rejected, so you must force push.

Replace `<branch-name>` with the name of your branch (e.g., `main`).

```bash
git push origin <branch-name> --force-with-lease
```

**Note:** Using `--force-with-lease` is strongly recommended over a plain `git push --force`. It's a safer command that checks if another developer has pushed new commits to the remote branch since you last fetched. If new commits are found, the push will fail, preventing you from accidentally
