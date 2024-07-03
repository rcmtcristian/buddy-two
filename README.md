![image](https://github.com/rcmtcristian/buddy-two/assets/20276785/ea2a3e8a-591e-4b1a-abe9-7ec31a193562)

# TvBuddy

TvBuddy is an interactive three.js demo that combines the power of three.js, Vercel, Next.js, TypeScript, and Firebase to create an engaging and immersive TV experience. With TvBuddy, users can explore a variety of interactive 3D scenes and environments, bringing their TV viewing to a whole new level.

## Features

- Interactive 3D scenes: TvBuddy allows users to navigate and interact with captivating 3D scenes.
- Next.js and TypeScript: TvBuddy is built using Next.js, a powerful React framework, and TypeScript, which adds static typing to JavaScript for enhanced development productivity and code reliability.
- Vercel deployment: The TvBuddy demo is deployed on Vercel, a cloud platform for static websites, ensuring a seamless and reliable hosting experience.

## Lessons Learned

Throughout the development of TvBuddy, I gained valuable insights and learned several important lessons, including:

- Efficient code organization: I explored techniques to make the codebase more maintainable and scalable, following the DRY (Don't Repeat Yourself) principle to avoid duplication and improve code reusability.
- Lerp: Stands for linear interpolation. It is a mathematical technique used to interpolate values between two endpoints in a linear fashion. In three.js, lerp is commonly used to animate objects smoothly between two positions, colors, or other numeric properties.

## Tech Stack

TvBuddy is built using the following technologies:

- Three.js: A JavaScript library used for creating and rendering 3D graphics in the browser.
- Vercel: A cloud platform for static websites that provides easy deployment and scalability.
- Next.js: A React framework that enables server-side rendering, routing, and other powerful features.
- TypeScript: A statically typed superset of JavaScript that enhances code reliability and development productivity.
- Firebase: A platform that offers various cloud services, including real-time database capabilities, utilized in TvBuddy for data synchronization.

## Project Structure

The TvBuddy project consists of the following main components:

- `src/`: Contains the source code for the TvBuddy application.
- `public/`: Contains static assets such as images, stylesheets, and other resources.
- `pages/`: Contains Next.js pages that define the application's routes and views.
- `components/`: Contains reusable React components used throughout the application.
- `utils/`: Contains utility functions and helper modules used in TvBuddy.

## Getting Started

To run TvBuddy locally, follow these steps:

1. Clone the TvBuddy repository: `git clone https://github.com/your-username/buddy-two.git`
2. Navigate to the project directory: `cd tvbuddy`
3. Install the project dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser and visit `http://localhost:3000` to access TvBuddy.

## Optimizations

During the development of TvBuddy, I identified several areas for optimization, including:

- Give it an intro animation: Create an engaging intro animation for TvBuddy that introduces the concept and features of the interactive TV experience. This animation could involve camera movements, object animations, or any creative approach that captures the user's attention.

- Find the functions that make the frame rate work properly across all screens: Ensure that the animation plays at a consistent speed and smooth frame rate across different devices and screen resolutions. Optimize performance by adjusting the rendering settings, optimizing code, and testing the application on various devices to ensure a consistent experience for all users.

- Add custom mouse: Implement a custom mouse cursor that fits the theme and style of TvBuddy. Customize the cursor's appearance, behavior, and interactions to enhance the overall user experience.

- Make an animation for the face of the screen: Create an animation for the screen's face, adding life and personality to TvBuddy. This animation could involve facial expressions, movements, or subtle interactions that make the screen more engaging and relatable to the user.

- Add sound for when it boots: Enhance the user experience by adding sound effects that play when TvBuddy boots up or transitions between scenes. Consider using appropriate audio cues to create a more immersive environment and evoke the feeling of interacting with a real TV device.

- Add interaction and annoyance: Implement interactive behavior for TvBuddy, allowing the user to interact with the screen. For example, when the user clicks on the screen repeatedly, TvBuddy could exhibit signs of annoyance, such as shaking or displaying playful reactions. Look into ray casting to detect mouse clicks and perform actions based on the interaction.

- Create a better environment: Improve the environment in which TvBuddy exists. This could involve adding realistic textures, lighting effects, or incorporating a virtual room or setting that complements the interactive TV experience. Enhance the overall atmosphere to create a more immersive and visually captivating environment.

# Credits 

Invaluable lessons were learned, and I would like to acknowledge the Teachings of the following individuals and resources:

- Basement Studio: [GitHub](https://github.com/basementstudio) for providing valuable insights and lessons learned in three.js development and interactive experiences.
- Basement Studio: [Twitch](https://www.twitch.tv/basementdotstudio) for their informative live streams and demonstrations on three.js and related topics.

Thank you to Basement Studio for their valuable contributions to the development of TvBuddy, and for sharing their knowledge and expertise in the field of three.js and interactive experiences.
