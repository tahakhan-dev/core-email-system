import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../assets/CSS/DemoDashboard.css"; // Importing custom CSS
import { toast } from "react-toastify";
import io from "socket.io-client";
import axios from "axios";
import {
  redirectToMicrosoft,
  syncOutlookEmails,
  getUserProfile,
  getAllUsers,
} from "@/services/api"; // Assuming getAllUsers fetches the emails

// Define the Email interface
interface Email {
  id: number;
  emailId: string;
  userId: number;
  userName: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  importance: string;
  receivedDateTime: string;
  timeStamp: string;
  read: boolean;
  hasAttachments: boolean;
}

const DemoDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate to programmatically navigate
  const [emailConnected, setEmailConnected] = useState(false); // State for connection status
  const [isEmailSync, setisEmailSync] = useState(false);
  const [emailData, setEmailData] = useState<Email[]>([]); // State for email data
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [ackMessage, setAckMessage] = useState(false);
  const [updateEmailAck, setUpdateEmailAck] = useState(false);
  const [ackMessageLoading, setAckMessageLoading] = useState(false);

  const rowsPerPage = 10; // Rows per page
  const auth2Token = localStorage.getItem("authToken");

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      authorization: auth2Token as any,
    },
  });

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const uniqueIdentifier = localStorage.getItem("deviceId");
    const userId: any = localStorage.getItem("userId");

    try {
      socket.on("message", (message) => {
        let socketUserId = message.userId;
        let lastDataInserted = message.lastDataInserted;

        if (lastDataInserted && +userId === +socketUserId) {
          localStorage.setItem("emailConnected", "true");
          localStorage.setItem("isEmailSync", "true");
          setAckMessage(true);
        }
      });
      // Open WebSocket connection
    } catch (error) {
      console.log("Error while syncing email", error);
    }

    try {
      socket.on("mutateEmail", (message) => {
        let socketUserId = message.userId;

        if (+userId === +socketUserId) {
          setUpdateEmailAck(true);
        }
      });
      // Open WebSocket connection
    } catch (error) {
      console.log("Error while syncing email", error);
    }

    const syncingUserEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const success = queryParams.get("success");
      if (success === "email") {
        setEmailConnected(true); // Update state
        localStorage.setItem("emailConnected", "true");
        try {
          let getUserProfileResponse = await getUserProfile(
            authToken,
            uniqueIdentifier
          );
          if (!getUserProfileResponse?.data?.result[0]?.isEmailSync) {
            setAckMessageLoading(true);
            await syncOutlookEmails(authToken, uniqueIdentifier);
            setisEmailSync(true);
            localStorage.setItem("isEmailSync", "true");
          } else {
            setisEmailSync(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
        console.log("Email success detected!");
      }
    };
    syncingUserEmail();
  }, [location]);

  useEffect(() => {
    const checkEmailConnection = async () => {
      const isConnected = localStorage.getItem("emailConnected") === "true";
      const isEmailSyncLocal = localStorage.getItem("isEmailSync") === "true";

      if ((isConnected && isEmailSyncLocal) || isEmailSync) {
        setEmailConnected(true);
        setisEmailSync(true);
        try {
          await getAllUserEmail(); // Fetch emails when connected
          console.log("Emails fetched successfully.");
        } catch (error) {
          console.error("Error fetching emails:", error);
        }
      } else if (isConnected) {
        setEmailConnected(true);
      }
    };
    checkEmailConnection();
  }, []);

  useEffect(() => {
    const ackMessageConnection = async () => {
      const isConnected = localStorage.getItem("emailConnected") === "true";
      const isEmailSyncLocal = localStorage.getItem("isEmailSync") === "true";

      if (ackMessage) {
        if ((isConnected && isEmailSyncLocal) || isEmailSync) {
          setEmailConnected(true);
          setisEmailSync(true);
          try {
            await getAllUserEmail(); // Fetch emails when connected
            setAckMessageLoading(false);
            console.log("Emails fetched successfully.");
          } catch (error) {
            console.error("Error fetching emails:", error);
          }
        } else if (isConnected) {
          setEmailConnected(true);
        }
      }
    };
    ackMessageConnection();
  }, [ackMessage]);

  useEffect(() => {
    const updateMessageConnection = async () => {
      if (updateEmailAck) {
        try {
          await getAllUserEmail(); // Fetch emails when connected
          setUpdateEmailAck(false);
          console.log("Emails fetched successfully.");
        } catch (error) {
          console.error("Error fetching emails:", error);
        }
      }
    };
    updateMessageConnection();
  }, [updateEmailAck]);

  const getAllUserEmail = async () => {
    const authToken = localStorage.getItem("authToken");
    const uniqueIdentifier = localStorage.getItem("deviceId");
    if (!authToken) {
      alert("You are not logged in or your session has expired.");
      return;
    }

    try {
      const response = await getAllUsers(authToken, uniqueIdentifier);
      if (response?.data?.result) {
        const sortedEmails = sortEmailsByEmailReceivedDateTime(
          response?.data?.result
        );
        setEmailData(sortedEmails);
      } else {
        alert("No Data found");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error connecting to Microsoft");
      }
      return false;
    }
  };

  const handleConnect = async () => {
    const authToken = localStorage.getItem("authToken");
    const uniqueIdentifier = localStorage.getItem("deviceId");
    if (!authToken) {
      alert("You are not logged in or your session has expired.");
      return;
    }

    try {
      const response = await redirectToMicrosoft(authToken, uniqueIdentifier);
      if (response?.data) {
        window.location.href = response.data;
      } else {
        alert("No redirect URL provided");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error connecting to Microsoft");
      }
      return false;
    }
  };

  // Calculate the data for the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentEmailData = emailData.slice(indexOfFirstRow, indexOfLastRow);

  // Function to handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Function to generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(emailData.length / rowsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove authToken from localStorage
    localStorage.removeItem("emailConnected"); // Remove emailConnected from localStorage if needed
    localStorage.removeItem("isEmailSync"); // Remove isEmailSync from localStorage if needed
    navigate("/login"); // Redirect to the login page
  };

  function sortEmailsByEmailReceivedDateTime(emails: any[]): any[] {
    return emails.sort((a, b) => {
      // Convert receivedDateTime strings to Date objects for comparison
      const dateA = new Date(a.receivedDateTime);
      const dateB = new Date(b.receivedDateTime);

      // Sort in descending order
      return dateB.getTime() - dateA.getTime();
    });
  }

  return (
    <div className="dashboard">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h1 className="title">Welcome To Email Core System</h1>
      {emailConnected ? (
        <div>
          <p style={{ color: "green", fontSize: "18px", fontWeight: "bold" }}>
            Your account is connected with Microsoft.
          </p>
          {ackMessageLoading && (
            <p
              style={{
                color: "grey",
                fontSize: "18px",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              Your Email Is Syncing With Local ...
            </p>
          )}
          {isEmailSync && (
            <p style={{ color: "blue", fontSize: "16px" }}>
              Your all emails are synced.
            </p>
          )}
        </div>
      ) : (
        <button className="connect-button" onClick={handleConnect}>
          Connect Your Outlook Account With Local
        </button>
      )}
      {isEmailSync && (
        <>
          <div className="table-container">
            <table className="emails-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Body</th>
                  <th>Importance</th>
                  <th>Has Attachments</th>
                  <th>Read</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                {currentEmailData.map((email) => (
                  <tr key={email.id} className={email.read ? "read" : "unread"}>
                    <td>{email.userName}</td>
                    <td>{email.sender}</td>
                    <td>{email.recipient}</td>
                    <td>{email.subject}</td>
                    <td>{email.body}</td>
                    <td>{email.importance}</td>
                    <td>{email.hasAttachments ? "Yes" : "No"}</td>
                    <td>{email.read ? "Yes" : "No"}</td>
                    <td>{new Date(email.receivedDateTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`page-number ${
                  number === currentPage ? "active" : ""
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DemoDashboard;
