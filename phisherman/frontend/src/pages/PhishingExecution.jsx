import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { triggerPhishingSimulation, connectToPhishingLogs } from "../services/api";
import Footer from "../components/Footer";

/**
 * Phishing Execution Page
 * Streams real-time SSE logs while maintaining correct order.
 */
function PhishingExecution() {
  const location = useLocation();
  const emailBody = location.state?.emailBody;
  const logQueue = useRef([]); // ✅ Queue to keep logs in order
  const isProcessingQueue = useRef(false); // ✅ Ensures real-time log streaming
  const [typedLog, setTypedLog] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const hasRun = useRef(false);
  const sseConnected = useRef(false);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // ✅ Ensure Easter egg is displayed if no emailBody
  useEffect(() => {
    if (!emailBody) {
      logQueue.current.push("🐰 You haven't followed the white rabbit yet, Neo...\n");
      processNextLog();
    }
  }, [emailBody]);

  // ✅ Connect to SSE logs BEFORE starting the attack
  useEffect(() => {
    if (!emailBody || sseConnected.current) return;
    sseConnected.current = true;

    const eventSource = connectToPhishingLogs();

    eventSource.onmessage = (event) => {
      let message = event.data.trim();
      if (message && message !== "undefined") {
        console.log("📥 Received SSE log:", message);
        logQueue.current.push(message + "\n"); // ✅ Add logs to queue with newline
        processNextLog(); // ✅ Immediately process the next log
      }
    };

    eventSource.onerror = () => {
      console.error("❌ Lost connection to log stream.");
      logQueue.current.push("❌ CONNECTION LOST.\n"); // ✅ Ensure disconnection logs appear
      processNextLog();
      eventSource.close();
      sseConnected.current = false;
    };

    return () => {
      eventSource.close();
      sseConnected.current = false;
    };
  }, [emailBody]); // ✅ Establishes SSE connection first

  // ✅ Start phishing attack only AFTER SSE is connected
  useEffect(() => {
    if (!emailBody || hasRun.current || !sseConnected.current) return;
    hasRun.current = true;

    setTimeout(async () => {
      try {
        await triggerPhishingSimulation(emailBody);
        logQueue.current.push("✅ ATTACK SUCCESSFUL. Check EvilGinx!\n");
        processNextLog();
      } catch (err) {
        logQueue.current.push("❌ ERROR: PHISHING ATTACK FAILED.\n");
        processNextLog();
        console.error("Error executing phishing attack:", err);
      }
    }, 500); // ✅ Slight delay to ensure logs are received first
  }, [emailBody, sseConnected.current]); // ✅ Ensures SSE is connected first

  // ✅ Stream logs in real-time while maintaining correct order
  const processNextLog = () => {
    if (isProcessingQueue.current || logQueue.current.length === 0) return;
    isProcessingQueue.current = true;

    let logEntry = logQueue.current.shift(); // ✅ Take the first log in the queue
    setTypedLog((prev) => prev + logEntry); // ✅ Append log entry with newline

    setTimeout(() => {
      isProcessingQueue.current = false;
      processNextLog(); // ✅ Process next log immediately after delay
    }, 300); // ✅ Controls real-time display speed
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6 flex flex-col justify-between">
      <div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {emailBody ? "[ HACKER TERMINAL ]" : "[ FOLLOW THE WHITE RABBIT ]"}
          </h1>
        </div>

        <div className="bg-black border border-green-500 p-4 rounded-lg shadow-lg max-h-96 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {typedLog.slice(0, -1)} {cursorVisible ? "█" : ""} {/* ✅ Cursor stays at the end */}
          </pre>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PhishingExecution;
