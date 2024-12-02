import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface Response {
      expr: string;
      result: string;
      assign: boolean;
}

interface GeneratedResult {
      expression: string;
      answer: string;
}

export default function Home() {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const [isDrawing, setIsDrawing] = useState(false);
      const [color, setColor] = useState("rgb(255, 255, 255)");
      const [reset, setReset] = useState(false);
      const [results, setResults] = useState<GeneratedResult>();
      const [dictOfVars, setDictOfVars] = useState({});

      // Reset the canvas when the reset state changes
      useEffect(() => {
            if (reset) {
                  resetCanvas();
                  setReset(false);
            }
      }, [reset]);

      // Initialize canvas and handle resizing
      useEffect(() => {
            const resizeCanvas = () => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                        const ctx = canvas.getContext("2d");
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        if (ctx) {
                              ctx.lineCap = "round";
                              ctx.lineWidth = 3;
                              ctx.fillStyle = "black";
                              ctx.fillRect(0, 0, canvas.width, canvas.height); // Set initial background color
                        }
                  }
            };

            resizeCanvas(); // Initialize on mount
            window.addEventListener("resize", resizeCanvas); // Update on resize
            return () => window.removeEventListener("resize", resizeCanvas);
      }, []);

      const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                        ctx.beginPath();
                        ctx.moveTo(
                              e.nativeEvent.offsetX,
                              e.nativeEvent.offsetY
                        );
                        setIsDrawing(true);
                  }
            }
      };

      const stopDrawing = () => {
            setIsDrawing(false);
      };

      const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!isDrawing) return;

            const canvas = canvasRef.current;
            if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                        ctx.strokeStyle = color; // Use the selected color
                        ctx.lineTo(
                              e.nativeEvent.offsetX,
                              e.nativeEvent.offsetY
                        );
                        ctx.stroke();
                  }
            }
      };

      const resetCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                        ctx.fillStyle = "black"; // Reset background color
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                  }
            }
      };

      const sendData = async () => {
            const canvas = canvasRef.current;
            if (canvas) {
                  try {
                        const response = await axios.post(
                              `${import.meta.env.VITE_API_URL}/calculate`,
                              {
                                    image: canvas.toDataURL("image/png"),
                                    dict_Of_Vars: dictOfVars,
                              }
                        );
                        const resp = await response.data;
                        setResults(resp);
                        console.log("API Response:", resp);
                  } catch (error) {
                        console.error("Error sending data:", error);
                  }
            }
      };

      return (
            <>
                  {/* Top Controls */}
                  <div
                        style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              justifyItems: "space-between",
                              padding: "16px",
                              position: "absolute",
                              top: "0",
                              left: "0",
                              zIndex: 20,
                              width: "100%",
                              height: "10%",
                        }}
                  >
                        {/* Reset Button */}
                        <Button
                              onClick={() => setReset(true)}
                              className="bg-black text-white"
                              variant="default"
                              style={{
                                    backgroundColor: "black",
                                    color: "white",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                              }}
                        >
                              Reset
                        </Button>

                        {/* Color Picker */}
                        <Group
                              className="justify-center"
                              style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "8px",
                              }}
                        >
                              {SWATCHES.map((swatchColor: string) => (
                                    <ColorSwatch
                                          key={swatchColor}
                                          color={swatchColor}
                                          onClick={() => setColor(swatchColor)}
                                          style={{
                                                cursor: "pointer",
                                                border: "2px solid #fff", // Optional border for better visibility
                                          }}
                                    />
                              ))}
                        </Group>

                        {/* Calculate Button */}
                        <Button
                              onClick={sendData}
                              className="bg-black text-white"
                              variant="default"
                              style={{
                                    backgroundColor: "black",
                                    color: "white",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                              }}
                        >
                              Calculate
                        </Button>
                  </div>
                  {/* Full-Screen Canvas */}
                  <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseOut={stopDrawing}
                        onMouseUp={stopDrawing}
                  />
            </>
      );
}
