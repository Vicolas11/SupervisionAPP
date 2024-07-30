import React, { useState, useEffect, useRef } from "react";
import { constants } from "./constants.config";
import { BiImageAdd } from "react-icons/bi";
import { Detections } from "./interfaces";
import styles from "./app.module.scss";
import Loader from "./Loader";

const { baseURL } = constants;

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detections | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string|null>(null);

  useEffect(() => {
    if (imageSrc && detections) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Draw rectangles based on detections
          detections.xyxy.forEach((bbox, index) => {
            const [x1, y1, x2, y2] = bbox.map((value) => Math.round(value));
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 8;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            const className = detections.class_name[index];
            ctx.font = "18px Arial";
            ctx.fillStyle = "purple";
            ctx.fillText(className, x1, y1 - 10);
          });
        };
      }
    }
  }, [imageSrc, detections]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {      
      const type = event.target.files[0].type.split("/")[0];
      if (type !== "image") return
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        setImageSrc(e.target.result as string);
        const img = new Image();

        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            const payload = {
              width: img.width,
              height: img.height,
              data: Array.from(data),
            };

            try {
              const response = await fetch(`${baseURL}/detect_objects`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                setHasError("An error occurred!");
                setIsLoading(false);
                return;
              }

              const result: Detections = await response.json();
              setDetections(result);
              setIsLoading(false);
            } catch (err: any) {
              setIsLoading(false);
              setHasError(err.message || "An error occurred!");
            }
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageSrc(null);
    setFile(null);
    setDetections(null);
    setHasError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div>
          <h2>Roboflow Supervision Object Detector</h2>
          <p>
            Roboflow Supervision Object Detector is a powerful tool for
            automating the process of identifying and classifying objects within
            images. This technology leverages advanced machine learning models
            and computer vision algorithms to enable users to train, evaluate,
            and deploy object detection models efficiently.
          </p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.imgContainer}>
            {!file && <BiImageAdd size={74} />}
            {file && !imageSrc && !isLoading && (
              <img src={URL.createObjectURL(file)} alt="img_display" />
            )}
            {imageSrc &&
              !isLoading &&
              !hasError &&
              detections &&
              detections?.xyxy?.length > 0 && <canvas ref={canvasRef}></canvas>}
            {hasError && !isLoading && <h2 className={styles.hasError}>{hasError}</h2>}
            {detections && detections?.xyxy?.length === 0 && (
              <h2 className={styles.noDetection}>No Detection Made!</h2>
            )}
            {isLoading && (
              <h2 className={styles.noDetection}>Please wait...</h2>
            )}
          </div>
          <div className={styles.btnContainer}>
            <input
              id="uploadImg"
              type="file"
              onChange={handleFileChange}
              hidden
              accept="image/*"
              disabled={!!file}
            />

            <button type="button" disabled={!!file}>
              <label htmlFor="uploadImg">Upload Image</label>
            </button>

            <button
              className={styles.btnReset}
              type="button"
              disabled={!!!file || isLoading}
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="button"
              disabled={!!!file || isLoading}
              onClick={handleSubmit}
            >
              {isLoading && <Loader />}
              {isLoading ? "Detecting..." : "Detect Object"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
