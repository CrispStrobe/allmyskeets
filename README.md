# All My Skeets

A web application for viewing, searching, basic analyzing, and exporting posts from a Bluesky user account. Inspired by the functionality of `allmytweets` for X (formerly Twitter).

This tool allows you to load an entire feed, including replies and threads, and then apply advanced filters, sort the results, view analytics, and export the data in various formats.

---

## Core Features

-   **Complete Feed Loading**: Fetch an entire user feed, including replies, with "Load More" and "Load All" options.
-   **Threaded Conversations**: Replies are visually grouped under their parent posts with connecting lines for easy reading.
-   **Smart Search**: Find users easily with an autocomplete search bar that suggests users as you type.
-   **Analytics Dashboard**: Switch to an analytics view to see:
    -   Key metrics (total posts, likes, reposts).
    -   Average engagement per post.
    -   Posting activity by hour.
    -   Top-performing post by likes.
-   **Advanced Filtering**: Sift through loaded posts with a set of filters:
    -   Full-text search.
    -   Hide replies.
    -   Hide mere reposts.
    -   Show only posts with images.
    -   Filter by a minimum number of likes.
-   **Flexible Sorting**: Order the feed by Newest, Oldest, Most Liked, Most Reposted, or Top Engagement.
-   **Advanced Exporting**:
    -   Export the currently filtered view or all loaded posts.
    -   Choose between **JSON** (for full data fidelity) and **CSV** (for spreadsheets).

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Bluesky Integration**: [AT Protocol API (`@atproto/api`)](https://github.com/bluesky-social/atproto/tree/main/packages/api)
-   **Deployment**: [Vercel](https://vercel.com/)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/CrispStrobe/allmyskeets.git](https://github.com/CrispStrobe/allmyskeets.git)
    cd allmyskeets
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a new file named `.env.local` in the root of the project and add your Bluesky handle and an App Password.
    ```
    # .env.local
    BLUESKY_HANDLE="your-handle.bsky.social"
    BLUESKY_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
    ```
    > **Note:** App Passwords can be created in your Bluesky Settings under "Advanced". They are safer than using your main password.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push to GitHub:** Ensure your repository is up-to-date on GitHub.
2.  **Import to Vercel:** From your Vercel dashboard, select "Add New... > Project" and import your GitHub repository. Vercel will automatically detect the Next.js framework.
3.  **Add Environment Variables:** In the Vercel project settings, navigate to "Environment Variables" and add your `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD`. This step is crucial for the deployed application to function.
4.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application, providing you with a public URL.

## License

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This project is licensed under the Apache 2.0 License. See the [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) file for details.
