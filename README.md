# Rotating ASCII Cube in React

A React application that renders a rotating 3D cube using ASCII art, without using any prebuilt 3D libraries. The cube is displayed on a dark background and centered on the webpage. This project demonstrates fundamental 3D rendering techniques, including projection, rotation, and basic lighting, all implemented manually in JavaScript.

## Features

- **Wireframe 3D Cube**: Renders a rotating cube by drawing its edges using ASCII characters.
- **ASCII Art**: Utilizes ASCII characters to create a visual representation of the cube.
- **Rotation**: Continuously rotates the cube around the X and Z axes.
- **Basic Lighting**: Simulates lighting to vary the brightness of the cube's edges.
- **No External 3D Libraries**: Built from scratch without using prebuilt 3D or graphics libraries.

## Getting Started

### Prerequisites

- **Node.js** (version 12 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/gugu-py/ascii-cube.git
   cd rotating-ascii-cube
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## How It Works

### 1. Cube Geometry

The cube is defined by eight vertices and twelve edges:

- **Vertices**: Points in 3D space representing the corners of the cube.
- **Edges**: Lines connecting pairs of vertices to form the cube's structure.

### 2. Rotation

Rotations are applied to the cube using rotation matrices around the X and Z axes:

```javascript
const rotateX = (point, angle) => { /* ... */ };
const rotateZ = (point, angle) => { /* ... */ };
```

Angles `A` and `B` are updated over time to animate the rotation.

### 3. Projection

3D points are projected onto a 2D plane using a perspective projection formula:

```javascript
const project3D = (point) => {
  const [x, y, z] = point;
  const factor = K1 / (K2 + z); // Perspective projection
  return [Math.floor((x * factor) + width / 2), Math.floor((y * factor) + height / 2)];
};
```

- **K1**: Scaling factor to control the size of the projection.
- **K2**: Distance from the viewer to the projection plane.

### 4. Drawing Edges

Edges are drawn between projected points using Bresenham's line algorithm:

```javascript
const drawLine = (p0, p1, zbuffer, output, charToPlot, width, height) => { /* ... */ };
```

### 5. Lighting and Brightness

- **Brightness Calculation**: For each edge, the brightness is calculated based on the cube's orientation relative to a light source.
- **ASCII Characters**: Brightness levels are mapped to ASCII characters:

  ```javascript
  const brightnessChars = ".,-~:;=!*#$@";
  ```

## Project Structure

- `src/RotatingCube.js`: Contains the main component that renders the rotating cube.
- `src/App.js`: The main application component.
- `public/index.html`: The HTML template.
- `src/index.css`: Global styles.

## Customization

- **Adjusting Cube Size**: Modify `K1` and `K2` in `RotatingCube.js`.
- **Changing Rotation Speed**: Adjust the increment values of `A` and `B` in the `setInterval` function.
- **Altering Light Direction**: Modify the `lightDir` vector.
- **ASCII Characters**: Customize the `brightnessChars` string to change shading.

## Styling

- **Dark Background**: The application uses a black background to enhance visibility.
- **Centered Content**: The ASCII art is centered on the page.
- **Global Styles**: Ensure the body has no margins and a black background:

  ```css
  body {
    margin: 0;
    padding: 0;
    background-color: black;
  }
  ```

## Dependencies

- **React**: A JavaScript library for building user interfaces.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by [a1k0n's Donut Code](https://www.a1k0n.net/2011/07/20/donut-math.html), which provides an in-depth explanation of rendering 3D objects using ASCII art.

- Thanks ChatGPT for helping me with the code
