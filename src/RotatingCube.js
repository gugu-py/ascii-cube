// RotatingCube.js
import React, { useState, useEffect } from 'react';

// ASCII characters to represent brightness from darkest to brightest
const brightnessChars = " .,-~:;=!*#$@";

const RotatingCube = () => {
  const [asciiArt, setAsciiArt] = useState('');
  const [A, setA] = useState(0);
  const [B, setB] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setA((prevA) => prevA + 0.03);
      setB((prevB) => prevB + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ascii = generateAsciiCube(A, B);
    setAsciiArt(ascii);
  }, [A, B]);

  const generateAsciiCube = (A, B) => {
    // Cube vertices
    const vertices = [
      [-1, -1, -1], // 0
      [1, -1, -1],  // 1
      [1, 1, -1],   // 2
      [-1, 1, -1],  // 3
      [-1, -1, 1],  // 4
      [1, -1, 1],   // 5
      [1, 1, 1],    // 6
      [-1, 1, 1],   // 7
    ];

    // Projection constants
    const K1 = 50; // Adjusted scaling factor
    const K2 = 5;  // Distance to the viewer
    const width = 100;  // Width of ASCII grid
    const height = 100; // Height of ASCII grid

    let zbuffer = Array.from({ length: width * height }, () => -Infinity);
    let output = Array.from({ length: width * height }, () => ' ');

    // Rotation matrices for the X and Y axes
    const rotateX = (point, angle) => {
      const [x, y, z] = point;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return [x, y * cosA - z * sinA, y * sinA + z * cosA];
    };

    const rotateY = (point, angle) => {
      const [x, y, z] = point;
      const cosB = Math.cos(angle);
      const sinB = Math.sin(angle);
      return [x * cosB + z * sinB, y, -x * sinB + z * cosB];
    };

    // Light direction
    const lightDir = [0, 1, -1];

    const project3D = (point) => {
      const [x, y, z] = point;
      const factor = K1 / (K2 + z); // Perspective projection
      return [x * factor + width / 2, -y * factor + height / 2, z];
    };

    const normalize = (v) => {
      const length = Math.hypot(...v);
      return v.map((i) => i / length);
    };

    const dotProduct = (v1, v2) => v1.reduce((sum, val, i) => sum + val * v2[i], 0);

    const calculateBrightness = (normal) => {
      const normalizedNormal = normalize(normal);
      const brightness = dotProduct(normalizedNormal, normalize(lightDir));
      return brightness;
    };

    // Cube faces defined by vertex indices and their normals
    const faces = [
      { indices: [0, 1, 2, 3], normal: [0, 0, -1] }, // Front face
      { indices: [4, 5, 6, 7], normal: [0, 0, 1] },  // Back face
      { indices: [1, 5, 6, 2], normal: [1, 0, 0] },  // Right face
      { indices: [0, 3, 7, 4], normal: [-1, 0, 0] }, // Left face
      { indices: [3, 2, 6, 7], normal: [0, 1, 0] },  // Top face
      { indices: [0, 1, 5, 4], normal: [0, -1, 0] }, // Bottom face
    ];

    for (let face of faces) {
      const { indices, normal } = face;

      // Rotate normal
      let rotatedNormal = rotateX(normal, A);
      rotatedNormal = rotateY(rotatedNormal, B);

      // Back-face culling
      if (rotatedNormal[2] >= 0) continue; // Skip faces facing away from the viewer

      const brightness = calculateBrightness(rotatedNormal);
      if (brightness <= 0) continue; // Skip faces not lit

      const luminanceIndex = Math.floor(brightness * (brightnessChars.length - 1));
      const charToPlot = brightnessChars[luminanceIndex];

      // Rotate and project vertices
      const projectedVertices = indices.map((index) => {
        let vertex = vertices[index];
        vertex = rotateX(vertex, A);
        vertex = rotateY(vertex, B);
        return project3D(vertex);
      });

      // Triangulate the face
      const triangles = [
        [projectedVertices[0], projectedVertices[1], projectedVertices[2]],
        [projectedVertices[0], projectedVertices[2], projectedVertices[3]],
      ];

      // Rasterize triangles
      for (let triangle of triangles) {
        rasterizeTriangle(triangle, zbuffer, output, charToPlot, width, height);
      }
    }

    // Convert the output array into a string for rendering
    return output.map((char, i) => (i % width === width - 1 ? char + '\n' : char)).join('');
  };

  // Function to rasterize a triangle
  const rasterizeTriangle = (triangle, zbuffer, output, charToPlot, width, height) => {
    // Extract vertices
    const [v0, v1, v2] = triangle;

    // Convert to integer pixel coordinates
    const x0 = Math.floor(v0[0]);
    const y0 = Math.floor(v0[1]);
    const z0 = v0[2];

    const x1 = Math.floor(v1[0]);
    const y1 = Math.floor(v1[1]);
    const z1 = v1[2];

    const x2 = Math.floor(v2[0]);
    const y2 = Math.floor(v2[1]);
    const z2 = v2[2];

    // Compute bounding box
    const minX = Math.max(0, Math.min(x0, x1, x2));
    const maxX = Math.min(width - 1, Math.max(x0, x1, x2));
    const minY = Math.max(0, Math.min(y0, y1, y2));
    const maxY = Math.min(height - 1, Math.max(y0, y1, y2));

    // Triangle area (double area)
    const area = edgeFunction(x0, y0, x1, y1, x2, y2);

    // Loop over bounding box
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        // Compute barycentric coordinates
        const w0 = edgeFunction(x1, y1, x2, y2, x, y);
        const w1 = edgeFunction(x2, y2, x0, y0, x, y);
        const w2 = edgeFunction(x0, y0, x1, y1, x, y);

        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
          // Normalize weights
          const alpha = w0 / area;
          const beta = w1 / area;
          const gamma = w2 / area;

          // Interpolate depth
          const z = alpha * z0 + beta * z1 + gamma * z2;

          const idx = x + y * width;
          if (z > zbuffer[idx]) {
            zbuffer[idx] = z;
            output[idx] = charToPlot;
          }
        }
      }
    }
  };

  // Edge function
  const edgeFunction = (x0, y0, x1, y1, x2, y2) => {
    return (x2 - x0) * (y1 - y0) - (x1 - x0) * (y2 - y0);
  };

  return (
    <pre style={{
      fontFamily: 'monospace',
      lineHeight: '8px',
      fontSize: '12px',
      color: 'white',
      backgroundColor: 'black',
      textAlign: 'center',
      padding: '0',
      margin: '0',
    }}>
      {asciiArt}
    </pre>
  );
};

export default RotatingCube;
