import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { triggerPhishingSimulation, connectToPhishingLogs } from "../services/api";
import Footer from "../components/Footer";

/**
 * Phishing Execution Page
 *  - Subscribes to SSE logs for the given userId.
 *  - Executes the phishing simulation call when SSE is ready.
 */
function PhishingExecution() {
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // 1. Retrieve necessary data (emailBody + userId).
  //    By default, we fetch userId from localStorage in `connectToPhishingLogs()`,
  //    but it’s cleaner if you pass it explicitly:
  // ---------------------------------------------------------------------------
  const emailBody = location.state?.emailBody || "";
  const userIdRef = useRef(localStorage.getItem("userId")); 
    // You could also parse it from location.state if you stored it there.

  // ---------------------------------------------------------------------------
  // 2. Internal state and refs for typed logs + SSE controlling
  // ---------------------------------------------------------------------------
  const [typedLog, setTypedLog] = useState(
    emailBody ? "" : "🐰 You haven't followed the white rabbit yet, Neo...\n"
  );
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isSSEReady, setIsSSEReady] = useState(false);

  // We queue up logs so they appear in order, slowly:
  const logQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  // Ensure we only trigger the phishing attack once:
  const hasRun = useRef(false);

  // Keep the SSE connection reference:
  const eventSourceRef = useRef(null);

  // ---------------------------------------------------------------------------
  // 3. Show Easter egg if no emailBody
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!emailBody) {
      logQueue.current.push("🐰 You haven't followed the white rabbit yet, Neo...\n");
      processNextLog();
    }
  }, [emailBody]);

  // ---------------------------------------------------------------------------
  // 4. Blinking cursor effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  // ---------------------------------------------------------------------------
  // 5. Establish SSE connection once (when we have emailBody + userId).
  //    If either is missing, we skip connecting altogether.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const userId = userIdRef.current;
    if (!userId || !emailBody || eventSourceRef.current) {
      return; // Skip if no userId, no emailBody, or SSE is already created
    }

    console.log(`🔌 Connecting to SSE logs for userId ${userId}...`);
    eventSourceRef.current = connectToPhishingLogs(userId);

    eventSourceRef.current.onopen = () => {
      console.log("✅ SSE Connection Established.");
      setIsSSEReady(true);
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("❌ SSE Connection Error:", err);
      // We’ll close the connection & mark SSE as not ready
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsSSEReady(false);
    };

    // Cleanup when unmounting (or if effect runs again, which is unlikely here):
    return () => {
      console.log("SSE effect cleanup: closing connection...");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log("🔌 SSE Connection Closed.");
      }
    };
  }, [emailBody]); // No [userId], because userId is in a ref

  // ---------------------------------------------------------------------------
  // 6. On SSE messages, push logs into the queue
  //    (You can adapt `connectToPhishingLogs(userId)` to do this, or keep it here.)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Guard: if there's no event source yet, do nothing
    if (!eventSourceRef.current) return;

    const source = eventSourceRef.current;

    source.onmessage = (event) => {
      const message = event.data.trim();
      if (message && message !== "undefined") {
        console.log("📥 Received SSE log:", message);
        logQueue.current.push(message + "\n");
        processNextLog();
      }
    };

    // No need for a local cleanup, because we do a single close above
  }, [isSSEReady]); 
  // We only set up these handlers once SSE is at least created

  // ---------------------------------------------------------------------------
  // 7. Start phishing attack once SSE is ready (only run 1x)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    console.log(
      "Phishing Attack Effect Check:",
      "emailBody =", emailBody,
      "isSSEReady =", isSSEReady,
      "hasRun.current =", hasRun.current
    );
    if (!emailBody || !isSSEReady || hasRun.current) return;
    hasRun.current = true;

    console.log("🚀 Starting phishing attack...");
    triggerPhishingSimulation(emailBody)
      .then((response) => {
        if (response.data.success) {
          logQueue.current.push("✅ ATTACK SUCCESSFUL. Check EvilGinx!\n");
        } else {
          const err = response.data.error || "Phishing attack blocked.";
          logQueue.current.push(`❌ ERROR: ${err}\n`);
        }
        processNextLog();
      })
      .catch((err) => {
        console.error("❌ Phishing attack failed:", err);
        logQueue.current.push("❌ ERROR: PHISHING ATTACK FAILED.\n");
        processNextLog();
      });
  }, [emailBody, isSSEReady]);

  // ---------------------------------------------------------------------------
  // 8. Process logs in a "typewriter" style (or just append all if you prefer)
  // ---------------------------------------------------------------------------
  function processNextLog() {
    if (isProcessingQueue.current || logQueue.current.length === 0) return;
    isProcessingQueue.current = true;

    // Dequeue the next log entry
    const nextEntry = logQueue.current.shift();
    setTypedLog((prev) => prev + nextEntry);

    // Delay the next chunk to mimic "typing"
    setTimeout(() => {
      isProcessingQueue.current = false;
      processNextLog();
    }, 300);
  }

  // ---------------------------------------------------------------------------
  // 9. Render
  // ---------------------------------------------------------------------------
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
            {typedLog.slice(0, -1)} {cursorVisible ? "█" : ""}
          </pre>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PhishingExecution;
