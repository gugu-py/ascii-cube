// RotatingCube.js
import React, { useState, useEffect } from 'react';

// ASCII characters to represent brightness from darkest to brightest
const brightnessChars = ".,-~:;=!*#$@";

const RotatingCube = () => {
  const [asciiArt, setAsciiArt] = useState('');
  const [A, setA] = useState(0);
  const [B, setB] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setA((prevA) => prevA + Math.random() * 0.1);
      setB((prevB) => prevB + Math.random() * 0.1);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ascii = generateAsciiCube(A, B);
    setAsciiArt(ascii);
  }, [A, B]);

  const generateAsciiCube = (A, B) => {
    // Cube vertices
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    // const vertices = [
    //     [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
    //     [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
    //   ];

    // Projection constants
    const K1 = 200; // Adjusted scaling factor for better fit
    const K2 = 9;  // Distance to the viewer
    const width = 100;  // Adjusted width of ASCII grid
    const height = 100; // Adjusted height of ASCII grid

    let zbuffer = Array.from({ length: width * height }, () => 0);
    let output = Array.from({ length: width * height }, () => ' ');

    // Rotation matrices for the X and Z axes
    const rotateX = (point, angle) => {
      const [x, y, z] = point;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return [x, y * cosA - z * sinA, y * sinA + z * cosA];
    };

    const rotateZ = (point, angle) => {
      const [x, y, z] = point;
      const cosB = Math.cos(angle);
      const sinB = Math.sin(angle);
      return [x * cosB - y * sinB, x * sinB + y * cosB, z];
    };

    // Light direction (arbitrary)
    const lightDir = [0, 1, -1];

    const project3D = (point) => {
      const [x, y, z] = point;
      const factor = K1 / (K2 + z); // Perspective projection
      return [Math.floor((x * factor + width / 2)), Math.floor((y * factor + height / 2))];
    };

    const normalize = (v) => {
      const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return v.map((i) => i / length);
    };

    const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

    const calculateBrightness = (normal) => {
      const normalizedNormal = normalize(normal);
      const brightness = dotProduct(normalizedNormal, normalize(lightDir));
      return Math.max(0, brightness); // Make sure brightness is non-negative
    };

    // Cube faces defined by vertex indices
    const faces = [
      [0, 1, 2, 3], [4, 5, 6, 7], // Front and back
      [0, 1, 5, 4], [1, 2, 6, 5], // Sides
      [2, 3, 7, 6], [3, 0, 4, 7], // Sides
    ];

    for (let face of faces) {
      const v0 = rotateZ(rotateX(vertices[face[0]], A), B);
      const v1 = rotateZ(rotateX(vertices[face[1]], A), B);
      const v2 = rotateZ(rotateX(vertices[face[2]], A), B);
      const v3 = rotateZ(rotateX(vertices[face[3]], A), B);

      const p0 = project3D(v0);
      const p1 = project3D(v1);
      const p2 = project3D(v2);
      const p3 = project3D(v3);

      // Calculate normal (cross product of edges)
      const normal = [
        (v1[1] - v0[1]) * (v2[2] - v0[2]) - (v1[2] - v0[2]) * (v2[1] - v0[1]),
        (v1[2] - v0[2]) * (v2[0] - v0[0]) - (v1[0] - v0[0]) * (v2[2] - v0[2]),
        (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v1[1] - v0[1]) * (v2[0] - v0[0])
      ];

      const brightness = calculateBrightness(normal);
      const luminanceIndex = Math.floor(brightness * (brightnessChars.length - 1));

      const charToPlot = brightnessChars[luminanceIndex];

      // Draw each face's vertices
      drawLine(p0, p1, zbuffer, output, charToPlot, width, height);
      drawLine(p1, p2, zbuffer, output, charToPlot, width, height);
      drawLine(p2, p3, zbuffer, output, charToPlot, width, height);
      drawLine(p3, p0, zbuffer, output, charToPlot, width, height);
    }

    // Convert the output array into a string for rendering
    return output.map((char, i) => (i % width === 0 ? '\n' + char : char)).join('');
  };

  // Bresenham's line algorithm to draw lines between two points in the ASCII grid
  const drawLine = (p0, p1, zbuffer, output, charToPlot, width, height) => {
    let [x0, y0] = p0;
    let [x1, y1] = p1;
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      const idx = x0 + y0 * width;
      if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height && zbuffer[idx] < 1) {
        zbuffer[idx] = 1; // Assume z = 1 for simplicity
        output[idx] = charToPlot;
      }
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  return (
    <pre style={{ fontFamily: 'monospace', lineHeight: '7px', fontSize: '12px', color: '#fff' }}>
      {asciiArt}
    </pre>
  );
};

export default RotatingCube;
