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
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];

    // Projection constants
    const K1 = 200; // Adjusted scaling factor
    const K2 = 9;  // Distance to the viewer
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
      return [Math.floor((x * factor) + width / 2), Math.floor((-y * factor) + height / 2)];
    };

    const normalize = (v) => {
      const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
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
      { indices: [0, 4, 7, 3], normal: [-1, 0, 0] }, // Left face
      { indices: [3, 2, 6, 7], normal: [0, 1, 0] },  // Top face
      { indices: [0, 1, 5, 4], normal: [0, -1, 0] }, // Bottom face
    ];

    for (let face of faces) {
      const { indices, normal } = face;

      // Rotate normal
      let rotatedNormal = rotateX(normal, A);
      rotatedNormal = rotateY(rotatedNormal, B);

      const brightness = calculateBrightness(rotatedNormal);
      if (brightness <= 0) continue; // Back-face culling

      const luminanceIndex = Math.floor(brightness * (brightnessChars.length - 1));
      const charToPlot = brightnessChars[luminanceIndex];

      // Sample points across the face
      const steps = 15; // Adjust for resolution
      for (let i = 0; i < steps; i++) {
        for (let j = 0; j < steps; j++) {
          const u = i / (steps - 1);
          const v = j / (steps - 1);

          // Bilinear interpolation between the vertices
          let point = [0, 0, 0];
          for (let k = 0; k < 4; k++) {
            const weight = ((k === 0) ? (1 - u) * (1 - v) :
                            (k === 1) ? u * (1 - v) :
                            (k === 2) ? u * v :
                                        (1 - u) * v);
            const vertex = vertices[indices[k]];
            point = point.map((coord, idx) => coord + vertex[idx] * weight);
          }

          // Rotate point
          point = rotateX(point, A);
          point = rotateY(point, B);

          const [xp, yp] = project3D(point);

          const idx = xp + yp * width;
          if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
            const z = point[2];
            if (z > zbuffer[idx]) {
              zbuffer[idx] = z;
              output[idx] = charToPlot;
            }
          }
        }
      }
    }

    // Convert the output array into a string for rendering
    return output.map((char, i) => (i % width === width - 1 ? char + '\n' : char)).join('');
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
