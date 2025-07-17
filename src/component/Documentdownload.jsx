/** @jsxRuntime classic */
/** @jsx React.createElement */


import axios from "axios";
import { saveAs } from "file-saver";
import  React, { useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";

const DocumentDownload = ({ applicantId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/documents/download/${applicantId}`, {
        responseType: "blob",
      });
      saveAs(response.data, `lease-agreement-${applicantId}.pdf`);
    } catch (error) {
      setError("Error downloading document. Please try again later.");
      console.error("Error downloading document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={handleDownloadDocument} disabled={loading}>
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="me-2" />
            Download Lease Agreement
          </>
        )}
      </Button>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </div>
  );
};

export default DocumentDownload;